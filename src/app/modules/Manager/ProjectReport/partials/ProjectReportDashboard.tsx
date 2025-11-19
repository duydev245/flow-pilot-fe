import { useEffect, useState } from 'react'
import { PerformanceChart } from '@/app/modules/Manager/ProjectReport/partials/PerformanceChart'
import { TasksByComponentsChart } from '@/app/modules/Manager/ProjectReport/partials/TasksByComponentsChart'
import { MyTaskApi } from '@/app/apis/AUTH/performance.api'
import { getLocalStorage } from '@/app/utils'
import OverviewCards from '@/app/modules/Manager/ProjectReport/partials/OverviewCards'

interface ProjectOverviewData {
  project: {
    id: string
    name: string
    description: string | null
    start_date: string
    end_date: string
    process: number
    team_size: number | null
    status: string
  }
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  inProgressTasks: number
  completionRate: number
}

interface QuarterlyData {
  quarters: string[]
  series: Array<{
    name: string
    data: number[]
    color: string
  }>
  summary: {
    totalTasks: number
    completedTasks: number
    ongoingTasks: number
    notStartedTasks: number
  }
}

export function ProjectReportDashboard() {
  const [projectOverview, setProjectOverview] = useState<ProjectOverviewData | null>(null)
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noProject, setNoProject] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const userLocalStorage: any = getLocalStorage('user')
        console.log('userLocalStorage: ', userLocalStorage)
        const projectId = userLocalStorage?.projectId

        if (!projectId) {
          setNoProject(true)
          setLoading(false)
          return
        }

        const overviewResponse = await MyTaskApi.getManagerProjectOverview(projectId)
        setProjectOverview(overviewResponse.data)

        const quarterlyResponse = await MyTaskApi.getQuarterlyTasksChart(projectId, 2025)
        if (quarterlyResponse.success) {
          setQuarterlyData(quarterlyResponse.data)
        }

        console.log('check', quarterlyResponse.data)
      } catch (err) {
        console.error('Error fetching project data:', err)
        setError('Failed to load project data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className='p-4 sm:p-6 space-y-6 bg-background min-h-screen'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-lg'>Loading project data...</div>
        </div>
      </div>
    )
  }

  if (noProject) {
    return (
      <div className='p-4 sm:p-6 space-y-6 bg-background min-h-screen'>
        <div className='flex items-center justify-center h-screen'>
          <div className='max-w-md w-full mx-4 bg-card rounded-lg shadow-lg p-6'>
            <div className='text-center space-y-4'>
              <div className='text-center'>
                <h2 className='text-xl font-semibold text-red-600 mb-4'>No access</h2>
              </div>
              <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <p className='text-foreground'>You must be assigned to a project to access this page.</p>
              <p className='text-sm text-muted-foreground'>
                Please contact the administrator to be assigned to a project.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 sm:p-6 space-y-6 bg-background min-h-screen'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-lg text-red-500'>{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className='p-4 sm:p-6 space-y-6 bg-background min-h-screen'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>Overview</h1>
      </div>

      <OverviewCards data={projectOverview} />

      <div className='space-y-6'>
        <h2 className='text-xl sm:text-2xl font-semibold text-foreground'>Detailed reports</h2>

        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch'>
          <div className='xl:col-span-2 min-h-[480px]'>
            <TasksByComponentsChart data={quarterlyData} />
          </div>

          <div className='xl:col-span-1 min-h-[480px]'>
            <PerformanceChart />
          </div>
        </div>
      </div>
    </div>
  )
}
