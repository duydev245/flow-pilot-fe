import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { PATH } from '@/app/routes/path'
import { MyTaskApi } from '@/app/apis/AUTH/performance.api'
import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

// API Response Interface
interface PerformanceData {
  userInfo: {
    name: string
    role: string
    department: string
    joinDate: string
    status: string
  }
  stressRate: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
      colors: string[]
    }>
  }
  workPerformance: {
    series: Array<{
      name: string
      value: number
      color: string
    }>
  }
  stressAnalyzing: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
      color: string
    }>
    warning: boolean
  }
  aiSummary: string
  aiInsights: {
    keyInsights: string[]
    recommendations: string[]
    riskFactors: string[]
    performanceScore: number
  }
}

// Mock API response data - replace with actual API call
const mockApiResponse: PerformanceData = {
  userInfo: {
    name: 'Unknown',
    role: 'Software Engineer',
    department: 'Product Department',
    joinDate: '2025-10-07T13:28:48.528Z',
    status: 'Active'
  },
  stressRate: {
    categories: ['Difficult Task', 'Easy Task', 'Medium Task'],
    series: [
      {
        name: 'Stress Level',
        data: [60, 80, 70],
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
      }
    ]
  },
  workPerformance: {
    series: [
      {
        name: 'Completed',
        value: 45,
        color: '#8B5CF6'
      },
      {
        name: 'In Progress',
        value: 25,
        color: '#EC4899'
      },
      {
        name: 'In Review',
        value: 20,
        color: '#10B981'
      },
      {
        name: 'Other',
        value: 10,
        color: '#F59E0B'
      }
    ]
  },
  stressAnalyzing: {
    categories: ['2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'],
    series: [
      {
        name: 'Burnout Index (%)',
        data: [80, 70, 60, 50, 40, 30],
        color: '#8B5CF6'
      },
      {
        name: 'Quality Score (%)',
        data: [60, 65, 70, 75, 80, 85],
        color: '#EC4899'
      }
    ],
    warning: true
  },
  aiSummary: 'Performance analysis shows consistent improvement in productivity with well-balanced stress levels.',
  aiInsights: {
    keyInsights: [
      'Strong performance in project completion',
      'Good work-life balance maintained',
      'Team collaboration skills are excellent'
    ],
    recommendations: [
      'Continue current workflow practices',
      'Consider mentoring junior team members',
      'Focus on advanced skill development'
    ],
    riskFactors: [],
    performanceScore: 85
  }
}

// Transform API data for charts
const transformStressRateData = (apiData: PerformanceData) => {
  return apiData.stressRate.categories.map((category, index) => ({
    name: category,
    value: apiData.stressRate.series[0]?.data[index] || 0,
    fill: apiData.stressRate.series[0]?.colors[index] || '#8884d8'
  }))
}

const transformStressAnalysisData = (apiData: PerformanceData) => {
  return apiData.stressAnalyzing.categories.map((category, index) => ({
    period: category,
    burnoutIndex: apiData.stressAnalyzing.series[0]?.data[index] || 0,
    qualityScore: apiData.stressAnalyzing.series[1]?.data[index] || 0
  }))
}

