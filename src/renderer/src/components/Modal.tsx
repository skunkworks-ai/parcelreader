import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: any
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur">
      <div className="bg-white rounded-2xl shadow-lg p-10 min-w-[400px] w-[90vw]">
        <h2 className="text-4xl font-bold mb-6 text-center text-[#2E3D3B]">{title}</h2>
        <div className="mb-8">{children}</div>
        <div className="absolute w-full left-0 right-0 flex justify-end gap-4 px-25 mt-20">
          <button
            className="grow shadow-2xl bg-white text-[#2E3D3B] border-3 border-[#2E3D3B] text-2xl font-bold px-10 py-2 rounded-2xl flex items-center justify-center"
            onClick={onClose}
          >
            Go Back
          </button>
          <button
            className="grow shadow-2xl bg-[#2E3D3B] text-white border-3 border-[#2E3D3B] text-2xl font-bold px-10 py-4 rounded-2xl flex items-center justify-center"
            onClick={onConfirm}
          >
            Confirm & Proceed
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
