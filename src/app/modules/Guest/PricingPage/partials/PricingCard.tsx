import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { PricingButton } from './PricingButton'
import { ConsultationModal } from './ConsultationModal'
import { cn } from '@/app/components/lib/utils'
import type { PricingCardProps } from '../models'
import { useTranslation } from 'react-i18next'

export function PricingCard(props: PricingCardProps) {
  const { t } = useTranslation()
  const { packageId, name, price, period, users, usage, features, buttonText = 'Tư vấn ngay', buttonColor, featured = false, bgClass } = props
  const [isModalOpen, setIsModalOpen] = useState(false)
  // (bgClass will be used for an accent stripe; card body stays white)
  return (
    <Card
      className={cn(
        'relative h-full flex flex-col transition-all duration-200 transform hover:shadow-lg hover:scale-105 bg-white',
        featured ? 'border border-purple-200 shadow-lg sm:border-2' : 'border border-gray-100',
        'px-2 py-4 sm:px-4 sm:py-6',
        'w-full',
        'mx-auto',
        'lg:w-[400px]',
        'mb-6 lg:mb-0',
        'text-slate-900'
      )}
    >
      {/* accent stripe */}
      {bgClass ? <div className={cn('h-1 w-full rounded-t-md', bgClass)} /> : null}

      <CardHeader className='text-center pb-2 sm:pb-4'>
        <h3 className={cn('text-base sm:text-lg font-bold tracking-wide')}>
          {name}
        </h3>

        <div className='mt-2 sm:mt-4 flex items-baseline justify-center gap-2'>
          <span className='text-sm sm:text-base opacity-80'>{t('pricing.startingFrom')}</span>
          <span className='text-xl sm:text-3xl font-bold'>
            {typeof price === 'number' ? `${Math.round(price).toLocaleString('vi-VN')} ₫` : price}
          </span>
          <span className='text-xs sm:text-sm opacity-80'>/ {period}</span>
        </div>

        <p className='text-xs sm:text-sm opacity-90 mt-1 sm:mt-2'>{users}</p>
      </CardHeader>
      <CardContent className={cn('pt-0 flex flex-col flex-1') }>
        <div className='mb-4 sm:mb-6'>
          <h4 className='text-xs sm:text-sm font-semibold mb-2 sm:mb-4 tracking-wide'>{usage}</h4>

          <ul className='space-y-2 sm:space-y-3'>
            {features.map((feature: string, index: number) => (
              <li key={index} className='text-xs sm:text-sm leading-relaxed'>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className='mt-auto'>
          <PricingButton 
            color={buttonColor ?? 'blue'} 
            className='w-full'
            onClick={() => setIsModalOpen(true)}
          >
            {buttonText}
          </PricingButton>
        </div>
      </CardContent>
      
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageId={packageId}
        packageName={name}
      />
    </Card>
  )
}
