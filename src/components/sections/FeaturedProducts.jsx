import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/Animations'
import ProductCard from '../ui/ProductCard'
import data from '../../data/products.json'

export default function FeaturedProducts() {
  const { t, isRTL } = useLanguage()
  const featured = data.products.filter(p => p.badge).slice(0, 4)

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

        {/* Products grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
          {featured.map(product => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
