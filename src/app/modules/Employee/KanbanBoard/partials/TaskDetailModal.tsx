import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { Separator } from '@/app/components/ui/separator'
import { Calendar, User, Star, ClipboardList, Paperclip, Check } from 'lucide-react'
import type { MyTask } from '@/app/modules/Employee/MyTasks/models/myTask.type'

interface TaskDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: MyTask | null
  onTaskUpdated?: () => void
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'todo':
      return {
        statusColor: 'bg-gray-500',
        displayText: 'To Do'
      }
    case 'doing':
      return {
        statusColor: 'bg-blue-600',
        displayText: 'In Progress'
      }
    case 'reviewing':
      return {
        statusColor: 'bg-purple-600',
        displayText: 'Reviewing'
      }
    case 'rejected':
      return {
        statusColor: 'bg-red-600',
        displayText: 'Rejected'
      }
    case 'completed':
      return {
        statusColor: 'bg-green-600',
        displayText: 'Completed'
      }
    case 'feedbacked':
      return {
        statusColor: 'bg-orange-600',
        displayText: 'Feedback'
      }
    case 'overdued':
      return {
        statusColor: 'bg-red-800',
        displayText: 'Overdued'
      }
    default:
      return {
        statusColor: 'bg-gray-500',
        displayText: 'Unknown'
      }
  }
}

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'low':
      return {
        priorityColor: 'bg-green-100 text-green-700 border border-green-600',
        displayText: 'Low'
      }
    case 'medium':
      return {
        priorityColor: 'bg-yellow-100 text-yellow-700 border border-yellow-600',
        displayText: 'Medium'
      }
    case 'high':
      return {
        priorityColor: 'bg-red-100 text-red-700 border border-red-600',
        displayText: 'High'
      }
    default:
      return {
        priorityColor: 'bg-gray-100 text-gray-700 border border-gray-600',
        displayText: 'Unknown'
      }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-CA')
}

