import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { MyTaskApi } from '@/app/apis/AUTH/performance.api'
import type { RootState } from '@/app/redux/store'
import {
  setCurrentTime,
  setInitialTime,
  setIsRunning,
  setSelectedMode,
  setFocusDuration,
  setBreakDuration,
  setFocusStartTime,
  setTimerVisible,
  resetTimer,
  changeModeAndReset
} from '@/app/redux/slices/timer.slice'
import type { FocusLog } from './models/perfomance.type'
import { MetricsCards } from './partials/MetricsCards'
import { PersonalNotifications } from './partials/PersonalNotifications'
import { PriorityTasks } from './partials/PriorityTasks'
import { TimerSection } from './partials/TimerSection'
import { TimerSettings } from './partials/TimerSettings'
import { WeeklyFocusHistory } from './partials/WeeklyFocusHistory'

export default function FlowpilotDashboard() {
  const dispatch = useDispatch()
  const timer = useSelector((state: RootState) => state.timer)

  const [focusLogData, setFocusLogData] = useState<FocusLog[]>([])
  const [loadingFocusLog, setLoadingFocusLog] = useState(true)

  useEffect(() => {
    const fetchFocusLog = async () => {
      try {
        setLoadingFocusLog(true)
        const response = await MyTaskApi.getFocusMe()
        if (response.success) {
          setFocusLogData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch focus log:', error)
      } finally {
        setLoadingFocusLog(false)
      }
    }

    fetchFocusLog()
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (timer.isCompleted) {
      dispatch(resetTimer())
    }

    // Start focus session (not break mode)
    if (!timer.isRunning && !timer.isBreakMode) {
      dispatch(setFocusStartTime(Date.now()))
      dispatch(setTimerVisible(true))
    }

    dispatch(setIsRunning(!timer.isRunning))
  }

  const handleReset = () => {
    dispatch(resetTimer())
  }

  const handleModeChange = (mode: string) => {
    let newFocusDuration, newBreakDuration
    switch (mode) {
      case 'pomodoro':
        newFocusDuration = [25]
        newBreakDuration = [5]
        break
      case 'deep':
        newFocusDuration = [45]
        newBreakDuration = [10]
        break
      case 'marathon':
        newFocusDuration = [60]
        newBreakDuration = [15]
        break
      default:
        newFocusDuration = [25]
        newBreakDuration = [5]
    }

    dispatch(
      changeModeAndReset({
        mode,
        focusDuration: newFocusDuration,
        breakDuration: newBreakDuration
      })
    )
  }

  const getCircleProgress = () => {
    if (timer.isCompleted) {
      return 2 * Math.PI * 45
    }
    const progress = (timer.initialTime - timer.currentTime) / timer.initialTime
    return 2 * Math.PI * 45 * progress
  }

  const handleFocusDurationChange = (value: number[]) => {
    dispatch(setFocusDuration(value))
    if (timer.selectedMode !== 'custom') {
      dispatch(setSelectedMode('custom'))
    }
    if (!timer.isRunning) {
      const newTime = value[0] * 60
      dispatch(setCurrentTime(newTime))
      dispatch(setInitialTime(newTime))
    }
  }

  const handleBreakDurationChange = (value: number[]) => {
    dispatch(setBreakDuration(value))
    if (timer.selectedMode !== 'custom') {
      dispatch(setSelectedMode('custom'))
    }
  }

  return (
    <div className=''>
      <div className='p-6'>
        <MetricsCards />

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          <div className='col-span-3'>
            <TimerSection
              selectedMode={timer.selectedMode}
              currentTime={timer.currentTime}
              isRunning={timer.isRunning}
              isCompleted={timer.isCompleted}
              isBreakMode={timer.isBreakMode}
              onModeChange={handleModeChange}
              onStart={handleStart}
              onReset={handleReset}
              formatTime={formatTime}
              getCircleProgress={getCircleProgress}
            />
            <PersonalNotifications />
          </div>

          <div className='space-y-6'>
            <PriorityTasks />

            <TimerSettings
              focusDuration={timer.focusDuration}
              breakDuration={timer.breakDuration}
              selectedMode={timer.selectedMode}
              onFocusDurationChange={handleFocusDurationChange}
              onBreakDurationChange={handleBreakDurationChange}
              onModeChange={(mode: string) => dispatch(setSelectedMode(mode))}
            />

            <WeeklyFocusHistory focusLogData={focusLogData} loading={loadingFocusLog} />
          </div>
        </div>
      </div>
    </div>
  )
}
