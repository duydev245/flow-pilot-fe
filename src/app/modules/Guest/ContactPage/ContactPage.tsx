import { Mail, Phone, MapPin, Facebook } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ContactPage = () => {
  const { t } = useTranslation()
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black mb-4'>{t('contact.title')}</h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            {t('contact.description')}
          </p>
        </div>

        {/* Main Content - 2 Sections */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
          {/* Left Section - Contact Info */}
          <div className='order-1 lg:order-1'>
            <div className='bg-white rounded-3xl shadow-2xl p-8 sm:p-10 lg:p-12 h-full'>
              <h2 className='text-3xl sm:text-4xl font-bold text-gray-800 mb-8'>{t('contact.information')}</h2>

              {/* Contact Items */}
              <div className='space-y-8'>
                {/* Facebook */}
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <div className='w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-blue-600 flex items-center justify-center shadow-lg'>
                      <Facebook className='w-7 h-7 text-white' />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-800 mb-2'>Facebook Fanpage</h3>
                    <a
                      href='https://www.facebook.com/software.flowpilot'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-xl text-purple-600 hover:text-purple-800 transition-colors break-all'
                    >
                      @software.flowpilot
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <div className='w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center shadow-lg'>
                      <Phone className='w-7 h-7 text-white' />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-800 mb-2'>{t('contact.phone')}</h3>
                    <a
                      href='tel:+840987693153'
                      className='text-xl text-purple-600 hover:text-purple-800 transition-colors'
                    >
                      (+84) 0987 693 153
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <div className='w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center shadow-lg'>
                      <Mail className='w-7 h-7 text-white' />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-800 mb-2'>{t('contact.email')}</h3>
                    <a
                      href='mailto:flowpilot.hrm@gmail.com'
                      className='text-xl text-purple-600 hover:text-purple-800 transition-colors break-all'
                    >
                      flowpilot.hrm@gmail.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <div className='w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center shadow-lg'>
                      <MapPin className='w-7 h-7 text-white' />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-800 mb-2'>{t('contact.address')}</h3>
                    <p className='text-lg text-gray-700 leading-relaxed'>
                      Lot E2a-7, D1 Street, Saigon Hi-Tech Park, Tang Nhon Phu Ward, Ho Chi Minh City, Vietnam
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className='my-10 border-t border-gray-200'></div>

              {/* Copyright */}
              <div className='text-center'>
                <p className='text-gray-500 text-sm'>{t('all_rights')}</p>
                <p className='text-gray-400 text-xs mt-2'>{t('rights_belongs_flowpilot')}</p>
              </div>
            </div>
          </div>

          {/* Right Section - Google Map */}
          <div className='order-2 lg:order-2'>
            <div className='bg-white rounded-3xl shadow-2xl overflow-hidden h-full min-h-[400px] lg:min-h-[600px]'>
              <iframe
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4648.246948872785!2d106.80730807570384!3d10.841132857995554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e1!3m2!1svi!2s!4v1759648709819!5m2!1svi!2s'
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                title='FlowPilot Location'
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
