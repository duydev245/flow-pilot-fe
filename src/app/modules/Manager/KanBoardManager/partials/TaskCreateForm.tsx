import { projectApi } from '@/app/apis/AUTH/project.api'
import { MyTaskApi } from '@/app/apis/AUTH/task-emp.api'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Textarea } from '@/app/components/ui/textarea'
import type { IUserStatePayload } from '@/app/models'
import { getLocalStorage } from '@/app/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'

// Validation schema
const taskSchema = yup.object({
  project_id: yup.string().required('Project ID is required'),
  name: yup.string().required('Task name is required').min(2, 'Task name must be at least 2 characters'),
  description: yup.string().notRequired(),
  start_at: yup.string().required('Start date is required').test('not-past', 'Start date cannot be in the past', function (value) {
    if (!value) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(value) >= today
  }),
  due_at: yup
    .string()
    .required('Due date is required')
    .test('due-after-start', 'Due date must be after start date', function (value) {
      const { start_at } = this.parent
      if (!value || !start_at) return true
      return new Date(value) > new Date(start_at)
    })
    .test('not-past', 'Due date cannot be in the past', function (value) {
      if (!value) return true
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(value) >= today
    }),
  priority: yup.string().oneOf(['low', 'medium', 'high'], 'Invalid priority').required('Priority is required'),
  status: yup
    .string()
    .oneOf(['todo', 'doing', 'reviewing', 'rejected', 'completed', 'feedbacked', 'overdued'], 'Invalid status')
    .required('Status is required'),
  image_url: yup.string().notRequired()
})

type TaskFormData = {
  project_id: string
  name: string
  description?: string
  start_at: string
  due_at: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'doing' | 'reviewing' | 'rejected' | 'completed' | 'feedbacked' | 'overdued'
  image_url?: string
}