export function TaskDetailModal({ open, onOpenChange, task }: TaskDetailModalProps) {
  if (!task) return null

  const statusStyles = getStatusStyles(task.status)
  const priorityStyles = getPriorityStyles(task.priority)

  const completedChecklists = task.checklists.filter((c) => c.is_completed && c.status === 'active').length
  const totalChecklists = task.checklists.filter((c) => c.status === 'active').length
  const checklistProgress = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0

  const comments = task.contents.filter((c) => c.type === 'comment' && c.status === 'active')
  const notes = task.contents.filter((c) => c.type === 'note' && c.status === 'active')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=' min-w-2xl max-h-[90vh] p-0 overflow-hidden'>
        <div className='p-6 pb-2 border-b border-gray-200'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-semibold'>{task.name}</DialogTitle>
          </DialogHeader>
        </div>

        <div className='overflow-y-auto max-h-[80vh] p-6 space-y-4'>
          {/* Task Description */}
          <div>
            <p className='text-gray-700 leading-relaxed'>{task.description || 'No description available'}</p>
          </div>

          <Separator />

          {/* Task Info */}
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <User className='w-4 h-4 text-blue-700' />
                <span className='text-sm font-semibold'>Assignee:</span>
                <span className='text-sm font-medium'>
                  {task.assignees.length > 0 ? task.assignees[0].user.name : 'Unassigned'}
                </span>
                {task.assignees.length > 0 && (
                  <Avatar className='w-6 h-6'>
                    <AvatarImage src={task.assignees[0].user.avatar_url} />
                    <AvatarFallback className='text-xs'>{task.assignees[0].user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div className='flex items-center space-x-2'>
                <Star className='w-4 h-4 text-blue-700' />
                <span className='text-sm font-semibold'>Status:</span>
                <Badge className={`${statusStyles.statusColor} text-white text-xs rounded-2xl px-2 py-1`}>
                  {statusStyles.displayText}
                </Badge>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Calendar className='w-4 h-4 text-blue-700' />
                <span className='text-sm font-semibold'>Deadline:</span>
                <span className='text-sm font-medium text-red-600'>{formatDate(task.due_at)}</span>
              </div>

              <div className='flex items-center space-x-2'>
                <Star className='w-4 h-4 text-blue-700' />
                <span className='text-sm font-semibold'>Priority:</span>
                <Badge className={`${priorityStyles.priorityColor} text-xs rounded-2xl px-2 py-1`}>
                  {priorityStyles.displayText}
                </Badge>
              </div>
            </div>
          </div>

          {/* Project Info */}
          {task.project_id && (
            <>
              <Separator />
              <div className='flex items-center space-x-2'>
                <ClipboardList className='w-4 h-4 text-blue-700' />
                <span className='text-sm font-semibold'>Project:</span>
                <span className='text-sm font-medium'>{task.project_id}</span>
              </div>
            </>
          )}

          <Separator />

          {/* Checklist */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Checklist ({completedChecklists}/{totalChecklists})
              </h3>
              {totalChecklists > 0 && (
                <div className='flex items-center space-x-2'>
                  <Progress value={checklistProgress} className='w-24 h-2' />
                  <span className='text-xs text-gray-500'>{Math.round(checklistProgress)}%</span>
                </div>
              )}
            </div>

            <div className='space-y-3'>
              {task.checklists
                .filter((c) => c.status === 'active')
                .map((item) => (
                  <div key={item.id} className='flex items-center space-x-3'>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        item.is_completed ? 'bg-green-600 border-green-600' : 'border-gray-300'
                      }`}
                    >
                      {item.is_completed && <Check className='w-3 h-3 text-white' />}
                    </div>
                    <span className={`text-sm ${item.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.title}
                    </span>
                  </div>
                ))}
            </div>

            {totalChecklists === 0 && <p className='text-sm text-gray-500'>No checklist items</p>}
          </div>

          <Separator />

          {/* Comments */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Comments ({comments.length})</h3>
            <div className='space-y-4'>
              {comments.map((comment) => (
                <div key={comment.id} className='flex space-x-3'>
                  <Avatar className='w-8 h-8'>
                    <AvatarImage src='/placeholder.svg' />
                    <AvatarFallback className='text-xs'>{comment.user_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <span className='text-sm font-medium'>User {comment.user_id}</span>
                      <span className='text-xs text-gray-500'>{formatDate(comment.created_at)}</span>
                    </div>
                    <p className='text-sm text-gray-700'>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {comments.length === 0 && <p className='text-sm text-gray-500'>No comments</p>}
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Notes ({notes.length})</h3>
            <div className='space-y-4'>
              {notes.map((note) => (
                <div key={note.id} className='flex space-x-3'>
                  <Avatar className='w-8 h-8'>
                    <AvatarImage src='/placeholder.svg' />
                    <AvatarFallback className='text-xs'>{note.user_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <span className='text-sm font-medium'>User {note.user_id}</span>
                      <span className='text-xs text-gray-500'>{formatDate(note.created_at)}</span>
                    </div>
                    <p className='text-sm text-gray-700'>{note.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {notes.length === 0 && <p className='text-sm text-gray-500'>No notes</p>}
          </div>

          <Separator />

          {/* Attachments */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Attachments ({task._count?.files || 0})</h3>
            </div>

            {task._count?.files > 0 ? (
              <div className='flex items-center space-x-2 text-sm text-gray-500'>
                <Paperclip className='w-4 h-4' />
                <span>{task._count.files} file(s) attached</span>
              </div>
            ) : (
              <p className='text-sm text-gray-500'>No attachments</p>
            )}
          </div>

          {/* All Assignees */}
          {task.assignees.length > 1 && (
            <>
              <Separator />
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>All Assignees ({task.assignees.length})</h3>
                <div className='flex flex-wrap gap-3'>
                  {task.assignees.map((assignee) => (
                    <div key={assignee.id} className='flex items-center space-x-2'>
                      <Avatar className='w-8 h-8'>
                        <AvatarImage src={assignee.user.avatar_url} />
                        <AvatarFallback className='text-xs'>{assignee.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className='text-sm font-medium'>{assignee.user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
