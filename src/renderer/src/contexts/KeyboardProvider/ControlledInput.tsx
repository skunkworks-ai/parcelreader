import React, { useRef, useEffect } from 'react'
import { useKeyboard } from './KeyboardProvider'

const ControlledInput: React.FC<{
  value: string
  setValue: React.Dispatch<string>
  placeholder?: string
}> = ({ value, setValue, placeholder }) => {
  const { registerInput, unregisterInput } = useKeyboard()
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (ref.current) registerInput(ref.current, setValue)
    return () => {
      if (ref.current) unregisterInput(ref.current)
    }
  }, [ref.current])

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="border border-[#2E3D3B] p-3 w-full text-xl rounded mb-3"
    />
  )
}

export default ControlledInput
