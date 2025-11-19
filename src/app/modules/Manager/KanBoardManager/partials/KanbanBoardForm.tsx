import { FilterDialog } from '@/app/modules/Employee/KanbanBoard/partials/FilterDialog'
import { ManagerKanbanCard } from './ManagerKanbanCard'
import { SortDialog } from '@/app/modules/Employee/KanbanBoard/partials/SortDialog'
import { TaskDetailModal } from './TaskDetailModal'
import { TaskCreateForm } from './TaskCreateForm'
import { TaskUpdateForm } from './TaskUpdateForm'
import { TaskDeleteModal } from './TaskDeleteModal'
import { ManagerKanbanColumn } from './ManagerKanbanColumn'
import { ReviewForm } from './ReviewForm'
import { RejectForm } from './RejectForm'
import { MyTaskApi } from '@/app/apis/AUTH/task-emp.api'
import type { MyTask, TaskStatus } from '@/app/modules/Employee/MyTasks/models/myTask.type'
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

export interface Tag {
  label: string
  color: string
}

export interface Card {
  id: string
  image?: string
  title: string
  tags: Tag[]
  subtasks: number
  comments: number
  avatars: string[]
  originalTask: MyTask
  isMyTask?: boolean
}

export interface Column {
  id: TaskStatus
  title: string
  cards: Card[]
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: []
  },
  {
    id: 'doing',
    title: 'In Progress',
    cards: []
  },
  {
    id: 'completed',
    title: 'Completed',
    cards: []
  },
  {
    id: 'rejected',
    title: 'Rejected',
    cards: []
  }
]

// Helper function to get priority color
const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'low':
      return 'green'
    case 'medium':
      return 'yellow'
    case 'high':
      return 'red'
    default:
      return 'gray'
  }
}

// Helper function to convert MyTask to Card
const convertTaskToCard = (task: MyTask): Card => {
  const tags: Tag[] = [
    {
      label: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
      color: getPriorityColor(task.priority)
    }
  ]

  return {
    id: task.id,
    image: task.image_url || undefined,
    title: task.name,
    tags,
    subtasks: task.checklists.length,
    comments: task.contents.length,
    avatars: task.assignees.map(
      (assignee) => assignee.user.avatar_url || `https://i.pravatar.cc/150?u=${assignee.user.id}`
    ),
    originalTask: task,
    isMyTask: true // Managers can drag all tasks
  }
}

