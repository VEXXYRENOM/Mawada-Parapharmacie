import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/Animations'
import ProductCard from '../ui/ProductCard'
import { getPublicProducts } from '../../lib/queries'

export default function FeaturedProducts() {
  const { t, isRTL, lang } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicProducts().then(data => {
      // Afficher uniquement les produits avec un badge (comme avant)
      const withBadge = data.filter(p => p.badge && p.badge.trim()).slice(0, 4)
      setProducts(withBadge)
      setLoading(false)
    })
  }, [])

  const normalize = (p) => ({
    ...p,
    name:         lang === 'ar' ? (p.name_ar || p.name_fr) : p.name_fr,
    nameAr:       p.name_ar,
    description:  lang === 'ar' ? (p.description_ar || p.description_fr) : p.description_fr,
    image:        p.image_url,
    whatsappText: `${p.name_fr} (${p.price?.toFixed(2)} TND)`,
  })

  return (
    <section className="py-20 bg-ivory" aria-labelledby="featured-products-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <FadeIn className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <div>
            <p className="text-xs font-sans font-medium tracking-widest uppercase text-sage-600 mb-2">
              {t.products.subtitle}
            </p>
            <h2 id="featured-products-title" className="font-serif text-3xl sm:text-4xl text-charcoal">
              {t.products.title}
            </h2>
          </div>
          <Link
            to="/boutique"
            className="inline-flex items-center gap-2 text-sm font-medium font-sans text-sage-600 hover:text-sage-700 transition-colors link-underline shrink-0"
          >
            {t.products.view_all}
            <ArrowRight size={15} className={isRTL ? 'rotate-180' : ''} />
          </Link>
        </FadeIn>

        {/* Skeleton loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-rose-50 overflow-hidden animate-pulse">
                <div className="h-52 bg-rose-50" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-rose-50 rounded-full w-2/3" />
                  <div className="h-4 bg-rose-50 rounded-full w-full" />
                  <div className="h-3 bg-rose-50 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products grid */}
        {!loading && (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
            {products.map(product => (
              <StaggerItem key={product.id}>
                <ProductCard product={normalize(product)} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  )
}
