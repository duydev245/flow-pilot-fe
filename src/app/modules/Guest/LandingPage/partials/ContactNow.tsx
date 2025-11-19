import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATH } from '@/app/routes/path'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ContactNow = () => {
  const { t } = useTranslation()
  const [isScrolling, setIsScrolling] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(8)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  return (
    <section className='relative w-full py-8 sm:py-12 lg:py-16'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12'>
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 p-6 sm:p-10 lg:p-12 shadow-2xl'>
          {/* Decorative elements */}
          <div className='absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl'></div>
          <div className='absolute -bottom-24 -left-24 w-48 h-48 bg-white/20 rounded-full blur-3xl'></div>

          {/* Content */}
          <div className='relative z-10 max-w-3xl mx-auto text-center'>
            <h2
              className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6'
              style={{ fontWeight: 900 }}
            >
              {t('action_contact_now.title')}
            </h2>
            <p className='text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 lg:mb-12'>
              {t('action_contact_now.description')}
            </p>

            {/* Slide to Contact Form */}
            <div className='relative max-w-2xl mx-auto'>
              <div
                ref={containerRef}
                className='relative bg-white rounded-full shadow-2xl h-16 sm:h-20 flex items-center'
              >
                {/* Background text */}
                <div className='absolute inset-0 flex items-center justify-center text-gray-400 font-semibold text-base sm:text-lg pointer-events-none'>
                  {isScrolling ? t('action_contact_now.sliding_btn') : t('action_contact_now.btn')}
                </div>

                {/* Slider Button */}
                <div
                  style={{ left: `${sliderPosition}px` }}
                  className={`absolute bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 text-white font-bold w-16 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center select-none ${
                    isScrolling ? 'animate-slide-complete' : 'animate-bounce-hint'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    isDraggingRef.current = true
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                  onTouchStart={() => {
                    isDraggingRef.current = true
                  }}
                  onTouchMove={(e) => {
                    if (!isDraggingRef.current || isScrolling) return

                    const touch = e.touches[0]
                    const container = containerRef.current
                    if (!container) return

                    const containerRect = container.getBoundingClientRect()
                    const buttonWidth = e.currentTarget.offsetWidth
                    const maxX = containerRect.width - buttonWidth - 16
                    const currentX = touch.clientX - containerRect.left - buttonWidth / 2
                    const clampedX = Math.max(8, Math.min(currentX, maxX))

                    setSliderPosition(clampedX)

                    if (clampedX >= maxX * 0.85) {
                      isDraggingRef.current = false
                      setIsScrolling(true)
                      setTimeout(() => {
                        navigate(PATH.PRICING_PAGE)
                      }, 500)
                    }
                  }}
                  onTouchEnd={() => {
                    isDraggingRef.current = false
                    if (!isScrolling) {
                      setSliderPosition(8)
                    }
                  }}
                >
                  <ArrowRight className='w-7 h-7' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slide-complete {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(100vw));
          }
        }
        
        @keyframes bounce-hint {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }
        
        .animate-slide-complete {
          animation: slide-complete 1.5s ease-in-out forwards;
        }
        
        .animate-bounce-hint {
          animation: bounce-hint 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  )

  // Mouse move handler
  function handleMouseMove(e: MouseEvent) {
    if (!isDraggingRef.current || isScrolling) return

    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const buttonWidth = 64 // w-16
    const maxX = containerRect.width - buttonWidth - 16
    const currentX = e.clientX - containerRect.left - buttonWidth / 2
    const clampedX = Math.max(8, Math.min(currentX, maxX))

    setSliderPosition(clampedX)

    if (clampedX >= maxX * 0.85) {
      isDraggingRef.current = false
      setIsScrolling(true)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setTimeout(() => {
        navigate(PATH.PRICING_PAGE)
      }, 500)
    }
  }

  function handleMouseUp() {
    isDraggingRef.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    if (!isScrolling) {
      setSliderPosition(8)
    }
  }
}

export default ContactNow
