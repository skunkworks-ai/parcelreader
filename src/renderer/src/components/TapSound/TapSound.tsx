import React, { ReactNode, useCallback, useRef } from 'react'

type TapSoundProps = {
  children: ReactNode
  soundSrc?: string
}

import tapMP3 from '@renderer/assets/tap.mp3'

export const TapSound: React.FC<TapSoundProps> = ({ children, soundSrc = tapMP3 }) => {
  const lastTouchTime = useRef(0)

  const playSound = useCallback(() => {
    const audio = new Audio(soundSrc)
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [soundSrc])

  const handleTouchStartCapture = () => {
    lastTouchTime.current = Date.now()
    playSound()
  }

  const handleClickCapture = () => {
    const now = Date.now()

    // Ignore click if it was triggered by a recent touch
    if (now - lastTouchTime.current < 500) return

    playSound()
  }

  return (
    <div
      onPointerDown={handleTouchStartCapture}
      onPointerDownCapture={handleClickCapture}
      style={{ display: 'inline-block' }}
    >
      {children}
    </div>
  )
}
