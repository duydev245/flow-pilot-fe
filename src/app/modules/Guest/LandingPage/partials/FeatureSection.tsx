import projectDashboard from '@/app/assets/project-dashboard.png'
import kanban from '@/app/assets/kanban.png'
import focusMode from '@/app/assets/focus-mode.png'
import aiAnalysis from '@/app/assets/ai-analysis.png'
import fileUpload from '@/app/assets/file-upload.png'
import teamManagement from '@/app/assets/team-management.png'
import { useTranslation } from 'react-i18next'

const FeatureSection = () => {
  const { t } = useTranslation()
  const features = [
    {
      title: t('features.project_progress.title'),
      description: t('features.project_progress.description'),
      image: projectDashboard,
      imagePosition: 'left'
    },
    {
      title: t('features.smart_work.title'),
      description: t('features.smart_work.description'),
      image: kanban,
      imagePosition: 'right'
    },
    {
      title: t('features.focus_mode.title'),
      description: t('features.focus_mode.description'),
      image: focusMode,
      imagePosition: 'left'
    },
    {
      title: t('features.performance_report.title'),
      description: t('features.performance_report.description'),
      image: aiAnalysis,
      imagePosition: 'right'
    },
    {
      title: t('features.file_storage.title'),
      description: t('features.file_storage.description'),
      image: fileUpload,
      imagePosition: 'left'
    },
    {
      title: t('features.team_management.title'),
      description: t('features.team_management.description'),
      image: teamManagement,
      imagePosition: 'right'
    }
  ]

  return (
    <section className='relative w-full py-12 sm:py-16 lg:py-20 xl:py-24'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12'>
        {/* Header */}
        <div className='text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in'>
          <h2
            className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4 sm:mb-6'
            style={{ fontWeight: 900 }}
          >
            {t('features.title')}
          </h2>
          <p className='text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
            {t('features.description')}
          </p>
        </div>

        {/* Features List */}
        <div className='space-y-12 sm:space-y-14 lg:space-y-16'>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center ${
                feature.imagePosition === 'right' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image Side */}
              <div
                className={`relative ${feature.imagePosition === 'right' ? 'lg:order-2' : 'lg:order-1'} animate-fade-in`}
              >
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className='w-full h-auto object-contain transform hover:scale-105 transition-all duration-500 cursor-pointer' 
                />
              </div>

              {/* Text Side */}
              <div
                className={`${feature.imagePosition === 'right' ? 'lg:order-1' : 'lg:order-2'} flex flex-col justify-center animate-fade-in`}
                style={{ animationDelay: '200ms' }}
              >
                <h3
                  className='text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight'
                  style={{ fontWeight: 900 }}
                >
                  {feature.title}
                </h3>
                <p className='text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed'>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureSection
