import React, { useRef } from 'react'
import { NavLink } from 'react-router-dom'

import tapSound from './tap.mp3'

interface KioskButtonProps {
  onActivate?: () => void // optional callback
  to?: string // optional NavLink target
  children: React.ReactNode // content inside the button
  style?: React.CSSProperties // optional inline styles
  className?: string // optional className for styling
  soundUrl?: string // optional sound file URL
}

const KioskButton: React.FC<KioskButtonProps> = ({
  onActivate,
  to,
  children,
  style,
  className,
  soundUrl = tapSound
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleTap = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl)
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().catch((err) => console.warn(err))

    if (onActivate) onActivate()
  }

  const commonProps = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault() // prevent ghost clicks
      handleTap()
    },
    className,
    style
  }

  if (to) {
    return (
      <NavLink to={to} {...commonProps}>
        {children}
      </NavLink>
    )
  }

  return <div {...commonProps}>{children}</div>
}

export default KioskButton
