import React, { useRef } from 'react'
import { NavLink } from 'react-router-dom'

import tapMP3 from '@renderer/assets/tap.mp3'

type ButtonType = 'button' | 'submit' | 'reset'

interface KioskButtonProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  soundUrl?: string

  onActivate?: () => void
  to?: string

  type?: ButtonType
  disabled?: boolean
}

const SUBMIT_SOUND_DELAY = 80

const KioskButton: React.FC<KioskButtonProps> = ({
  children,
  className,
  style,
  soundUrl = tapMP3,
  onActivate,
  to,
  type = 'button',
  disabled = false
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl)
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return

    playSound()
    onActivate?.()

    // ✅ Only intercept form submit buttons
    if (type === 'submit' && !to && buttonRef.current) {
      e.preventDefault()

      const form = buttonRef.current.closest('form')
      if (form) {
        setTimeout(() => {
          form.requestSubmit(buttonRef.current!)
        }, SUBMIT_SOUND_DELAY)
      }
    }

    // ✅ DO NOT preventDefault for NavLink
  }

  const baseStyle: React.CSSProperties = {
    opacity: disabled ? 0.5 : 1,
    ...style
  }

  // ✅ NavLink mode
  if (to) {
    return (
      <NavLink
        to={disabled ? '#' : to}
        onPointerDown={handlePointerDown}
        className={className}
        style={baseStyle}
      >
        {children}
      </NavLink>
    )
  }

  // ✅ Button mode
  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      className={className}
      style={baseStyle}
    >
      {children}
    </button>
  )
}

export default KioskButton
