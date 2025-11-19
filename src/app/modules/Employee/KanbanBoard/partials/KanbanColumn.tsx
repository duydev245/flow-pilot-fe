import type { Column } from '@/app/modules/Employee/KanbanBoard/partials/KanbanBoardForm'
import { KanbanCard } from '@/app/modules/Employee/KanbanBoard/partials/KanbanCard'
import { useDroppable } from '@dnd-kit/core'

interface KanbanColumnProps {
  column: Column
  onViewDetail?: (taskId: string) => void
}

export function KanbanColumn({ column, onViewDetail }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id
  })

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between sticky top-0 bg-background z-10'>
        <h2 className='text-sm font-semibold'>{column.title}</h2>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[400px] space-y-3 rounded-lg p-2 overflow-y-auto transition-colors ${
          isOver ? 'bg-muted/50' : ''
        }`}
      >
        {column.cards.length > 0 ? (
          column.cards.map((card) => (
            <KanbanCard key={card.id} {...card} onViewDetail={onViewDetail ? () => onViewDetail(card.id) : undefined} />
          ))
        ) : (
          column.id !== 'rejected' && (
            <div className='text-center text-sm text-muted-foreground py-4 border border-dashed rounded-lg'>
              Drop here
            </div>
          )
        )}
      </div>
    </div>
  )
}
