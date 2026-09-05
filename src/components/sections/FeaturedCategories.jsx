import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { StaggerContainer, StaggerItem, FadeIn } from '../ui/Animations'
import data from '../../data/products.json'

export default function FeaturedCategories() {
  const { t, lang, isRTL } = useLanguage()
  const categories = data.categories

  return (
    <section className="py-20 bg-white" aria-labelledby="categories-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-sans font-medium tracking-widest uppercase text-rose-400 mb-3">
            {lang === 'fr' ? 'Notre Sélection' : 'مجموعتنا'}
          </p>
          <h2 id="categories-title" className="font-serif text-3xl sm:text-4xl text-charcoal">
            {t.featured.title}
          </h2>
          <p className="mt-3 text-base text-warm-gray font-sans max-w-xl mx-auto">
            {t.featured.subtitle}
          </p>
        </FadeIn>

        {/* Categories grid — asymmetric */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <StaggerItem key={cat.id}>
              <Link
                to={`/boutique?category=${cat.id}`}
                className={`group relative overflow-hidden rounded-2xl shadow-card card-hover block ${
                  i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
                } ${i === 3 ? 'lg:col-span-2' : ''}`}
                aria-label={`Catégorie ${lang === 'ar' ? cat.nameAr : cat.name}`}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${i === 3 ? 'h-52' : 'h-60'}`}>
                  <img
                    src={cat.image}
                    alt={lang === 'ar' ? cat.nameAr : cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <div className={`flex items-end justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <h3 className="font-serif text-xl text-white font-semibold mb-1">
                        {lang === 'ar' ? cat.nameAr : cat.name}
                      </h3>
                      <p className="text-xs text-white/70 font-sans leading-snug max-w-44">
                        {lang === 'ar' ? cat.descriptionAr : cat.description}
                      </p>
                    </div>
                    <motion.div
                      className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ml-3 border border-white/30"
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(196, 116, 122, 0.8)' }}
                      aria-hidden="true"
                    >
                      <ArrowRight size={15} className={`text-white ${isRTL ? 'rotate-180' : ''}`} />
                    </motion.div>
                  </div>
                </div>

                {/* Color accent line at top */}
                <div
                  className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-1.5 h-full opacity-80 group-hover:opacity-100 transition-opacity`}
                  style={{ backgroundColor: cat.color }}
                  aria-hidden="true"
                />
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* CTA */}
        <FadeIn className="text-center mt-10">
          <Link
            to="/boutique"
            className="inline-flex items-center gap-2 text-sm font-medium font-sans text-sage-600 hover:text-sage-700 transition-colors link-underline"
          >
            {t.products.view_all}
            <ArrowRight size={15} className={isRTL ? 'rotate-180' : ''} />
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
