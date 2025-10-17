import { UserCheck, Brain, KanbanSquare, FileBarChart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const AboutSection = () => {
  const { t } = useTranslation()
  const features = [
    {
      icon: <UserCheck className='w-8 h-8' />,
      title: t('about.effective.title'),
      description: t('about.effective.description'),
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <Brain className='w-8 h-8' />,
      title: t('about.smart_data.title'),
      description: t('about.smart_data.description'),
      color: 'from-green-400 to-teal-400',
      bgColor: 'bg-green-50',
    },
    {
      icon: <KanbanSquare className='w-8 h-8' />,
      title: t('about.smart_work.title'),
      description: t('about.smart_work.description'),
      color: 'from-purple-400 to-pink-400',
      bgColor: 'bg-purple-50',
    },
    {
      icon: <FileBarChart className='w-8 h-8' />,
      title: t('about.project_progress.title'),
      description: t('about.project_progress.description'),
      color: 'from-orange-400 to-red-400',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <section id='about' className='relative w-full py-12 sm:py-16 lg:py-20 xl:py-24'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12'>
        {/* Header */}
        <div className='text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4 sm:mb-6' style={{ fontWeight: 900 }}>
            {t('about.title')}
            <span className='bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 bg-clip-text text-transparent'> FLOWPILOT</span>?
          </h2>
          <p className='text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
            {t('about.description')}
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10'>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative ${feature.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Decorative gradient overlay */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl mb-4 sm:mb-6 text-white transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-gray-800 transition-colors duration-300'>
                {feature.title}
              </h3>
              <p className='text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300'>
                {feature.description}
              </p>

              {/* Decorative corner */}
              <div className='absolute bottom-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity duration-500'>
                <div className={`w-full h-full bg-gradient-to-tl ${feature.color} rounded-tl-full`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSection