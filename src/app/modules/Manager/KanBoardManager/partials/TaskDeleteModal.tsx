import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface TaskDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskName: string
  onConfirm: () => void
  isDeleting?: boolean
}

export function TaskDeleteModal({ open, onOpenChange, taskName, onConfirm, isDeleting = false }: TaskDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='rounded-full bg-red-100 p-2'>
              <AlertTriangle className='h-6 w-6 text-red-600' />
            </div>
            <DialogTitle className='text-xl'>Delete Task</DialogTitle>
          </div>
          <DialogDescription className='pt-4 text-base'>
            <p>
              Are you sure you want to delete the task{' '}
              <span className='font-semibold text-foreground'>"{taskName}"</span>?
            </p>
            <br />
            <p className='text-red-600 font-bold text-center text-lg'>This action cannot be undone.</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className='mr-2' type='button' variant='destructive' onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </Button>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