interface TaskCreateFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaskCreateForm({ onSuccess, onCancel }: TaskCreateFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedAttachments, setSelectedAttachments] = useState<File[]>([])
  const userLocalStorage: IUserStatePayload = getLocalStorage('user')
  const projectId = userLocalStorage.projectId

  // Fetch team members
  const { data: projectData, isLoading: membersLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectById(projectId),
    enabled: !!projectId
  })

  const teamMembers = projectData?.data?.members || []
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema) as any,
    defaultValues: {
      project_id: projectId, // Default project ID
      name: '',
      description: '',
      start_at: '',
      due_at: '',
      priority: 'medium',
      status: 'todo',
      image_url: ''
    }
  })

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsLoading(true)

      const submitData = new FormData()
      submitData.append('project_id', data.project_id)
      submitData.append('name', data.name)
      if (data.description) {
        submitData.append('description', data.description)
      }
      submitData.append('start_at', new Date(data.start_at).toISOString())
      submitData.append('due_at', new Date(data.due_at).toISOString())

      // Calculate time spent: (due date - start date) * 8 hours in minutes
      const startDate = new Date(data.start_at)
      const dueDate = new Date(data.due_at)
      const diffMs = dueDate.getTime() - startDate.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      const timeSpentHours = diffHours * 8
      const timeSpentMinutes = Math.round(timeSpentHours * 60)
      submitData.append('time_spent_in_minutes', timeSpentMinutes.toString())

      submitData.append('priority', data.priority)
      submitData.append('status', data.status)
      if (data.image_url) {
        submitData.append('image_url', data.image_url)
      }

      if (selectedImage) {
        submitData.append('taskImage', selectedImage)
      }

      const response = await MyTaskApi.createTask(submitData)

      if (response.success) {
        const taskId = response.data?.id

        // Upload attachments if any
        if (selectedAttachments.length > 0 && taskId) {
          try {
            for (const file of selectedAttachments) {
              await MyTaskApi.uploadFileByTaskId(taskId, file)
            }
            toast.success('Task created and attachments uploaded successfully!')
          } catch (uploadError) {
            console.error('Error uploading attachments:', uploadError)
            toast.warning('Task created but failed to upload some attachments')
          }
        }

        // If task created successfully and members are selected, assign task
        if (selectedMembers.length > 0 && taskId) {
          try {
            await MyTaskApi.assignTask({
              task_id: taskId,
              user_ids: selectedMembers
            })
            if (selectedAttachments.length === 0) {
              toast.success('Task created and assigned successfully!')
            }
          } catch (assignError) {
            console.error('Error assigning task:', assignError)
            toast.warning('Task created but failed to assign to members')
          }
        } else {
          if (selectedAttachments.length === 0) {
            toast.success('Task created successfully!')
          }
        }

        onSuccess?.()
        // Reset form
        reset()
        setSelectedImage(null)
        setSelectedMembers([])
        setSelectedAttachments([])
        setSelectedAttachments([])
      }
    } catch (error: any) {
      console.error('Error creating task:', error)
      const message = error?.response?.data?.message || 'Failed to create task'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setSelectedAttachments(Array.from(files))
    }
  }

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers((prev) => [...prev, memberId])
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId))
    }
  }

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Create New Task</CardTitle>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onCancel}
          className='h-8 w-8 p-0'
        >
          <X className='h-4 w-4' />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Task Name *</label>
            <Controller
              name='name'
              control={control}
              render={({ field }) => <Input placeholder='Enter task name' {...field} />}
            />
            {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name.message}</p>}
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Description</label>
            <Controller
              name='description'
              control={control}
              render={({ field }) => <Textarea placeholder='Enter task description' rows={3} {...field} />}
            />
            {errors.description && <p className='text-sm text-red-500 mt-1'>{errors.description.message}</p>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Start Date *</label>
              <Controller
                name='start_at'
                control={control}
                render={({ field }) => <Input type='datetime-local' min={new Date().toISOString().slice(0, 16)} {...field} />}
              />
              {errors.start_at && <p className='text-sm text-red-500 mt-1'>{errors.start_at.message}</p>}
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Due Date *</label>
              <Controller
                name='due_at'
                control={control}
                render={({ field }) => <Input type='datetime-local' min={new Date().toISOString().slice(0, 16)} {...field} />}
              />
              {errors.due_at && <p className='text-sm text-red-500 mt-1'>{errors.due_at.message}</p>}
            </div>
          </div>

          {/* Priority and Status */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Priority *</label>
              <Controller
                name='priority'
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select priority' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='low'>Low</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='high'>High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && <p className='text-sm text-red-500 mt-1'>{errors.priority.message}</p>}
            </div>
          </div>

          {/* Assign Team Members */}
          <div>
            <label className='block text-sm font-medium mb-2'>Assign to Team Members</label>
            {membersLoading ? (
              <p className='text-sm text-gray-500'>Loading team members...</p>
            ) : teamMembers.length > 0 ? (
              <div className='space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3'>
                {teamMembers.map((member: any) => (
                  <div key={member.user.id} className='flex items-center space-x-2'>
                    <Checkbox
                      id={member.user.id}
                      checked={selectedMembers.includes(member.user.id)}
                      onCheckedChange={(checked) => handleMemberToggle(member.user.id, !!checked)}
                    />
                    <label htmlFor={member.user.id} className='text-sm font-medium cursor-pointer flex-1'>
                      {member.user.name} ({member.role})
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-500'>No team members available</p>
            )}
            {selectedMembers.length > 0 && (
              <p className='text-xs text-blue-600 mt-1'>Selected {selectedMembers.length} member(s)</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Task Image File</label>
            <Input type='file' accept='image/*' onChange={handleImageChange} className='mb-2' />
            {selectedImage && <p className='text-sm text-gray-600'>Selected: {selectedImage.name}</p>}
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Task Attachments</label>
            <Input type='file' multiple onChange={handleAttachmentChange} className='mb-2' />
            {selectedAttachments.length > 0 && (
              <div className='text-sm text-gray-600'>
                <p>Selected {selectedAttachments.length} file(s):</p>
                <ul className='list-disc list-inside'>
                  {selectedAttachments.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
