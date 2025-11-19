import { UserSuperAdminAPI } from '@/app/apis/AUTH/user.api'
import { Button } from '@/app/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { Search, X, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ProjectByAdminData } from '@/app/modules/AdminWs/MyProjects/models/project.type'
import type { User } from '@/app/modules/SuperAdmin/UserManagement/models/UserManagementInterface'

interface SelectedUser {
  user_id: string
  role: string
}

interface AssignUserModalProps {
  isOpen: boolean
  onClose: () => void
  project: ProjectByAdminData | null
  onAssign: (users: SelectedUser[]) => Promise<void>
}

export function AssignUserModal({ isOpen, onClose, project, onAssign }: AssignUserModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [customRoles, setCustomRoles] = useState<string[]>([])

  // Get unique workspaces and roles
  const workspaces = Array.from(new Set(users.map(user => user.workspace?.name).filter(Boolean))).sort()
  const roles = Array.from(new Set(users.map(user => user.role?.role).filter(Boolean))).sort()

  // Load custom roles from localStorage on component mount
  useEffect(() => {
    const savedRoles = localStorage.getItem('customRoles')
    if (savedRoles) {
      try {
        setCustomRoles(JSON.parse(savedRoles))
      } catch (error) {
        console.error('Error parsing custom roles from localStorage:', error)
      }
    }
  }, [])

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users.filter(user => user.status === 'active' && user.role?.role === 'EMPLOYEE')

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Workspace filter
    if (selectedWorkspace !== 'all') {
      filtered = filtered.filter(user => user.workspace?.name === selectedWorkspace)
    }

    // Role filter (additional filtering beyond EMPLOYEE)
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role?.role === selectedRole)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, selectedWorkspace, selectedRole])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await UserSuperAdminAPI.getAllUserByAdmin(1, 10000) // Get all users with high limit
      setUsers(response.data?.items || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (selectedUsers.length === 0) return

    try {
      setIsAssigning(true)
      await onAssign(selectedUsers)
      handleClose()
    } catch (error) {
      console.error('Error assigning users:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleClose = () => {
    setSelectedUsers([])
    setSearchQuery('')
    setSelectedWorkspace('all')
    setSelectedRole('all')
    setNewRoleName('')
    onClose()
  }

  const handleUserToggle = (userId: string) => {
    if (customRoles.length === 0) {
      alert('Please add at least one custom role before selecting users.')
      return
    }

    const isSelected = selectedUsers.some(user => user.user_id === userId)
    
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(user => user.user_id !== userId))
    } else {
      // Add user with first available custom role
      setSelectedUsers([...selectedUsers, { user_id: userId, role: 'custom-0' }])
    }
  }

  const handleRoleChange = (userId: string, role: string) => {
    setSelectedUsers(selectedUsers.map(user => 
      user.user_id === userId ? { ...user, role } : user
    ))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedWorkspace('all')
    setSelectedRole('all')
  }

  const hasActiveFilters = searchQuery || selectedWorkspace !== 'all' || selectedRole !== 'all'

  const isUserSelected = (userId: string) => {
    return selectedUsers.some(user => user.user_id === userId)
  }

  const getUserRole = (userId: string) => {
    const selectedUser = selectedUsers.find(user => user.user_id === userId)
    return selectedUser?.role || (customRoles.length > 0 ? 'custom-0' : '')
  }

  const addCustomRole = () => {
    if (newRoleName.trim() && !customRoles.includes(newRoleName.trim())) {
      const updatedRoles = [...customRoles, newRoleName.trim()]
      setCustomRoles(updatedRoles)
      // Save to localStorage
      localStorage.setItem('customRoles', JSON.stringify(updatedRoles))
      setNewRoleName('')
    }
  }

  const removeCustomRole = (roleToRemove: string) => {
    const updatedRoles = customRoles.filter(role => role !== roleToRemove)
    setCustomRoles(updatedRoles)
    // Save to localStorage
    localStorage.setItem('customRoles', JSON.stringify(updatedRoles))
    
    // Update selected users if they have the removed role
    setSelectedUsers(selectedUsers.map(user => {
      const roleIndex = customRoles.findIndex(role => role === roleToRemove)
      if (user.role === `custom-${roleIndex}`) {
        return { ...user, role: updatedRoles.length > 0 ? 'custom-0' : '' } // Default to first remaining custom role
      }
      return user
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomRole()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Assign Users to Project</DialogTitle>
          <DialogDescription>
            Assign one or more users to the project "{project?.name}". Add custom roles first, then click on users to select them and assign roles.
            {customRoles.length === 0 && (
              <span className='block mt-1 text-orange-600 font-medium'>
                ⚠️ Please add at least one custom role before selecting users.
              </span>
            )}
            {selectedUsers.length > 0 && (
              <span className='block mt-1 text-blue-600 font-medium'>
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Add Custom Role Section */}
        <div className='border-b pb-4 mb-4'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Enter new role name...'
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyPress={handleKeyPress}
              className='flex-1'
            />
            <Button
              type='button'
              onClick={addCustomRole}
              disabled={!newRoleName.trim()}
              className='bg-green-600 hover:bg-green-700'
            >
              <Plus className='w-4 h-4 mr-1' />
              Add Role
            </Button>
          </div>
          {customRoles.length > 0 && (
            <div className='mt-2'>
              <span className='text-sm text-gray-600'>Custom roles: </span>
              <div className='flex flex-wrap gap-1 mt-1'>
                {customRoles.map((role, index) => (
                  <Badge 
                    key={index} 
                    variant='secondary' 
                    className='text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors'
                    onClick={() => removeCustomRole(role)}
                    title='Click to remove this role'
                  >
                    {role} ×
                  </Badge>
                ))}
              </div>
              <p className='text-xs text-gray-500 mt-1'>Click on a role to remove it</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className='flex items-center gap-4 flex-wrap border-b pb-4'>
          <div className='relative flex-1 min-w-[200px]'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              placeholder='Search by name or email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>

          <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Workspace' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Workspaces</SelectItem>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace} value={workspace}>
                  {workspace}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='h-9 w-9 p-0 text-gray-400 hover:text-gray-600'
            >
              <X className='w-4 h-4' />
            </Button>
          )}
        </div>

        {/* User List */}
        <div className='flex-1 overflow-auto'>
          {isLoading ? (
            <div className='flex items-center justify-center h-32'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : (
            <div className='space-y-2'>
              {filteredUsers.length === 0 ? (
                <div className='text-center text-gray-500 py-8'>
                  No users found matching your criteria
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const selected = isUserSelected(user.id)
                  const userRole = getUserRole(user.id)
                  
                  return (
                    <div
                      key={user.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        selected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <div
                            className='cursor-pointer'
                            onClick={() => handleUserToggle(user.id)}
                          >
                            <Avatar className='w-10 h-10'>
                              <AvatarImage src={user.avatar_url || '/placeholder.svg'} />
                              <AvatarFallback>
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div
                            className='cursor-pointer flex-1'
                            onClick={() => handleUserToggle(user.id)}
                          >
                            <div className='font-medium text-gray-900'>{user.name}</div>
                            <div className='text-sm text-gray-500'>{user.email}</div>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Badge variant='secondary' className='text-xs'>
                            {user.role?.role || 'No role'}
                          </Badge>
                          {selected && (
                            <div className='w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center'>
                              <div className='w-2 h-2 rounded-full bg-white'></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Role Selection for Selected Users */}
                      {selected && (
                        <div className='mt-3 pt-3 border-t border-gray-200'>
                          <div className='flex items-center space-x-2'>
                            <span className='text-sm font-medium text-gray-700'>Assign Role:</span>
                            <Select
                              value={userRole}
                              onValueChange={(role) => handleRoleChange(user.id, role)}
                            >
                              <SelectTrigger className='w-40'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {customRoles.length > 0 ? (
                                  customRoles.map((role, index) => (
                                    <SelectItem key={`custom-${index}`} value={`custom-${index}`}>
                                      {role}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className='text-xs text-gray-500 px-2 py-1'>No roles available. Add a custom role first.</div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedUsers.length === 0 || isAssigning || customRoles.length === 0}
            className='bg-blue-600 hover:bg-blue-700'
          >
            {isAssigning 
              ? 'Assigning...' 
              : customRoles.length === 0
              ? 'Add roles first'
              : `Assign ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}