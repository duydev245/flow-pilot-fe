import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface QuarterlyData {
  quarters: string[]
  series: Array<{
    name: string
    data: number[]
    color: string
  }>
}

interface TasksByComponentsChartProps {
  data?: QuarterlyData | null
}

export function TasksByComponentsChart({ data }: TasksByComponentsChartProps) {
  // Dữ liệu fallback nếu chưa có API
  const chartData = data?.quarters.map((q, i) => ({
    name: q,
    Completed: data.series[0].data[i],
    'On-going': data.series[1].data[i],
    'Not started': data.series[2].data[i]
  })) || [
    { name: 'Q1', Completed: 80, 'On-going': 10, 'Not started': 60 },
    { name: 'Q2', Completed: 70, 'On-going': 40, 'Not started': 35 },
    { name: 'Q3', Completed: 55, 'On-going': 90, 'Not started': 25 },
    { name: 'Q4', Completed: 65, 'On-going': 15, 'Not started': 70 }
  ]

  return (
    <Card className='bg-card border-border h-full'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold text-foreground'>Tasks by quarter</CardTitle>
      </CardHeader>

      <CardContent className='h-[360px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} barGap={8} barCategoryGap='15%'>
            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
            <XAxis dataKey='name' axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend verticalAlign='top' height={36} />
            <Bar dataKey='Completed' fill='#3B82F6' radius={[4, 4, 0, 0]} />
            <Bar dataKey='On-going' fill='#22C55E' radius={[4, 4, 0, 0]} />
            <Bar dataKey='Not started' fill='#FACC15' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
