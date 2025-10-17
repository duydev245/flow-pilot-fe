import logoFlowpilot from '@/app/assets/LogoFlowPilot2.png'
import { PATH } from '@/app/routes/path'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const { i18n, t } = useTranslation()

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en'
    console.log("🚀 ~ toggleLang ~ i18n.language:", i18n.language)
    i18n.changeLanguage(newLang)
    localStorage.setItem('i18nextLng', newLang)
  }

  const mainMenu = (
    <ul className='flex flex-col lg:flex-row list-none text-black gap-3 lg:gap-5'>
      <li>
        <Link to={PATH.HOME} onClick={() => setMobileMenuOpen(false)}>
          <button className='w-full lg:w-auto flex items-center gap-1 text-sm lg:text-base font-normal rounded-xl transition-all duration-300 ease-in-out border border-transparent hover:border-gray-100 hover:bg-gray-100 hover:scale-105 px-3 lg:px-[12px] py-2 lg:py-[10px]'>
            {t('homeTitle')}
          </button>
        </Link>
      </li>
      <li>
        <button 
          onClick={() => {
            setMobileMenuOpen(false)
            if (location.pathname === PATH.LANDING_PAGE) {
              // Nếu đang ở trang home, scroll đến about section
              const aboutSection = document.getElementById('about')
              aboutSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            } else {
              // Nếu ở trang khác, navigate về home với hash
              navigate(PATH.LANDING_PAGE + '#about')
              // Sau khi navigate, scroll đến about
              setTimeout(() => {
                const aboutSection = document.getElementById('about')
                aboutSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 100)
            }
          }}
          className='w-full lg:w-auto flex items-center gap-1 text-sm lg:text-base font-normal rounded-xl transition-all duration-300 ease-in-out border border-transparent hover:border-gray-100 hover:bg-gray-100 hover:scale-105 px-3 lg:px-[12px] py-2 lg:py-[10px]'
        >
          {t('introductionTitle')}
        </button>
      </li>
      <li>
        <Link to={PATH.PRICING_PAGE} onClick={() => setMobileMenuOpen(false)}>
          <button className='w-full lg:w-auto flex items-center gap-1 text-sm lg:text-base font-normal rounded-xl transition-all duration-300 ease-in-out border border-transparent hover:border-gray-100 hover:bg-gray-100 hover:scale-105 px-3 lg:px-[12px] py-2 lg:py-[10px]'>
            {t('pricingTitle')}
          </button>
        </Link>
      </li>
      <li>
        <Link to={PATH.CONTACT_PAGE} onClick={() => setMobileMenuOpen(false)}>
          <button className='w-full lg:w-auto flex items-center gap-1 text-sm lg:text-base font-normal rounded-xl transition-all duration-300 ease-in-out border border-transparent hover:border-gray-100 hover:bg-gray-100 hover:scale-105 px-3 lg:px-[12px] py-2 lg:py-[10px]'>
            {t('contactTitle')}
          </button>
        </Link>
      </li>
      <li className='lg:hidden mt-2 pt-3 border-t border-gray-200'>
        <Link to='/auth/login' onClick={() => setMobileMenuOpen(false)}>
          <button className='w-full flex items-center justify-center gap-1 text-base font-medium rounded-xl transition-all duration-300 ease-in-out bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 text-white hover:shadow-lg hover:scale-105 px-4 py-3'>
            {t('logIn')}
          </button>
        </Link>
      </li>
    </ul>
  )

  return (
    <div className='wrapper-Header w-full bg-no-repeat bg-cover bg-center px-3 sm:px-4 lg:px-6'>
      <div className='container navbar flex flex-row justify-between items-center w-full mx-auto py-3 lg:py-4'>
        <Link to={PATH.HOME} className='flex-shrink-0'>
          <div className='Navbar-logo group cursor-pointer'>
            <div className='flex items-center'>
              <img
                className='max-w-[80px] sm:max-w-[120px] lg:max-w-[160px] max-h-[50px] sm:max-h-[80px] lg:max-h-[100px] transition duration-200 group-hover:brightness-90'
                src={logoFlowpilot}
                alt='flow-pillot-logo'
              />
              <p className='text-sm sm:text-base lg:text-xl font-bold uppercase text-black transition duration-200 group-hover:text-gray-600 group-hover:brightness-90 ml-1 sm:ml-2'>
                Flowpilot
              </p>
            </div>
          </div>
        </Link>

        <div className='Navbar-main-menu hidden lg:flex flex-1 justify-center mx-4'>{mainMenu}</div>

        <div className='Navbar-account-menu flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0'>
          <button
            className='md:flex hover:underline font-bold text-gray-400 mr-2'
            onClick={toggleLang}
          >
            {i18n.language === "en" ? "🇻🇳 VIE" : "🇺🇸 EN"}
          </button>
          
          <Link to='/auth/login' className='hidden lg:block'>
            <button className='text-base font-medium px-[30px] py-[8px] bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 text-white rounded-md hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out whitespace-nowrap'>
              {t('logIn')}
            </button>
          </Link>

          <button
            className='lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-gray-100 hover:bg-gray-200 hover:scale-110 transition-all duration-300 ease-in-out'
            aria-label='Open menu'
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <Menu className='w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300' />
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className='lg:hidden absolute left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg animate-fade-in-down backdrop-blur-sm'>
          <div className='container mx-auto py-5 px-4 transition-all duration-300 ease-in-out'>{mainMenu}</div>
        </div>
      )}
    </div>
  )
}

export default Header
