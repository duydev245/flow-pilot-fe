import { useCallback, useRef } from 'react'

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playBell = useCallback(() => {
    try {
      // Create audio instance if not exists
      if (!audioRef.current) {
        audioRef.current = new Audio('/src/app/assets/bell.mp3')
        audioRef.current.preload = 'auto'
      }

      // Reset audio to beginning and play
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.warn('Failed to play notification sound:', error)
      })
    } catch (error) {
      console.warn('Audio not supported or failed to load:', error)
    }
  }, [])

  const playSound = useCallback((soundPath: string) => {
    try {
      const audio = new Audio(soundPath)
      audio.play().catch((error) => {
        console.warn('Failed to play sound:', error)
      })
    } catch (error) {
      console.warn('Audio not supported or failed to load:', error)
    }
  }, [])

  const stopBell = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    } catch (error) {
      console.warn('Failed to stop bell sound:', error)
    }
  }, [])

  return {
    playBell,
    stopBell,
    playSound
  }
}
