import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import type { 
  OrganizationDashboardSummary
} from '@/app/modules/AdminWs/models/performanceInterface'

interface ChartsGridProps {
  dashboardData: OrganizationDashboardSummary | null
  loading?: boolean
}

export function ChartsGridForReports({ dashboardData, loading }: ChartsGridProps) {
  // Transform API data for charts
  const roleDistributionData = dashboardData?.employeeRoleDistribution ? 
    Object.entries(dashboardData.employeeRoleDistribution).map(([roleName, count], index) => {
      const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
      // Calculate percentage based on total employees
      const percentage = dashboardData.totalEmployees > 0 ? Math.round((count / dashboardData.totalEmployees) * 100) : 0
      return {
        name: roleName,
        value: percentage,
        count: count,
        color: colors[index % colors.length]
      }
    }) : []

  const accountStatusData = dashboardData?.accountStatusOverTime || []

  const growthTrendsData = dashboardData?.employeeGrowthTrends || []

  const topRolesData = dashboardData?.topActiveRoles || []



  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 w-full'>
      <Card className='bg-card border border-border min-w-0'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Employee Role Distribution</CardTitle>
        </CardHeader>
        <CardContent className='min-w-0'>
          {loading || roleDistributionData.length === 0 ? (
            <div className='h-64 flex items-center justify-center'>
              <div className='text-center'>
                {loading ? (
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                ) : (
                  <p className='text-muted-foreground'>No data available</p>
                )}
              </div>
            </div>
          ) : (
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {roleDistributionData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className='grid grid-cols-2 lg:grid-cols-3 gap-2 mt-4 px-2'>
            {loading ? (
              <>
                <div className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
                <div className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
                <div className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
              </>
            ) : (
              roleDistributionData.map((item: any) => (
                <div key={item.name} className='flex items-center space-x-2 min-w-0'>
                  <div className='w-3 h-3 rounded-full flex-shrink-0' style={{ backgroundColor: item.color }} />
                  <span className='text-xs text-muted-foreground truncate' title={`${item.name} (${item.count}) ${item.value}%`}>
                    {item.name} ({item.count}) {item.value}%
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Status Over Time */}
      <Card className='bg-card border border-border min-w-0'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Account Status Over Time</CardTitle>
        </CardHeader>
        <CardContent className='min-w-0'>
          {loading || accountStatusData.length === 0 ? (
            <div className='h-64 flex items-center justify-center'>
              <div className='text-center'>
                {loading ? (
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                ) : (
                  <p className='text-muted-foreground'>No data available</p>
                )}
              </div>
            </div>
          ) : (
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={accountStatusData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='month' stroke='#64748b' />
                  <YAxis stroke='#64748b' />
                  <Tooltip />
                  <Line type='monotone' dataKey='active' stroke='#6366f1' strokeWidth={2} dot={{ fill: '#6366f1' }} />
                  <Line type='monotone' dataKey='inactive' stroke='#ec4899' strokeWidth={2} dot={{ fill: '#ec4899' }} />
                  <Line type='monotone' dataKey='pending' stroke='#8b5cf6' strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className='flex justify-center flex-wrap gap-4 mt-4'>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 rounded-full bg-blue-500' />
              <span className='text-xs text-muted-foreground'>Active</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 rounded-full bg-pink-500' />
              <span className='text-xs text-muted-foreground'>Inactive</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 rounded-full bg-purple-500' />
              <span className='text-xs text-muted-foreground'>Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Growth Trends */}
      <Card className='bg-card border border-border min-w-0'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Employee Growth Trends</CardTitle>
          {loading ? (
            <div className='flex items-center space-x-2 mt-2'>
              <div className='w-6 h-6 rounded-full bg-gray-200 animate-pulse'></div>
              <div>
                <div className='h-4 bg-gray-200 rounded w-20 animate-pulse mb-1'></div>
                <div className='h-3 bg-gray-200 rounded w-16 animate-pulse'></div>
              </div>
            </div>
          ) : (
            <div className='flex items-center space-x-2 mt-2'>
              <div className='w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center'>
                <span className='text-xs font-bold'>{dashboardData?.hrManager?.name?.split(' ').map(n => n[0]).join('') || 'N/A'}</span>
              </div>
              <div>
                <p className='text-sm font-medium'>{dashboardData?.hrManager?.name || 'No HR Manager'}</p>
                <p className='text-xs text-muted-foreground'>{dashboardData?.hrManager?.title || 'HR Manager'}</p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className='min-w-0'>
          {loading || growthTrendsData.length === 0 ? (
            <div className='h-64 flex items-center justify-center'>
              <div className='text-center'>
                {loading ? (
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                ) : (
                  <p className='text-muted-foreground'>No data available</p>
                )}
              </div>
            </div>
          ) : (
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={growthTrendsData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='quarter' stroke='#64748b' />
                  <YAxis stroke='#64748b' />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='newHires' fill='#6366f1' name='New Hires' />
                  <Bar dataKey='departures' fill='#ec4899' name='Departures' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Active Roles */}
      <Card className='bg-card border border-border min-w-0'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Top 5 Active Roles</CardTitle>
        </CardHeader>
        <CardContent className='min-w-0'>
          {loading || topRolesData.length === 0 ? (
            <div className='space-y-4'>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className='flex items-center space-x-3'>
                    <div className='h-4 bg-gray-200 rounded w-32 animate-pulse'></div>
                    <div className='flex-1 bg-gray-200 rounded-full h-6 animate-pulse'></div>
                    <div className='h-4 bg-gray-200 rounded w-8 animate-pulse'></div>
                  </div>
                ))
              ) : (
                <div className='text-center py-8'>
                  <p className='text-muted-foreground'>No role data available</p>
                </div>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {topRolesData.map((role: any, index: number) => {
                const roleName = role.roleName || 'Unknown'
                const roleCount = role.count || 0
                const rolePercentage = role.percentage || 0
                const colors = ['bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500']
                
                return (
                  <div key={roleName} className='flex items-center space-x-3 min-w-0'>
                    <span className='text-sm font-medium w-28 text-left truncate flex-shrink-0' title={roleName}>{roleName}</span>
                    <div className='flex-1 bg-secondary rounded-full h-6 relative min-w-0'>
                      <div
                        className={`h-6 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${Math.max(rolePercentage, 5)}%` }}
                      />
                    </div>
                    <div className='flex items-center space-x-2 flex-shrink-0'>
                      <span className='text-sm font-medium w-8 text-right'>{roleCount}</span>
                      <span className='text-xs text-gray-500 w-12 text-right'>({rolePercentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
