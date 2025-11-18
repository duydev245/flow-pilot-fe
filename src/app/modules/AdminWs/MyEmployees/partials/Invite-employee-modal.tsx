import type React from 'react'
import type { CreateEmployeePayload } from '../models/AdminwsInterface'

import { Button } from '@/app/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { useState } from 'react'

interface CreateEmployeeData {
  name: string
  email: string
  role: string
}

interface CreateEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (employee: CreateEmployeePayload) => void
}

export function CreateEmployeeModal({ isOpen, onClose, onCreate }: CreateEmployeeModalProps) {
  const [formData, setFormData] = useState<CreateEmployeeData>({
    name: '',
    email: '',
    role: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Convert role string to role_id
    const roleMap: { [key: string]: number } = {
      'Admin': 2,
      'Project Manager': 3,
      'Employee': 4
    }

    const payload: CreateEmployeePayload = {
      name: formData.name,
      email: formData.email,
      role_id: roleMap[formData.role] || 4 // Default to Employee if not found
    }

    onCreate(payload)
    setIsLoading(false)
    onClose()

    // Reset form
    setFormData({
      name: '',
      email: '',
      role: ''
    })
  }

  const handleInputChange = (field: keyof CreateEmployeeData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px] p-0'>
        <DialogHeader className='px-6 py-4 border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='text-lg font-semibold'>Create New Employee</DialogTitle>
              <p className='text-sm text-muted-foreground mt-1'>Add a new employee to your workspace.</p>
            </div>
            {/* <Button variant='ghost' size='icon' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button> */}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='px-6 py-4 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='invite-name'>Name</Label>
            <Input
              id='invite-name'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder='Vu Hanhname'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='invite-email'>Email</Label>
            <Input
              id='invite-email'
              type='email'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder='vuhanhname.work@example.com'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label>Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)} required>
              <SelectTrigger>
                <SelectValue placeholder='Select role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Admin'>Admin</SelectItem>
                <SelectItem value='Project Manager'>Project Manager</SelectItem>
                <SelectItem value='Employee'>Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type='submit' className='w-full bg-blue-600 hover:bg-blue-700 text-white mt-6' disabled={isLoading}>
            {isLoading ? 'CREATING...' : 'CREATE EMPLOYEE'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// For backward compatibility
export { CreateEmployeeModal as InviteEmployeeModal }
