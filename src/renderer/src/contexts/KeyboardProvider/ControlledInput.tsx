import { useRef, useEffect, useState } from 'react'
import { useKeyboard } from './useKeyboard'

type ControlledInputProps = {
  value: string
  setValue: React.Dispatch<string>
  placeholder?: string
  required?: boolean
}

const ControlledInput: React.FC<ControlledInputProps> = ({
  value,
  setValue,
  placeholder,
  required = false
}) => {
  const { registerInput, unregisterInput } = useKeyboard()
  const ref = useRef<HTMLInputElement | null>(null)
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const inputEl = ref.current
    if (inputEl) registerInput(inputEl, setValue)
    return () => {
      if (inputEl) unregisterInput(inputEl)
    }
  }, [registerInput, unregisterInput, setValue])

  const handleBlur = (): void => {
    setTouched(true)
    if (required && value.trim() === '') {
      setError('This field is required.')
    } else {
      setError('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value)
    if (required && touched && e.target.value.trim() === '') {
      setError('This field is required.')
    } else {
      setError('')
    }
  }

  return (
    <div>
      <input
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`border p-3 w-full text-xl rounded mb-3 ${error ? 'border-red-500' : 'border-[#2E3D3B]'}`}
        aria-invalid={!!error}
        aria-required={required}
      />
      <div
        className={`text-sm mb-2 min-h-[1.25rem] ${error ? 'text-red-500' : 'text-transparent'}`}
      >
        {error || '.'}
      </div>
    </div>
  )
}

export default ControlledInput