export function KanbanBoardForm() {
  const queryClient = useQueryClient()
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'title' | 'subtasks' | 'comments'>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<MyTask | null>(null)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [updateTaskOpen, setUpdateTaskOpen] = useState(false)
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [selectedTaskOwnerId, setSelectedTaskOwnerId] = useState<string>('')
  const [selectedTaskForUpdate, setSelectedTaskForUpdate] = useState<MyTask | null>(null)
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<MyTask | null>(null)

  // Fetch tasks using TanStack Query
  const {
    data: tasksData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['manager-tasks'],
    queryFn: async () => {
      const response = await MyTaskApi.getAllTasksByManager()
      if (response.success && response.data) {
        return response.data
      }
      throw new Error('Failed to fetch tasks')
    }
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  )

  // Compute columns from query data
  const columns = useMemo(() => {
    if (!tasksData) return initialColumns

    // Group tasks by column based on status mapping
    const tasksByColumn: Record<string, Card[]> = {
      todo: [],
      doing: [],
      completed: [],
      rejected: []
    }

    tasksData.forEach((task) => {
      const card = convertTaskToCard(task)

      // Map task status to kanban columns
      switch (task.status) {
        case 'todo':
          tasksByColumn.todo.push(card)
          break
        case 'overdued':
          tasksByColumn.doing.push(card)
          break
        case 'doing':
          tasksByColumn.doing.push(card)
          break
        case 'reviewing':
        case 'completed':
        case 'feedbacked':
          tasksByColumn.completed.push(card)
          break
        case 'rejected':
          tasksByColumn.rejected.push(card)
          break
        default:
          // Default to todo if status is unknown
          tasksByColumn.todo.push(card)
          break
      }
    })

    // Update columns with tasks
    return initialColumns.map((column) => ({
      ...column,
      cards: tasksByColumn[column.id] || []
    }))
  }, [tasksData])

  const filteredAndSortedColumns = useMemo(() => {
    return columns.map((column) => {
      let filteredCards = column.cards

      // Apply tag filter
      if (selectedTags.length > 0) {
        filteredCards = filteredCards.filter((card) => card.tags.some((tag) => selectedTags.includes(tag.label)))
      }

      // Apply sorting
      let sortedCards = [...filteredCards].sort((a, b) => {
        let comparison = 0
        if (sortBy === 'title') {
          comparison = a.title.localeCompare(b.title)
        } else if (sortBy === 'subtasks') {
          comparison = a.subtasks - b.subtasks
        } else if (sortBy === 'comments') {
          comparison = a.comments - b.comments
        }
        return sortOrder === 'asc' ? comparison : -comparison
      })

      // Special sorting for completed column: reviewing -> feedbacked -> completed
      if (column.id === 'completed') {
        const statusOrder = { reviewing: 1, feedbacked: 2, completed: 3 }
        sortedCards = sortedCards.sort((a, b) => {
          const aOrder = statusOrder[a.originalTask.status as keyof typeof statusOrder] || 999
          const bOrder = statusOrder[b.originalTask.status as keyof typeof statusOrder] || 999
          return aOrder - bOrder
        })
      }

      return { ...column, cards: sortedCards }
    })
  }, [columns, selectedTags, sortBy, sortOrder])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    columns.forEach((column) => {
      column.cards.forEach((card) => {
        card.tags.forEach((tag) => tags.add(tag.label))
      })
    })
    return Array.from(tags).sort()
  }, [columns])

  const handleViewDetail = (taskId: string) => {
    const task = columns.flatMap((col) => col.cards).find((card) => card.id === taskId)?.originalTask
    if (task) {
      setSelectedTaskForDetail(task)
      setDetailModalOpen(true)
    }
  }

  const handleReview = async (taskId: string, taskOwnerId: string) => {
    try {
      const response = await MyTaskApi.getTaskById(taskId)
      if (response.success && response.data) {
        setSelectedTaskId(taskId)
        setSelectedTaskOwnerId(taskOwnerId)
        setReviewModalOpen(true)
      }
      console.log('checkk')
    } catch (error) {
      console.error('Error fetching task details:', error)
    }
  }

  const handleReject = async (taskId: string) => {
    // First call /task/:id to get task details
    try {
      const response = await MyTaskApi.getTaskById(taskId)
      if (response.success && response.data) {
        setSelectedTaskId(taskId)
        setRejectModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching task details:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    // Find task in current columns
    const task = columns.flatMap((col) => col.cards).find((card) => card.id === taskId)?.originalTask
    if (task) {
      setSelectedTaskForDelete(task)
      setDeleteTaskOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedTaskForDelete) return

    try {
      await MyTaskApi.deleteTask(selectedTaskForDelete.id)

      // Close modal and reset state
      setDeleteTaskOpen(false)
      setSelectedTaskForDelete(null)

      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['manager-tasks'] })
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task. Please try again.')
    }
  }

  const handleEdit = async (taskId: string) => {
    // Find task in current columns
    const task = columns.flatMap((col) => col.cards).find((card) => card.id === taskId)?.originalTask
    if (task) {
      setSelectedTaskForUpdate(task)
      setUpdateTaskOpen(true)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = columns.flatMap((col) => col.cards).find((card) => card.id === active.id)
    setActiveCard(card || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeCardId = active.id as string
    const overColumnId = over.id as TaskStatus
    if (!activeCardId || !overColumnId) return

    if (overColumnId === 'rejected') {
      toast.error('You cannot move tasks directly to the Rejected column.')
      return
    }

    // Find source column and card
    let sourceColumn: Column | undefined

    for (const column of columns) {
      const card = column.cards.find((c) => c.id === activeCardId)
      if (card) {
        sourceColumn = column
        break
      }
    }

    if (!sourceColumn) return
    if (sourceColumn.id === 'rejected') {
      toast.error('You cannot move tasks out of the Rejected column.')
      return
    }

    // Find target column
    const targetColumn = columns.find((col) => col.id === overColumnId)
    if (!targetColumn) return
    if (targetColumn.id === 'rejected') {
      toast.error('You cannot move tasks directly to the Rejected column.')
      return
    }

    // Don't do anything if dropping in the same column
    if (sourceColumn.id === targetColumn.id) return

    // Map column ID to task status for API
    // When dropped to "completed" column, set status as "reviewing" instead
    let newTaskStatus: TaskStatus
    if (overColumnId === 'completed') {
      newTaskStatus = 'reviewing'
    } else {
      newTaskStatus = overColumnId
    }

    // Call API to update task status
    try {
      await MyTaskApi.updateTaskStatus(activeCardId, newTaskStatus)
      console.log(`Task ${activeCardId} status updated to ${newTaskStatus}`)
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['manager-tasks'] })
      toast.success('Task status updated successfully')
    } catch (error) {
      console.error('Failed to update task status:', error)
      toast.error('Failed to update task status. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-full bg-background items-center justify-center'>
        <div className='text-lg'>Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-full bg-background items-center justify-center'>
        <div className='text-lg text-red-500'>{error.message || 'Failed to fetch tasks'}</div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full bg-background'>
      <div className='flex-1 p-6 flex flex-col'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Kanban Board</h1>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setCreateTaskOpen(true)}
              className='flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm hover:bg-primary/90'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              Create Task
            </button>
            <button className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
              My tickets
            </button>
            <button
              onClick={() => setFilterOpen(true)}
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                />
              </svg>
              Filter
              {selectedTags.length > 0 && (
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'>
                  {selectedTags.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSortOpen(true)}
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                />
              </svg>
              Sort
            </button>
            <button className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                />
              </svg>
              View
            </button>
            <button className='rounded-lg px-3 py-2 text-sm hover:bg-muted'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
                />
              </svg>
            </button>
          </div>
        </div>

        <div className='flex-1 min-h-0'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className='grid grid-cols-4 gap-6 h-full w-full'>
              {filteredAndSortedColumns.map((column) => (
                <div key={column.id} className='min-w-0'>
                  <ManagerKanbanColumn
                    column={column}
                    onViewDetail={handleViewDetail}
                    onReview={handleReview}
                    onReject={handleReject}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
            <DragOverlay
              dropAnimation={{
                duration: 300,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              {activeCard ? (
                <div className='transform scale-105 rotate-2 opacity-95 transition-all duration-200 shadow-2xl border-2 border-blue-400 rounded-lg overflow-hidden'>
                  <ManagerKanbanCard
                    id={activeCard.id}
                    image={activeCard.image}
                    title={activeCard.title}
                    tags={activeCard.tags}
                    subtasks={activeCard.subtasks}
                    comments={activeCard.comments}
                    avatars={activeCard.avatars}
                    originalTask={activeCard.originalTask}
                    onViewDetail={() => {}}
                    onReview={() => {}}
                    onReject={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        allTags={allTags}
        selectedTags={selectedTags}
        onSelectedTagsChange={setSelectedTags}
      />
      <SortDialog
        open={sortOpen}
        onOpenChange={setSortOpen}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />
      <TaskDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        task={selectedTaskForDetail}
        onTaskUpdated={() => queryClient.invalidateQueries({ queryKey: ['manager-tasks'] })}
      />

      {/* Task Create Modal */}
      {createTaskOpen && (
        <div className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'>
          <div className='bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <TaskCreateForm
              onSuccess={() => {
                setCreateTaskOpen(false)
                queryClient.invalidateQueries({ queryKey: ['manager-tasks'] })
              }}
              onCancel={() => setCreateTaskOpen(false)}
            />
          </div>
        </div>
      )}

      {reviewModalOpen && (
        <div className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'>
          <div className='bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <ReviewForm
              taskId={selectedTaskId}
              taskOwnerId={selectedTaskOwnerId}
              onSuccess={() => {
                setReviewModalOpen(false)
                queryClient.invalidateQueries({ queryKey: ['manager-tasks'] })
              }}
              onCancel={() => setReviewModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'>
          <div className='bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <RejectForm
              taskId={selectedTaskId}
              onSuccess={() => {
                setRejectModalOpen(false)
                queryClient.invalidateQueries({ queryKey: ['manager-tasks'] })
              }}
              onCancel={() => setRejectModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Update Task Modal */}
      {updateTaskOpen && selectedTaskForUpdate && (
        <div className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'>
          <div className='bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <TaskUpdateForm
              task={selectedTaskForUpdate}
              onSuccess={() => {
                setUpdateTaskOpen(false)
                queryClient.invalidateQueries({ queryKey: ['manager-tasks'] })
              }}
              onCancel={() => setUpdateTaskOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      <TaskDeleteModal
        open={deleteTaskOpen}
        onOpenChange={(open) => {
          setDeleteTaskOpen(open)
          if (!open) {
            setSelectedTaskForDelete(null)
          }
        }}
        taskName={selectedTaskForDelete?.name || ''}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
