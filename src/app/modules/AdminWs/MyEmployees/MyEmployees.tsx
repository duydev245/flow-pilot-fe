import { AdminWsApi } from '@/app/apis/AUTH/Admin-ws.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Link, useNavigate } from 'react-router-dom'
import { PATH } from '@/app/routes/path'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip'
import type {
  AdminWsResponse,
  Employee as ApiEmployee,
  CreateEmployeePayload
} from '@/app/modules/AdminWs/MyEmployees/models/AdminwsInterface'
import { BanAccountModal } from '@/app/modules/AdminWs/MyEmployees/partials/Ban-account-modal'
import { CreateEmployeeModal } from '@/app/modules/AdminWs/MyEmployees/partials/Invite-employee-modal'
import { UpdateEmployeeModal } from '@/app/modules/AdminWs/MyEmployees/partials/Update-employee-modal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { ChevronLeft, ChevronRight, Edit, Eye, Plus, Search, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

// Component to display projects with tooltip for multiple projects
const ProjectsDisplay = ({ projectUsers }: { projectUsers: ApiEmployee['projectUsers'] }) => {
  const projectNames = (projectUsers || []).map((pu) => pu.project?.name).filter(Boolean) as string[]

  if (projectNames.length === 0) {
    return <span className='text-gray-500'>Not assigned</span>
  }

  if (projectNames.length === 1) {
    return <span>{projectNames[0]}</span>
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='cursor-help'>
          {projectNames[0]}... <span className='text-xs text-gray-500'>+{projectNames.length - 1} more</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className='max-w-xs'>
          <div className='font-medium mb-1'>All Projects:</div>
          <div className='space-y-1'>
            {projectNames.map((name, index) => (
              <div key={index} className='text-xs'>
                • {name}
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// Function to format role display
const formatRole = (role: string) => {
  if (role === 'PROJECTMANAGER') {
    return 'PROJECT MANAGER'
  }
  return role
}

function MyEmployees() {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<ApiEmployee | null>(null)
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  // Filter states
  const [selectedProject, setSelectedProject] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedJobTitle, setSelectedJobTitle] = useState('all')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const { data, isLoading, isError, error } = useQuery<AdminWsResponse, AxiosError>({
    queryKey: ['admin-ws-users', currentPage, pageSize],
    queryFn: () => AdminWsApi.getAllUserByAdmin(currentPage, pageSize)
  })

  // Fetch departments from API instead of deriving from users
  const { data: departmentsData } = useQuery<any, AxiosError>({
    queryKey: ['admin-ws-departments'],
    queryFn: () => AdminWsApi.getAllDepartments(1, 100)
  })

  // Get employees from paginated API data (filtering will be done on server-side in future)
  // For now, we'll keep client-side filtering but with paginated data
  const filteredEmployees = (data?.data.items || []).filter((employee: ApiEmployee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role?.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = selectedDepartment === 'all' || employee.department?.name === selectedDepartment
    const matchesRole = selectedRole === 'all' || employee.role?.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus
    // project filter: selectedProject can be 'all', a project name, or 'Not assigned'
    const employeeProjectNames = (employee.projectUsers || []).map((pu) => pu.project?.name).filter(Boolean) as string[]
    const matchesProject =
      selectedProject === 'all' ||
      (selectedProject === 'Not assigned' && employeeProjectNames.length === 0) ||
      employeeProjectNames.includes(selectedProject)

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus && matchesProject
  })

  // Get unique values for filter options
  // Prefer department list from API if available
  const departments: string[] =
    (departmentsData?.data?.items?.map((d: { name: string }) => d.name).filter(Boolean) as string[]) ??
    Array.from(new Set((data?.data.items || []).map((emp) => emp.department?.name).filter(Boolean)))
  const roles = Array.from(new Set((data?.data.items || []).map((emp) => emp.role?.role).filter(Boolean)))
  const statuses = Array.from(new Set((data?.data.items || []).map((emp) => emp.status).filter(Boolean)))

  // derive unique project names from users' projectUsers
  const projects: string[] = Array.from(
    new Set(
      (data?.data.items || [])
        .flatMap((emp) => (emp.projectUsers || []).map((pu) => pu.project?.name).filter(Boolean) as string[])
        .filter(Boolean) as string[]
    )
  )

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedProject('all')
    setSelectedDepartment('all')
    setSelectedJobTitle('all')
    setSelectedRole('all')
    setSelectedStatus('all')
    setCurrentPage(1) // Reset to first page when clearing filters
  }

  // Pagination helpers
  const totalPages = Math.ceil((data?.data.total || 0) / pageSize)
  const totalItems = data?.data.total || 0
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const navigate = useNavigate()

  const handleViewDetail = (memberId: string) => {
    navigate(PATH.ADMIN_MY_EMPLOYEE_DETAIL.replace(':id', memberId))
  }

  const hasActiveFilters =
    searchQuery ||
    selectedProject !== 'all' ||
    selectedDepartment !== 'all' ||
    selectedJobTitle !== 'all' ||
    selectedRole !== 'all' ||
    selectedStatus !== 'all'

  const queryClient = useQueryClient()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error?.message}</div>

  // Xử lý ban/delete tài khoản (gọi từ BanAccountModal)
  const handleBanEmployee = async () => {
    if (!selectedEmployee) return
    try {
      await AdminWsApi.deleteUser(selectedEmployee.id)
      queryClient.invalidateQueries({ queryKey: ['admin-ws-users'] })
      setIsBanModalOpen(false)
      toast.success(`Employee "${selectedEmployee.name}" deleted successfully!`)
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete employee.')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id))
    } else {
      setSelectedEmployees([])
    }
  }

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId])
    } else {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId))
    }
  }

  // Xử lý cập nhật thành công
  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-ws-users'] })
    toast.success('Employee updated successfully!')
  }

  // Xử lý tạo nhân viên
  const handleCreateEmployee = async (employee: CreateEmployeePayload) => {
    try {
      await AdminWsApi.createUser(employee)
      queryClient.invalidateQueries({ queryKey: ['admin-ws-users'] })
      toast.success('Employee created successfully!')
      setIsCreateModalOpen(false)
    } catch (error) {
      toast.error('Failed to create employee.')
      console.error('Create failed:', error)
    }
  }

  return (
    <div className='container  flex h-screen bg-white mx-auto'>
      <div className='flex-1 flex flex-col'>
        <header className='bg-white border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-extrabold text-gray-900'>Manage Employees</h1>
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
                placeholder='Search by name...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='All Projects' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
                <SelectItem value='Not assigned'>Not assigned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='All Departments' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedJobTitle} onValueChange={setSelectedJobTitle}>
              <SelectTrigger className='w-[130px]'>
                <SelectValue placeholder='All Job Titles' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Job Titles</SelectItem>
                <SelectItem value='UX Leader'>UX Leader</SelectItem>
                <SelectItem value='Senior UI/UX Designer'>Senior UI/UX Designer</SelectItem>
                <SelectItem value='Senior UI Designer'>Senior UI Designer</SelectItem>
                <SelectItem value='UI/UX Designer'>UI/UX Designer</SelectItem>
                <SelectItem value='UX Designer'>UX Designer</SelectItem>
                <SelectItem value='Graphic Designer'>Graphic Designer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className='w-[100px]'>
                <SelectValue placeholder='All Role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Role</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-[110px]'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className='capitalize'>{status}</span>
                  </SelectItem>
                ))}
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
                      checked={filteredEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>AVATAR</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>NAME</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>EMAIL</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>ROLE</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>DEPARTMENT</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>PROJECT</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>STATUS</TableHead>
                  <TableHead className='text-gray-500 font-medium text-xs uppercase'>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee: ApiEmployee) => (
                  <TableRow key={employee.id} className='border-b border-gray-100 hover:bg-gray-50'>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        to={PATH.ADMIN_MY_EMPLOYEE_DETAIL.replace(':id', employee.id)}
                        className='inline-flex items-center'
                      >
                        <Avatar className='w-8 h-8'>
                          <AvatarImage src={employee.avatar_url || '/placeholder.svg'} />
                          <AvatarFallback>
                            {employee.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </TableCell>
                    <TableCell className='font-medium text-gray-900'>
                      <Link to={PATH.ADMIN_MY_EMPLOYEE_DETAIL.replace(':id', employee.id)} className='hover:underline'>
                        {employee.name}
                      </Link>
                    </TableCell>
                    <TableCell className='text-gray-600'>{employee.email}</TableCell>
                    <TableCell className='text-gray-600'>{formatRole(employee.role?.role || 'Employee')}</TableCell>
                    <TableCell className='text-gray-600'>{employee.department?.name || 'Products'}</TableCell>
                    <TableCell className='text-gray-600'>
                      <ProjectsDisplay projectUsers={employee.projectUsers} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='secondary'
                        className={
                          employee.status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100 border-0 font-medium capitalize'
                            : 'bg-red-100 text-red-700 hover:bg-red-100 border-0 font-medium capitalize'
                        }
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => handleViewDetail(employee.id)}
                        >
                          <Eye className='w-4 h-4 text-gray-400' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          title='Sửa thông tin'
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setIsUpdateModalOpen(true)
                          }}
                        >
                          <Edit className='w-4 h-4 text-blue-500' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          title='Xóa nhân viên'
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setIsBanModalOpen(true)
                          }}
                        >
                          <Trash2 className='w-4 h-4 text-red-500' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className='bg-white border-t border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='text-sm text-gray-500'>
                Showing {startItem} to {endItem} of {totalItems} results
                {(searchQuery || hasActiveFilters) && ` (filtered)`}
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-500'>Show:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                  <SelectTrigger className='w-[80px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='5'>5</SelectItem>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='sm' disabled={currentPage <= 1} onClick={handlePrevPage}>
                <ChevronLeft className='w-4 h-4' />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'ghost'}
                    size='sm'
                    className={currentPage === pageNum ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className='text-gray-400'>...</span>
                  <Button variant='ghost' size='sm' onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                  </Button>
                </>
              )}

              <Button variant='ghost' size='sm' disabled={currentPage >= totalPages} onClick={handleNextPage}>
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <CreateEmployeeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateEmployee}
        />
        <UpdateEmployeeModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          employee={selectedEmployee}
          onUpdate={handleUpdateSuccess}
        />
        <BanAccountModal
          isOpen={isBanModalOpen}
          onClose={() => setIsBanModalOpen(false)}
          employeeName={selectedEmployee?.name || ''}
          onConfirm={handleBanEmployee}
        />
      </div>
    </div>
  )
}

export default MyEmployees
