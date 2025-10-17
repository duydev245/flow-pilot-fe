import { useEffect, useMemo, useState } from 'react'
import { PricingCard } from './partials/PricingCard'
import { guestApi } from '@/app/apis/AUTH/guest.api'
import type { GetAllPackagesResponse, Package as PackageModel } from './models'
import type { PricingCardProps } from './models'
import { useTranslation } from 'react-i18next'
import { getLocalizedPackageName, getLocalizedPackageDescription, processPackageFeatures } from './utils/i18nUtils'

function PricingPage() {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [packages, setPackages] = useState<PackageModel[]>([])

  useEffect(() => {
    let mounted = true

    const fetchPackages = async () => {
      setLoading(true)
      setError(null)
      try {
        const res: GetAllPackagesResponse = await guestApi.getAllPackages()
        if (!mounted) return
        const data = res.data?.data || []
        // filter packages that have at least one feature
        const withFeatures = data.filter((p) => Array.isArray(p.features) && p.features.length > 0)
        setPackages(withFeatures.reverse()) // show latest packages first
      } catch (err: any) {
        setError(err?.data?.message || err?.message || t('pricing.error'))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPackages()

    return () => {
      mounted = false
    }
  }, [t])

  const cards: PricingCardProps[] = useMemo(() => {
    // take first 3 packages and map to UI props
    // gentle modern accent colors for stripe (top of card)
    const bgClasses = [
      'bg-teal-300',
      'bg-amber-300',
      'bg-violet-300'
    ]

    return packages.slice(0, 3).map((p, idx) => {
      const period = t('pricing.period')
      const currentLocale = i18n.language
      
      return {
        packageId: p.id,
        name: getLocalizedPackageName(p, currentLocale),
        price: p.price,
        period,
        users: getLocalizedPackageDescription(p, currentLocale, t),
        usage: getLocalizedPackageName(p, currentLocale).toUpperCase(),
        features: processPackageFeatures(p.features, currentLocale, t),
        buttonText: t('contactUsBtn'),
        buttonColor: 'bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500',
        featured: false,
        bgClass: bgClasses[idx] ?? undefined
      }
    })
  }, [packages, t, i18n.language])

  return (
    <>
      <div className='min-h-screen max-w-full w-full px-2 sm:px-4 md:px-8 mb-16 sm:mb-20 mx-auto'>
        <div className='text-center mb-8 sm:mb-12'>
          <p className='text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2 tracking-wider'>{t('pricing.title')}</p>
          <h1 className='text-2xl sm:text-4xl font-bold text-foreground'>{t('pricing.description')}</h1>
        </div>

        {loading ? (
          <div className='text-center py-8'>{t('pricing.loading')}</div>
        ) : error ? (
          <div className='text-center text-destructive py-8'>Error: {error}</div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto'>
            {cards.map((plan, index) => (
              <PricingCard key={plan.name || index} {...plan} buttonText={t('contactUsBtn')} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default PricingPage
