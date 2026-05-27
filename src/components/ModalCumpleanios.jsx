import React from 'react'

export default function ModalViewCumpleanios({ isOpen, onClose, img, title, link, showTitle = true }) {
  if (!isOpen) return null

  const content = (
    <div className="relative w-full max-w-2xl mx-auto">
      {link ? (
        <a href={link} rel="noopener noreferrer" className="block">
          <img src={img} alt={title} className="w-full h-auto max-w-[800px] max-h-[560px] object-cover rounded-2xl" />
        </a>
      ) : (
        <img src={img} alt={title} className="w-full h-auto max-w-[800px] max-h-[560px] object-cover rounded-2xl" />
      )}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white bg-gray-500/50 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
      >
        X
      </button>
    </div>
  )

  return (
    <div className=" fixed inset-0 flex items-center justify-center z-50">
      {/* Fondo semitransparente para el modal */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="animate__animated animate__wobble relative z-10 p-4">
        {content}
      </div>
    </div>
  )
}
