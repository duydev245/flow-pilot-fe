import { Link } from 'react-router-dom'
import kanbanImage from '@/app/assets/kanban.png'
import { PATH } from '@/app/routes/path'
import { useTranslation } from 'react-i18next'

const HeroSection = () => {
  const { t } = useTranslation()
  return (
    <section className='relative w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] xl:min-h-[750px]'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 lg:py-16 xl:py-20'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center'>
          {/* Left Content */}
          <div className='flex flex-col gap-4 sm:gap-6 lg:gap-8 animate-fade-in order-2 lg:order-1'>
            <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight sm:leading-tight lg:leading-tight' style={{ fontWeight: 900 }}>
              {t('hero.title')}
            </h1>
            
            <Link to={PATH.PRICING_PAGE} className='w-full sm:w-fit'>
              <button className='w-full sm:w-fit px-6 sm:px-10 lg:px-12 py-3 sm:py-4 lg:py-5 bg-[#1a1a4d] hover:bg-[#0d0d26] text-white text-sm sm:text-base lg:text-lg font-bold rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl transform whitespace-nowrap'>
                {t('contactUsBtn')}
              </button>
            </Link>
          </div>

          {/* Right Content - Kanban Board Preview */}
          <div className='relative animate-fade-in-right order-1 lg:order-2 mb-6 lg:mb-0'>
            <div className='relative rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 overflow-hidden'>
              <img 
                src={kanbanImage} 
                alt="Kanban Board Preview" 
                className='w-full h-auto object-contain'
              />
            </div>

            {/* Floating card effect - ẩn trên mobile */}
            <div className='hidden sm:block absolute -top-3 sm:-top-4 -right-3 sm:-right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-xl sm:rounded-2xl opacity-60 blur-xl'></div>
            <div className='hidden sm:block absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-200 to-teal-200 rounded-xl sm:rounded-2xl opacity-60 blur-xl'></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
