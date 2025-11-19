import { ProjectAdminApi } from '@/app/apis/AUTH/project-admin.api'
import { projectApi } from '@/app/apis/AUTH/project.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import { Progress } from '@/app/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import type { ProjectByAdmin, ProjectByAdminData } from '@/app/modules/AdminWs/MyProjects/models/project.type'
import {
  CreateProjectModal,
  DeleteProjectModal,
  UpdateProjectModal,
  AssignUserModal
} from '@/app/modules/AdminWs/MyProjects/partials'
import { PATH } from '@/app/routes/path'
import { ChevronLeft, ChevronRight, Edit, Eye, Plus, Search, Trash2, UserPlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export interface Manager {
  id: string
  name: string
  email: string
  avatar_url: string | null
  status: string
}

export interface CreateProjectFormData {
  name: string
  manager_id: string
  description: string
  start_date: string
  end_date: string
  process: number
  team_size: number
  status: 'active' | 'inactive'
}

function MyProjects() {
  const navigate = useNavigate()
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectByAdminData | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  // Data states
  const [projectsData, setProjectsData] = useState<ProjectByAdmin | null>(null)
  const [managers, setManagers] = useState<Manager[]>([])
  const [isProjectsLoading, setIsProjectsLoading] = useState(true)
  const [isProjectsError, setIsProjectsError] = useState(false)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [, setIsManagersLoading] = useState(true)

  // Filter states
  const [selectedManager, setSelectedManager] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const totalPages = Math.ceil((projectsData?.total || 0) / pageSize)

  // Fetch data on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsProjectsLoading(true)
        setIsProjectsError(false)
        const data = await ProjectAdminApi.getAllProjects(page, pageSize)
        setProjectsData(data)
      } catch (error) {
        setIsProjectsError(true)
        setProjectsError(error instanceof Error ? error.message : 'Failed to fetch projects')
        console.error('Error fetching projects:', error)
      } finally {
        setIsProjectsLoading(false)
      }
    }

    const fetchManagers = async () => {
      try {
        setIsManagersLoading(true)
        const data = await ProjectAdminApi.getAllManagers()
        setManagers(data)
      } catch (error) {
        console.error('Error fetching managers:', error)
      } finally {
        setIsManagersLoading(false)
      }
    }

    fetchProjects()
    fetchManagers()
  }, [page, pageSize])

  // Filter projects based on search query and filters
  const filteredProjects = (projectsData?.data || []).filter((project: ProjectByAdminData) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesManager = selectedManager === 'all' || project.manager_id === selectedManager
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus

    return matchesSearch && matchesManager && matchesStatus
  })

  // Get unique managers from available managers list
  const uniqueManagerIds = Array.from(
    new Set((projectsData?.data || []).map((project: ProjectByAdminData) => project.manager_id).filter(Boolean))
  )
  const uniqueManagers = managers.filter((manager) => uniqueManagerIds.includes(manager.id))

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedManager('all')
    setSelectedStatus('all')
  }

  const hasActiveFilters = searchQuery || selectedManager !== 'all' || selectedStatus !== 'all'

  // Handle project selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(filteredProjects.map((project: ProjectByAdminData) => project.id))
    } else {
      setSelectedProjects([])
    }
  }

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId])
    } else {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId))
    }
  }

  const handleViewProject = (projectId: string) => {
    navigate(PATH.ADMIN_MY_PROJECT_DETAIL.replace(':id', projectId))
  }

  const handleCreateProject = async (projectData: CreateProjectFormData) => {
    try {
      await ProjectAdminApi.createProject(projectData)
      // Refresh projects data
      const data = await ProjectAdminApi.getAllProjects(page, pageSize)
      setProjectsData(data)
      toast.success('Project created successfully!')
      setIsCreateModalOpen(false)
    } catch (error) {
      toast.error('Failed to create project.')
      console.error('Create failed:', error)
    }
  }

  // Handle update project
  const handleUpdateProject = async (projectData: CreateProjectFormData) => {
    if (!selectedProject) return

    try {
      await ProjectAdminApi.updateProject(projectData, selectedProject.id)
      // Refresh projects data
      const data = await ProjectAdminApi.getAllProjects(page, pageSize)
      setProjectsData(data)
      toast.success('Project updated successfully!')
      setIsUpdateModalOpen(false)
    } catch (error) {
      toast.error('Failed to update project.')
      console.error('Update failed:', error)
    }
  }

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!selectedProject) return
    try {
      await ProjectAdminApi.deleteProject(selectedProject.id)
      // Refresh projects data
      const data = await ProjectAdminApi.getAllProjects(page, pageSize)
      setProjectsData(data)
      toast.success(`Project "${selectedProject.name}" deleted successfully!`)
      setIsDeleteModalOpen(false)
    } catch (error) {
      toast.error('Failed to delete project.')
      console.error('Delete failed:', error)
    }
  }

  // Handle assign users to project
  const handleAssignUsers = async (users: Array<{ user_id: string; role: string }>) => {
    if (!selectedProject) return

    try {
      // Transform custom roles to their actual names before sending to API
      const transformedUsers = users.map(user => {
        let roleValue = user.role
        
        // If it's a custom role, get the actual role name
        if (user.role.startsWith('custom-')) {
          const customRoles = JSON.parse(localStorage.getItem('customRoles') || '[]')
          const roleIndex = parseInt(user.role.replace('custom-', ''))
          roleValue = customRoles[roleIndex] || user.role
        }
        
        return {
          user_id: user.user_id,
          role: roleValue
        }
      })

      await projectApi.assignUsersToProject(selectedProject.id, transformedUsers)
      const userCount = users.length
      toast.success(`${userCount} user${userCount !== 1 ? 's' : ''} assigned to project successfully!`)
      setIsAssignModalOpen(false)
    } catch (error) {
      toast.error('Failed to assign users to project.')
      console.error('Assign failed:', error)
    }
  } // Format date for display
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-GB')
    const end = new Date(endDate).toLocaleDateString('en-GB')
    return `${start} -> ${end}`
  }

  if (isProjectsLoading)
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='flex items-center space-x-2'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='text-sm text-gray-600'>Loading Project ...</span>
        </div>
      </div>
    )
  if (isProjectsError) return <div>Error: {projectsError}</div>

  return (
    <div className='flex h-screen bg-white container mx-auto'>
      <div className='flex-1 flex flex-col'>
        <header className='bg-white border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-extrabold text-gray-900'>Manage Projects</h1>
            <div className='flex items-center gap-4'>
              <Button className='bg-blue-600 hover:bg-blue-700' onClick={() => setIsCreateModalOpen(true)}>
                <Plus className='w-4 h-4 mr-2' />
                Add new
              </Button>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className='bg-white px-6 py-4 mb-6 border border-gray-200 rounded-lg'>
          <div className='flex items-center gap-4 flex-wrap'>
            <div className='relative flex-1 min-w-[250px]'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                placeholder='Search by project name...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='All Managers' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Managers</SelectItem>
                {uniqueManagers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-[130px]'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant='ghost'
                size='sm'
                onClick={clearAllFilters}
                className='h-9 w-9 p-0 text-gray-400 hover:text-gray-600'
              >
                <X className='w-4 h-4' />
              </Button>
            )}
          </div>
        </div>

        <div className='flex-1 overflow-auto bg-white'>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <Table>
              <TableHeader>
                <TableRow className='border-b border-gray-200'>
                  <TableHead className='w-12'>
                    <Checkbox
                      checked={filteredProjects.length > 0 && selectedProjects.length === filteredProjects.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>NAME</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>MANAGER</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>TEAM SIZE</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>PROGRESS</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>START-END DATE</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>STATUS</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project: ProjectByAdminData) => {
                  return (
                    <TableRow key={project.id} className='border-b border-gray-100 hover:bg-gray-50'>
                      <TableCell>
                        <Checkbox
                          checked={selectedProjects.includes(project.id)}
                          onCheckedChange={(checked) => handleSelectProject(project.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className='font-medium text-gray-900'>
                        <div>
                          <div className='font-semibold'>{project.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Avatar className='w-8 h-8'>
                            <AvatarImage src={project?.manager?.avatar_url || '/placeholder.svg'} />
                            <AvatarFallback>
                              {project?.manager?.name
                                ?.split(' ')
                                .map((n: string) => n[0])
                                .join('') || 'M'}
                            </AvatarFallback>
                          </Avatar>
                          <span className='text-gray-600'>{project?.manager?.name || 'Unknown Manager'}</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-gray-600'>
                        {project.team_size ? `${project.team_size} members` : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Progress value={project.process || 0} className='w-16' />
                          <span className='text-sm text-gray-600'>{project.process || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-gray-600'>
                        {formatDateRange(project.start_date, project.end_date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className={
                            project.status === 'active'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 border-0 font-medium capitalize'
                              : 'bg-red-100 text-red-700 hover:bg-red-100 border-0 font-medium capitalize'
                          }
                        >
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                            title='View project details'
                            onClick={() => handleViewProject(project.id)}
                          >
                            <Eye className='w-4 h-4 text-gray-400' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                            title='Assign user to project'
                            onClick={() => {
                              setSelectedProject(project)
                              setIsAssignModalOpen(true)
                            }}
                          >
                            <UserPlus className='w-4 h-4 text-green-500' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                            title='Edit project'
                            onClick={() => {
                              setSelectedProject(project)
                              setIsUpdateModalOpen(true)
                            }}
                          >
                            <Edit className='w-4 h-4 text-blue-500' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                            title='Delete project'
                            onClick={() => {
                              setSelectedProject(project)
                              setIsDeleteModalOpen(true)
                            }}
                          >
                            <Trash2 className='w-4 h-4 text-red-500' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className='bg-white border-t border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-500'>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, projectsData?.total || 0)} of{' '}
              {projectsData?.total || 0} results
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>

              {/* Hiển thị các nút số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(page - 2, 0), Math.min(page + 1, totalPages))
                .map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? 'default' : 'ghost'}
                    size='sm'
                    className={pageNumber === page ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}

              <Button
                variant='ghost'
                size='sm'
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProject}
          managers={managers}
        />
        <UpdateProjectModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          project={selectedProject}
          onUpdate={handleUpdateProject}
          managers={managers}
        />
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          projectName={selectedProject?.name || ''}
          onConfirm={handleDeleteProject}
        />
        <AssignUserModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          project={selectedProject}
          onAssign={handleAssignUsers}
        />
      </div>
    </div>
  )
}

export default MyProjects
