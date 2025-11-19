import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import { projectApi } from '@/app/apis/AUTH/project.api'
import { getLocalStorage } from '@/app/utils'

interface RoleData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6']

export function PerformanceChart() {
  const [roleData, setRoleData] = useState<RoleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true)
        setError(null)

        const userLocalStorage: any = getLocalStorage('user')
        const projectId = userLocalStorage?.projectId

        if (!projectId) {
          setError('No project found')
          setLoading(false)
          return
        }

        const response = await projectApi.getProjectById(projectId)

        if (response.success && response.data) {
          const members = response.data.members || []

          // Count members by role
          const roleCounts: Record<string, number> = {}
          members.forEach((member) => {
            const role = member.role
            roleCounts[role] = (roleCounts[role] || 0) + 1
          })

          // Convert to chart data with colors
          const chartData: RoleData[] = Object.entries(roleCounts).map(([role, count], index) => ({
            name: role,
            value: count,
            color: COLORS[index % COLORS.length]
          }))

          setRoleData(chartData)
        }
      } catch (err) {
        console.error('Error fetching project data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [])

  if (loading) {
    return (
      <Card className='bg-card border-border h-full'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-foreground'>Team Roles Distribution</CardTitle>
        </CardHeader>
        <CardContent className='h-[320px] flex items-center justify-center'>
          <div className='text-muted-foreground'>Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (error || roleData.length === 0) {
    return (
      <Card className='bg-card border-border h-full'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-foreground'>Team Roles Distribution</CardTitle>
        </CardHeader>
        <CardContent className='h-[320px] flex items-center justify-center'>
          <div className='text-muted-foreground'>{error || 'No data available'}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bg-card border-border h-full'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold text-foreground'>Team Roles Distribution</CardTitle>
      </CardHeader>

      <CardContent className='h-[320px] flex items-center justify-center'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={roleData}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey='value'
              labelLine={false}
              label={({ percent }) => `${(Number(percent) * 100).toFixed(0)}%`}
            >
              {roleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign='bottom' height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
