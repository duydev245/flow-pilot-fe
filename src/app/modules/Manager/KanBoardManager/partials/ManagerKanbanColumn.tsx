import type { Column } from '@/app/modules/Manager/KanBoardManager/partials/KanbanBoardForm'
import { ManagerKanbanCard } from '@/app/modules/Manager/KanBoardManager/partials/ManagerKanbanCard'
import { useDroppable } from '@dnd-kit/core'

interface ManagerKanbanColumnProps {
  column: Column
  onViewDetail?: (taskId: string) => void
  onReview?: (taskId: string, taskOwnerId: string) => void
  onReject?: (taskId: string) => void
  onEdit?: (taskId: string) => void
  onDelete?: (taskId: string) => void
}

export function ManagerKanbanColumn({ column, onViewDetail, onReview, onReject, onEdit, onDelete }: ManagerKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id
  })

  return (
    <div className='flex flex-col'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-sm font-semibold'>{column.title}</h2>
        <span className='rounded-full bg-muted px-2 py-1 text-xs font-medium'>{column.cards.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] space-y-3 rounded-lg transition-colors ${isOver ? 'bg-muted/50' : ''}`}
      >
        {column.cards.map((card) => (
          <ManagerKanbanCard
            key={card.id}
            {...card}
            onViewDetail={onViewDetail ? () => onViewDetail(card.id) : undefined}
            onReview={onReview}
            onReject={onReject}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
