import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'
import Keyboard from 'react-simple-keyboard'

import tapMP3 from '@renderer/assets/tap.mp3'
import backspaceSVG from './backspace.svg'
import shiftSVG from './shift.svg'
import spacebarSVG from './spacebar.svg'

import 'react-simple-keyboard/build/css/index.css'
import './Keyboard.css'

type LayoutName = 'default' | 'shift' | 'numeric'

interface KeyboardContextProps {
  show: () => void
  hide: () => void
  toggle: () => void
  registerInput: (
    el: HTMLInputElement | HTMLTextAreaElement,
    setter: React.Dispatch<string>
  ) => void
  unregisterInput: (el: HTMLInputElement | HTMLTextAreaElement) => void
}

const KeyboardContext = createContext<KeyboardContextProps | undefined>(undefined)

export const useKeyboard = () => {
  const ctx = useContext(KeyboardContext)
  if (!ctx) throw new Error('useKeyboard must be used within KeyboardProvider')
  return ctx
}

interface KeyboardProviderProps {
  children: ReactNode
}

export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ children }) => {
  const [layoutName, setLayoutName] = useState<LayoutName>('default')
  const [visible, setVisible] = useState(false)
  const keyboardRef = useRef<any | null>(null)
  const tapSound = new Audio(tapMP3)

  // Map of inputs to their React state setters
  const inputSetters = useRef(
    new Map<HTMLInputElement | HTMLTextAreaElement, React.Dispatch<string>>()
  ).current

  const registerInput = (
    el: HTMLInputElement | HTMLTextAreaElement,
    setter: React.Dispatch<string>
  ) => {
    inputSetters.set(el, setter)
  }

  const unregisterInput = (el: HTMLInputElement | HTMLTextAreaElement) => {
    inputSetters.delete(el)
  }

  // Keyboard layouts
  const layout = {
    default: [
      '1 2 3 4 5 6 7 8 9 0 {bksp}',
      'q w e r t y u i o p { }',
      'a s d f g h j k l :',
      '{shift} z x c v b n m , . ? {shift}',
      '{space}'
    ],
    shift: [
      '! @ # $ % ^ & * ( ) {bksp}',
      'Q W E R T Y U I O P [ ]',
      'A S D F G H J K L ;',
      '{shift} Z X C V B N M , . / {shift}',
      '{space}'
    ],
    numeric: ['1 2 3', '4 5 6', '7 8 9', '0 {bksp} {abc}']
  }

  // Helper functions for caret-aware insertion
  const insertAtCaretState = (
    currentValue: string,
    char: string,
    selectionStart: number,
    selectionEnd: number
  ): { newValue: string; newCaret: number } => {
    const newValue = currentValue.slice(0, selectionStart) + char + currentValue.slice(selectionEnd)
    return { newValue, newCaret: selectionStart + char.length }
  }

  const backspaceAtCaretState = (
    currentValue: string,
    selectionStart: number,
    selectionEnd: number
  ): { newValue: string; newCaret: number } => {
    if (selectionStart === 0 && selectionEnd === 0)
      return { newValue: currentValue, newCaret: selectionStart }
    const newValue = currentValue.slice(0, selectionStart - 1) + currentValue.slice(selectionEnd)
    return { newValue, newCaret: selectionStart - 1 }
  }

  const deleteAtCaretState = (
    currentValue: string,
    selectionStart: number,
    selectionEnd: number
  ): { newValue: string; newCaret: number } => {
    const newValue = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd + 1)
    return { newValue, newCaret: selectionStart }
  }

  // Key press handler
  const handleKeyPress = (button: string) => {
    // Play sound (non-blocking)
    tapSound.currentTime = 0
    tapSound.play().catch(() => {
      /* ignore play errors */
    })

    const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null
    if (!active) return

    const setter = inputSetters.get(active)
    if (!setter) return

    const start = active.selectionStart || 0
    const end = active.selectionEnd || 0
    const currentValue = active.value

    let newValue = currentValue
    let newCaret = start

    switch (button) {
      case '{shift}':
        setLayoutName(layoutName === 'default' ? 'shift' : 'default')
        return

      case '{numeric}':
        setLayoutName('numeric')
        return

      case '{abc}':
        setLayoutName('default')
        return

      case '{bksp}': {
        const res = backspaceAtCaretState(currentValue, start, end)
        newValue = res.newValue
        newCaret = res.newCaret
        break
      }

      case '{del}': {
        const res = deleteAtCaretState(currentValue, start, end)
        newValue = res.newValue
        newCaret = res.newCaret
        break
      }

      case '{enter}': {
        const res = insertAtCaretState(currentValue, '\n', start, end)
        newValue = res.newValue
        newCaret = res.newCaret
        break
      }

      case '{space}': {
        const res = insertAtCaretState(currentValue, ' ', start, end)
        newValue = res.newValue
        newCaret = res.newCaret
        break
      }

      default: {
        const res = insertAtCaretState(currentValue, button, start, end)
        newValue = res.newValue
        newCaret = res.newCaret
        break
      }
    }

    // update React state
    setter(newValue)

    // restore caret after render
    requestAnimationFrame(() => {
      active.setSelectionRange(newCaret, newCaret)
      active.focus()
    })
  }

  // Auto-show/hide keyboard on input focus
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') setVisible(true)
    }
    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') setVisible(false)
    }

    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)

    return () => {
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
    }
  }, [])

  return (
    <KeyboardContext.Provider
      value={{
        show: () => setVisible(true),
        hide: () => setVisible(false),
        toggle: () => setVisible((v) => !v),
        registerInput,
        unregisterInput
      }}
    >
      {children}
      {visible && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 999 }}>
          <Keyboard
            keyboardRef={(r) => (keyboardRef.current = r)}
            layout={layout}
            layoutName={layoutName}
            onKeyPress={handleKeyPress}
            preventMouseDownDefault={true} // keeps focus
            physicalKeyboardHighlight={false}
            display={{
              '{bksp}': `<img src="${backspaceSVG}" alt="Backspace" style="width:50px;" />`,
              '{shift}': `<img src="${shiftSVG}" alt="Backspace" style="width:50px;" />`,
              '{space}': `<img src="${spacebarSVG}" alt="Backspace" style="width:50px;" />`
            }}
          />
        </div>
      )}
    </KeyboardContext.Provider>
  )
}
