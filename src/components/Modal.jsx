import React, { useEffect, useMemo, useState } from 'react'

export default function ModalView({ isOpen, onClose, img, title, link, showTitle = true, slides = [] }) {
  const normalizedSlides = useMemo(() => {
    const providedSlides = slides
      .filter((slide) => slide?.img)
      .map((slide) => ({
        img: slide.img,
        title: slide.title || '',
        link: slide.link || '',
      }))

    if (providedSlides.length > 0) {
      return providedSlides
    }

    return img ? [{ img, title: title || '', link: link || '' }] : []
  }, [img, link, slides, title])

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(0)
      return
    }

    if (normalizedSlides.length <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % normalizedSlides.length)
    }, 3500)

    return () => window.clearInterval(intervalId)
  }, [isOpen, normalizedSlides.length])

  if (!isOpen) return null
  if (normalizedSlides.length === 0) return null

  const content = (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl bg-white p-4 shadow-2xl">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {normalizedSlides.map((slide, index) => (
            <div key={`${slide.img}-${index}`} className="flex h-[68vh] w-full shrink-0 items-center justify-center bg-white px-2 py-2">
              {slide.link ? (
                <a href={slide.link} target="_blank" rel="noopener noreferrer" className="flex h-full w-full items-center justify-center">
                  <img src={slide.img} alt={slide.title} className="block max-h-full max-w-full object-contain" />
                </a>
              ) : (
                <img src={slide.img} alt={slide.title} className="block max-h-full max-w-full object-contain" />
              )}
            </div>
          ))}
        </div>
      </div>
      {showTitle && normalizedSlides[activeIndex]?.title && (
        <div className="mt-0 rounded-b-2xl bg-black bg-opacity-75 px-4 py-3 text-white">
          {normalizedSlides[activeIndex].title}
        </div>
      )}
      {normalizedSlides.length > 1 && (
        <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-2">
          {normalizedSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${index === activeIndex ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Ir a la imagen ${index + 1}`}
            />
          ))}
        </div>
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
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="animate__animated animate__wobble relative z-10 p-4">
        {content}
      </div>
    </div>
  )
}
