import { useDraggable } from '@dnd-kit/core'
import { Card } from '@/app/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Button } from '@/app/components/ui/button'
import { MessageSquare, MoreHorizontal } from 'lucide-react'
import type { MyTask } from '../../MyTasks/models/myTask.type'

interface Tag {
  label: string
  color: string
}

interface KanbanCardProps {
  id: string
  image?: string
  title: string
  tags: Tag[]
  subtasks: number
  comments: number
  avatars: string[]
  originalTask: MyTask
  isMyTask?: boolean
  onViewDetail?: () => void
}

const tagColors: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  pink: 'bg-pink-100 text-pink-700',
  red: 'bg-red-100 text-red-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700'
}

export function KanbanCard({
  id,
  image,
  title,
  tags,
  subtasks,
  comments,
  avatars,
  originalTask,
  isMyTask,
  onViewDetail
}: KanbanCardProps) {
  // Check if task can be dragged (not feedbacked or rejected or completed, and must be my task if specified)
  const isDragDisabled =
    originalTask.status === 'feedbacked' || originalTask.status === 'rejected' || originalTask.status === 'completed' || originalTask.status === 'reviewing' || (isMyTask !== undefined && !isMyTask)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    disabled: isDragDisabled
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(isDragDisabled ? {} : listeners)}
      {...(isDragDisabled ? {} : attributes)}
      className={`overflow-hidden border border-border bg-card p-0 shadow-sm transition-all relative ${
        isDragDisabled
          ? 'opacity-60 cursor-not-allowed bg-gray-200 border-gray-300'
          : isDragging
            ? 'cursor-grabbing opacity-50'
            : 'cursor-grab hover:shadow-md'
      }`}
    >
      {image && (
        <div className='relative h-40 w-full bg-muted'>
          <img src={image} alt={title} className='object-cover' />
        </div>
      )}
      <div className='p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-sm font-medium leading-snug text-card-foreground flex-1'>{title}</h3>
          {onViewDetail && (
            <Button
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0 ml-2 hover:bg-muted'
              onClick={(e) => {
                e.stopPropagation()
                onViewDetail()
              }}
            >
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          )}
        </div>
        <div className='mb-3 flex flex-wrap gap-2'>
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`rounded-full px-2 py-1 text-xs font-medium ${tagColors[tag.color] || 'bg-gray-100 text-gray-700'}`}
            >
              {tag.label}
            </span>
          ))}
          {originalTask.status === 'reviewing' && (
            <span className='rounded-full px-2 py-1 text-xs font-bold bg-purple-200 text-purple-800 border border-purple-500'>
              🔍 REVIEWING
            </span>
          )}
          {originalTask.status === 'feedbacked' && (
            <span className='rounded-full px-2 py-1 text-xs font-bold bg-orange-200 text-orange-800 border border-orange-500'>
              💬 FEEDBACKED
            </span>
          )}
          {originalTask.status === 'rejected' && (
            <span className='rounded-full px-2 py-1 text-xs font-bold bg-red-200 text-red-800 border border-red-500'>
              ❌ REJECTED
            </span>
          )}
          {originalTask.status === 'overdued' && (
            <span className='rounded-full px-2 py-1 text-xs font-bold bg-red-200 text-red-800 border border-red-500'>
              ⏰ OVERDUED
            </span>
          )}
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
              <span>{subtasks}</span>
            </div>
            <div className='flex items-center gap-1'>
              <MessageSquare className='h-4 w-4' />
              <span>{comments}</span>
            </div>
          </div>
          <div className='flex -space-x-2'>
            {avatars.map((avatar, index) => (
              <Avatar key={index} className='h-6 w-6 border-2 border-card'>
                <AvatarImage src={avatar || '/placeholder.svg'} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
