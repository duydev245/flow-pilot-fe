import { projectApi } from '@/app/apis/AUTH/project.api'
import { getUserInfo } from '@/app/apis/AUTH/user.api'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import type { IUserStatePayload } from '@/app/models'
import type { ITeamMember } from '@/app/modules/Manager/MyTeamManager/models/TeamInterface'
import { getLocalStorage } from '@/app/utils'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

function MyTeam() {
  const [projectId, setProjectId] = useState<string>('')
  const [hasProject, setHasProject] = useState<boolean>(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    const userLocalStorage: IUserStatePayload = getLocalStorage('user')
    if (userLocalStorage?.projectId) {
      setProjectId(userLocalStorage.projectId)
      setHasProject(true)
    } else {
      setHasProject(false)
    }
  }, [])

  const {
    data: projectData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectById(projectId),
    enabled: !!projectId
  })

  const {
    data: userDetail,
    isLoading: isUserDetailLoading,
    error: userDetailError
  } = useQuery({
    queryKey: ['userInfo', selectedUserId],
    queryFn: () => getUserInfo(selectedUserId!),
    enabled: !!selectedUserId && isDialogOpen
  })

  const members = projectData?.data?.members || []

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'product manager':
      case 'project manager':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'developer':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'designer':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSystemRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'PROJECTMANAGER':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'EMPLOYEE':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatSystemRole = (role: string) => {
    switch (role.toUpperCase()) {
      case 'PROJECTMANAGER':
        return 'Project Manager'
      case 'EMPLOYEE':
        return 'Employee'
      case 'ADMIN':
        return 'Admin'
      default:
        return role
    }
  }

  // Check if user has project assigned
  if (!hasProject) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Card className='max-w-md w-full mx-4'>
          <CardHeader>
            <CardTitle className='text-center text-red-600'>No access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center space-y-4'>
              <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <p className='text-gray-700'>You must be assigned to a project to access this page.</p>
              <p className='text-sm text-gray-500'>Please contact the administrator to be assigned to a project.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-gray-500'>Loading team members...</div>
      </div>
    )
  }

  if (error || !projectData?.success) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-red-500'>Error loading team members</div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Team</h1>
          <p className='text-gray-600 mt-1'>Manage and view your team members for project: {projectData?.data?.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>No team members found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Project Role</TableHead>
                  <TableHead>System Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member: ITeamMember) => (
                  <TableRow key={member.id}>
                    <TableCell className='font-medium'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                          {member.user.avatar_url ? (
                            <img
                              src={member.user.avatar_url}
                              alt={member.user.name}
                              className='w-8 h-8 rounded-full object-cover'
                            />
                          ) : (
                            <span className='text-sm font-medium text-gray-600'>
                              {member.user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span>{member.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSystemRoleBadgeColor(member.user.role.role)}>{formatSystemRole(member.user.role.role)}</Badge>
                    </TableCell>
                    <TableCell>{member.user.department?.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(member.user.id)
                          setIsDialogOpen(true)
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) setSelectedUserId(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {isUserDetailLoading ? (
            <div className='text-center py-4'>Loading user details...</div>
          ) : userDetailError ? (
            <div className='text-center py-4 text-red-500'>Error loading user details</div>
          ) : userDetail?.data ? (
            <div className='space-y-4'>
              <div className='flex items-center space-x-4'>
                <div className='w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center'>
                  {userDetail.data.avatar_url ? (
                    <img
                      src={userDetail.data.avatar_url}
                      alt={userDetail.data.name}
                      className='w-16 h-16 rounded-full object-cover'
                    />
                  ) : (
                    <span className='text-2xl font-medium text-gray-600'>
                      {userDetail.data.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>{userDetail.data.name}</h3>
                  <p className='text-gray-600'>{userDetail.data.email}</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>Phone</label>
                  <p>{userDetail.data.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>Address</label>
                  <p>{userDetail.data.address || 'N/A'}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>Bio</label>
                  <p>{userDetail.data.bio || 'N/A'}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>Nickname</label>
                  <p>{userDetail.data.nickname || 'N/A'}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>Status: </label>
                  <Badge className={`text-xs px-2 py-1 ${userDetail.data.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {userDetail.data.status}
                  </Badge>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MyTeam
