import { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { MyTaskApi } from '@/app/apis/AUTH/performance.api'
import { useAudio } from '@/app/hooks'
import type { RootState } from '@/app/redux/store'
import {
  setCurrentTime,
  setInitialTime,
  setIsRunning,
  setIsCompleted,
  setIsBreakMode,
  setFocusStartTime,
  setTimerVisible,
  decrementTime,
  resetTimer
} from '@/app/redux/slices/timer.slice'
import { AlertPopup } from '@/app/modules/Employee/MyPerformance/partials/AlertPopup'

interface TimerContextType {
  showAlert: boolean
  setShowAlert: (show: boolean) => void
  postFocusTime: (focusedMinutes: number) => Promise<void>
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const timer = useSelector((state: RootState) => state.timer)
  const { playBell, stopBell } = useAudio()
  const [showAlert, setShowAlert] = useState(false)

  // Global timer countdown effect - runs on all pages
  useEffect(() => {
    console.log('Global Timer state:', {
      isRunning: timer.isRunning,
      currentTime: timer.currentTime,
      isBreakMode: timer.isBreakMode
    })

    let interval: NodeJS.Timeout
    if (timer.isRunning && timer.currentTime > 0) {
      interval = setInterval(() => {
        dispatch(decrementTime())
      }, 1000)
    } else if (timer.currentTime === 0 && !timer.isRunning) {
      console.log('Global Timer completion condition met!')
      // Timer completed - play sound and show alert
      playBell()
      setShowAlert(true)
      dispatch(setIsRunning(false))

      // Log focus time if it was a focus session
      if (!timer.isBreakMode && timer.focusStartTime) {
        const focusedMinutes = Math.round(timer.initialTime / 60)
        postFocusTime(focusedMinutes)
      }
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [
    timer.isRunning,
    timer.currentTime,
    timer.isBreakMode,
    timer.focusStartTime,
    timer.initialTime,
    dispatch,
    playBell
  ])

  // Function to post focus time to server
  const postFocusTime = async (focusedMinutes: number) => {
    try {
      await MyTaskApi.postFocusTime(focusedMinutes)
      console.log(`Focus time logged: ${focusedMinutes} minutes`)
    } catch (error) {
      console.error('Failed to log focus time:', error)
    }
  }

  const handleContinueBreak = () => {
    setShowAlert(false)
    stopBell()
    if (!timer.isBreakMode) {
      // Switch to break mode
      dispatch(setIsBreakMode(true))
      dispatch(setFocusStartTime(null))
      const breakTime = timer.breakDuration[0] * 60
      dispatch(setCurrentTime(breakTime))
      dispatch(setInitialTime(breakTime))
      dispatch(setIsRunning(true))
      dispatch(setTimerVisible(true))
    } else {
      // End break, reset for new session
      dispatch(setIsBreakMode(false))
      dispatch(setIsCompleted(true))
      handleReset()
    }
  }

  const handleReset = () => {
    dispatch(resetTimer())
    stopBell()
    setShowAlert(false)
  }

  return (
    <TimerContext.Provider value={{ showAlert, setShowAlert, postFocusTime }}>
      {/* Global AlertPopup - shows on all pages */}
      <AlertPopup
        showAlert={showAlert}
        isBreakMode={timer.isBreakMode}
        breakDuration={timer.breakDuration}
        onContinueBreak={handleContinueBreak}
        onReset={handleReset}
        onClose={() => setShowAlert(false)}
      />
      {children}
    </TimerContext.Provider>
  )
}

export const useTimer = () => {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
