import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { Button } from '@/app/components/ui/button'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProjectMember } from '../models/project-detail.type'

interface ProjectMembersTableProps {
  members: ProjectMember[]
}

export function ProjectMembersTable({ members }: ProjectMembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRating, setSelectedRating] = useState('all')
  const [selectedJobTitle, setSelectedJobTitle] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // --- Pagination ---
  const [page, setPage] = useState(1)
  const pageSize = 10

  // --- Filter ---
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRating = selectedRating === 'all' || member.avgQuality?.toString() === selectedRating
      const matchesJobTitle = selectedJobTitle === 'all' || member.job_title === selectedJobTitle
      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus

      return matchesSearch && matchesRating && matchesJobTitle && matchesStatus
    })
  }, [members, searchQuery, selectedRating, selectedJobTitle, selectedStatus])

  // --- Pagination logic ---
  const totalPages = Math.ceil(filteredMembers.length / pageSize)
  const paginatedMembers = filteredMembers.slice((page - 1) * pageSize, page * pageSize)

  // --- Filter reset ---
  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedRating('all')
    setSelectedJobTitle('all')
    setSelectedStatus('all')
  }

  const hasActiveFilters =
    searchQuery || selectedRating !== 'all' || selectedJobTitle !== 'all' || selectedStatus !== 'all'

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl font-bold'>Project Members</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className='flex items-center gap-4 mb-6 flex-wrap'>
          <div className='relative flex-1 min-w-[250px]'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              placeholder='Search by name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>

          <Select value={selectedRating} onValueChange={setSelectedRating}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='All Rating' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Rating</SelectItem>
              <SelectItem value='3'>3.0</SelectItem>
              <SelectItem value='3.5'>3.5</SelectItem>
              <SelectItem value='4'>4.0</SelectItem>
              <SelectItem value='4.5'>4.5</SelectItem>
              <SelectItem value='5'>5.0</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedJobTitle} onValueChange={setSelectedJobTitle}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='All Job Titles' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Job Titles</SelectItem>
              <SelectItem value='Developer'>Developer</SelectItem>
              <SelectItem value='Analyst'>Analyst</SelectItem>
              <SelectItem value='Designer'>Designer</SelectItem>
              <SelectItem value='Manager'>Manager</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className='w-[120px]'>
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

        {/* Table */}
        <div className='border rounded-lg overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='text-xs font-medium text-gray-500 uppercase'>AVATAR</TableHead>
                <TableHead className='text-xs font-medium text-gray-500 uppercase'>NAME</TableHead>
                <TableHead className='text-xs font-medium text-gray-500 uppercase'>JOB TITLE</TableHead>
                <TableHead className='text-xs font-medium text-gray-500 uppercase text-center'>TASK ASSIGNED</TableHead>
                <TableHead className='text-xs font-medium text-gray-500 uppercase text-center'>
                  TASK COMPLETED
                </TableHead>
                <TableHead className='text-xs font-medium text-gray-500 uppercase text-center'>TASK OVERDUE</TableHead>
                <TableHead className='text-xs font-medium text-gray-500 uppercase text-center'>RATING</TableHead>
                <TableHead className='text-xs font-medium text-gray-500 uppercase text-center'>PERFORMANCE</TableHead>
                <TableHead className='text-xs font-medium text-gray-500 uppercase text-center'>STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.id} className='hover:bg-gray-50'>
                  <TableCell>
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className='font-medium'>{member.name}</TableCell>
                  <TableCell className='text-gray-600'>{member.job_title}</TableCell>
                  <TableCell className='text-center'>{member.assignedTasks}</TableCell>
                  <TableCell className='text-center'>{member.completedTasks}</TableCell>
                  <TableCell className='text-center'>{member.overdueTasks}</TableCell>
                  <TableCell className='text-center'>{member.avgQuality?.toFixed(1)}/5</TableCell>
                  <TableCell className='text-center'>
                    <div className='w-20 mx-auto'>
                      <Progress value={member.avgQuality * 20} className='h-2' />
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      variant='secondary'
                      className={
                        member.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 border-0'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-0'
                      }
                    >
                      {member.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className='text-center text-gray-500 py-6'>
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between mt-6'>
          <div className='text-sm text-gray-500'>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredMembers.length)} of{' '}
            {filteredMembers.length} results
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

            {/* Render max 3 pages visible */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 2), page + 1)
              .map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'ghost'}
                  size='sm'
                  className={pageNum === page ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}

            <Button
              variant='ghost'
              size='sm'
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