export default function MyTeamManagerDetail() {
  const navigate = useNavigate()
  const { id: userId } = useParams<{ id: string }>()
  console.log('userId from params:', userId)

  // State for API data
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      console.log('Fetching performance data for userId:', userId)
      if (!userId) {
        setError('User ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await MyTaskApi.getIndividualDashboard(userId, 'monthly', '2025-01-01', '2025-03-31')

        if (response.success && response.data) {
          setPerformanceData(response.data as PerformanceData)
          setError(null)
        } else {
          setError('Failed to fetch performance data')
        }
      } catch (err) {
        setError('Error fetching performance data')
        console.error('API Error:', err)
        // Fallback to mock data in case of error
        setPerformanceData(mockApiResponse)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [userId])

  // Use mock data as fallback
  const currentData = performanceData || mockApiResponse

  // Transform data for charts
  const stressRateChartData = transformStressRateData(currentData)
  const stressAnalysisChartData = transformStressAnalysisData(currentData)

  // Format join date for display
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const handleBack = () => {
    navigate(PATH.EMPLOYEE_MANAGE_MY_TEAM)
  }

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
          <p className='mt-4 text-gray-600'>Loading performance data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !performanceData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen '>
      {/* Header Project Title */}
      <div className='bg-white px-6 '>
        <Button onClick={handleBack} variant='outline' size='sm'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to My Team
        </Button>
      </div>

      {/* Employee Info */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                {currentData.userInfo.name} | {currentData.userInfo.role} | {currentData.userInfo.department}
              </h1>
              <div className='flex items-center space-x-4 mt-1'>
                <span className='text-sm text-gray-600'>
                  Joined: <span className='text-gray-800'>{formatJoinDate(currentData.userInfo.joinDate)}</span>
                </span>
                <span className='text-sm text-gray-600'>
                  Current Status:
                  <Badge variant='outline' className='ml-2 bg-green-50 text-green-700 border-green-200'>
                    {currentData.userInfo.status}
                  </Badge>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6'>
        {/* Left Column */}
        <div className='space-y-6'>
          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>🤖</span>
                </div>
                <span>AI Performance Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* AI Summary */}
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>Summary</h4>
                  <p className='text-sm text-blue-800'>{currentData.aiSummary}</p>
                </div>

                {/* Performance Score */}
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <span className='text-sm font-medium text-gray-700'>Performance Score</span>
                  <Badge 
                    className={`text-sm px-3 py-1 ${
                      currentData.aiInsights.performanceScore >= 80 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : currentData.aiInsights.performanceScore >= 60
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {currentData.aiInsights.performanceScore}/100
                  </Badge>
                </div>

                {/* Key Insights */}
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>Key Insights</h4>
                  <ul className='space-y-1'>
                    {currentData.aiInsights.keyInsights.map((insight, index) => (
                      <li key={index} className='text-sm text-gray-700 flex items-start'>
                        <span className='text-blue-500 mr-2'>•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>Recommendations</h4>
                  <ul className='space-y-1'>
                    {currentData.aiInsights.recommendations.map((recommendation, index) => (
                      <li key={index} className='text-sm text-gray-700 flex items-start'>
                        <span className='text-green-500 mr-2'>→</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                {currentData.aiInsights.riskFactors.length > 0 && (
                  <div>
                    <h4 className='font-medium text-red-900 mb-2'>Risk Factors</h4>
                    <ul className='space-y-1'>
                      {currentData.aiInsights.riskFactors.map((risk, index) => (
                        <li key={index} className='text-sm text-red-700 flex items-start'>
                          <span className='text-red-500 mr-2'>⚠</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Performance (PieChart) */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Work performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={currentData.workPerformance.series}
                      cx='50%'
                      cy='50%'
                      outerRadius={100}
                      dataKey='value'
                      label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                    >
                      {currentData.workPerformance.series.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Stress Rate (BarChart) */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Stress Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={stressRateChartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='value' fill='#8884d8' name='Stress Level' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stress Analyzing (LineChart) */}
          <Card className={`border-2 ${currentData.stressAnalyzing.warning ? 'border-red-200' : 'border-purple-200'}`}>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>Stress analyzing</CardTitle>
                {currentData.stressAnalyzing.warning && (
                  <Badge className='bg-red-100 text-red-800 border-red-300'>Warning</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={stressAnalysisChartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='period' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='burnoutIndex'
                      stroke={currentData.stressAnalyzing.series[0]?.color || '#8b5cf6'}
                      strokeWidth={2}
                      name={currentData.stressAnalyzing.series[0]?.name || 'Burnout Index (%)'}
                    />
                    <Line
                      type='monotone'
                      dataKey='qualityScore'
                      stroke={currentData.stressAnalyzing.series[1]?.color || '#ec4899'}
                      strokeWidth={2}
                      name={currentData.stressAnalyzing.series[1]?.name || 'Quality Score (%)'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
