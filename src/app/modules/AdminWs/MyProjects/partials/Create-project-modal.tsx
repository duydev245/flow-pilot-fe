import type { CreateProjectFormData } from '@/app/modules/AdminWs/MyProjects/MyProjects'
import type React from 'react'

export interface Manager {
  id: string
  name: string
  email: string
  avatar_url: string | null
  status: string
}

import { Button } from '@/app/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Textarea } from '@/app/components/ui/textarea'
import { useState } from 'react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (project: CreateProjectFormData) => void
  managers: Manager[]
}

export function CreateProjectModal({ isOpen, onClose, onCreate, managers }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: '',
    manager_id: '',
    description: '',
    start_date: '',
    end_date: '',
    process: 0, // Will be set to 0 by default, no user input needed
    team_size: 1,
    status: 'active'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Get minimum end date (start date or today)
  const getMinEndDate = () => {
    if (formData.start_date) {
      return formData.start_date
    }
    return getTodayDate()
  }

  // Filter to only active managers
  const activeManagers = managers.filter((manager) => manager.status === 'active')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsLoading(true)
    onCreate(formData)
    setIsLoading(false)
    onClose()

    // Reset form
    setFormData({
      name: '',
      manager_id: '',
      description: '',
      start_date: '',
      end_date: '',
      process: 0, // Always reset to 0 for new projects
      team_size: 1,
      status: 'active'
    })
    setValidationErrors({})
  }

  const handleInputChange = (field: keyof CreateProjectFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Validate dates
    if (field === 'start_date' || field === 'end_date') {
      validateDates(field, value as string)
    }
  }

  const validateDates = (changedField: string, value: string) => {
    const errors: {[key: string]: string} = {}

    if (changedField === 'start_date') {
      // Check if start date is in the past
      const startDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day

      if (startDate < today) {
        errors.start_date = 'Start date cannot be in the past'
      }

      // Check if end date is still valid
      if (formData.end_date) {
        const endDate = new Date(formData.end_date)
        if (endDate <= startDate) {
          errors.end_date = 'End date must be after start date'
        }
      }
    }

    if (changedField === 'end_date') {
      // Check if end date is before start date
      if (formData.start_date) {
        const startDate = new Date(formData.start_date)
        const endDate = new Date(value)

        if (endDate <= startDate) {
          errors.end_date = 'End date must be after start date'
        }
      }
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }))
  }



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] p-0 max-h-[95vh] overflow-y-auto'>
        <DialogHeader className='px-6 py-4 border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='text-lg font-semibold'>Create New Project</DialogTitle>
              <p className='text-sm text-muted-foreground mt-1'>Add a new project to your workspace.</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='px-6 py-4 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='project-name'>Project Name</Label>
            <Input
              id='project-name'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder='Enter project name'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label>Project Manager</Label>
            <Select
              value={formData.manager_id}
              onValueChange={(value) => handleInputChange('manager_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a project manager' />
              </SelectTrigger>
              <SelectContent>
                {activeManagers.length === 0 ? (
                  <SelectItem value='' disabled>
                    No project managers available
                  </SelectItem>
                ) : (
                  activeManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='project-description'>Description</Label>
            <Textarea
              id='project-description'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder='Enter project description'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='start-date'>Start Date</Label>
              <Input
                id='start-date'
                type='date'
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                min={getTodayDate()}
                required
                className={validationErrors.start_date ? 'border-red-500' : ''}
              />
              {validationErrors.start_date && (
                <p className='text-sm text-red-500'>{validationErrors.start_date}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='end-date'>End Date</Label>
              <Input
                id='end-date'
                type='date'
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                min={getMinEndDate()}
                required
                className={validationErrors.end_date ? 'border-red-500' : ''}
              />
              {validationErrors.end_date && (
                <p className='text-sm text-red-500'>{validationErrors.end_date}</p>
              )}
            </div>
          </div>



          {/* <div className='space-y-2'>
            <Label htmlFor='team-size'>Team Size</Label>
            <Input
              id='team-size'
              type='number'
              min={1}
              max={50}
              value={formData.team_size}
              onChange={(e) => handleInputChange('team_size', Number(e.target.value))}
              placeholder='Enter team size'
              required
            />
          </div> */}

          {/* <div className='space-y-2'>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <Button
            type='submit'
            className='w-full bg-blue-600 hover:bg-blue-700 text-white mt-6'
            disabled={isLoading || Object.keys(validationErrors).length > 0}
          >
            {isLoading ? 'CREATING...' : 'CREATE PROJECT'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
