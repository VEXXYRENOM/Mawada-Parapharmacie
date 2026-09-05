import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '../components/ui/Animations'
import ProductCard from '../components/ui/ProductCard'
import data from '../data/products.json'

export default function ShopPage() {
  const { t, lang, isRTL } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    if (catId === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: catId })
    }
  }

  const filtered = useMemo(() => {
    return data.products.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory
      const term = search.toLowerCase()
      const matchSearch = !term ||
        p.name.toLowerCase().includes(term) ||
        p.nameAr.includes(term) ||
        p.brand.toLowerCase().includes(term)
      return matchCat && matchSearch
    })
  }, [activeCategory, search])

  const categories = [
    { id: 'all', name: 'Toutes les catégories', nameAr: 'جميع التصنيفات' },
    ...data.categories,
  ]

  return (
    <PageTransition>
      <Helmet>
        <title>Boutique — Mawada Parapharmacie | Produits Beauté & Santé Kasserine</title>
        <meta name="description" content="Parcourez notre catalogue de produits de beauté, cosmétiques et compléments alimentaires. Filtrez par catégorie et commandez via WhatsApp." />
      </Helmet>

      {/* Page Header */}
      <div className="pt-28 pb-12 bg-rose-gradient bg-pattern">
        <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-sans font-medium tracking-widest uppercase text-rose-400 mb-3">
            {lang === 'fr' ? 'Notre Catalogue' : 'كتالوجنا'}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal mb-3">
            {lang === 'fr' ? 'Notre Boutique' : 'متجرنا'}
          </h1>
          <p className="text-base text-warm-gray font-sans">
            {lang === 'fr'
              ? `${data.products.length} produits soigneusement sélectionnés`
              : `${data.products.length} منتجاً مختاراً بعناية`}
          </p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + mobile filter button */}
        <FadeIn className={`flex gap-3 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="relative flex-1">
            <Search
              size={17}
              className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`}
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.products.search}
              className={`w-full h-12 bg-white border border-rose-100 rounded-full font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all ${isRTL ? 'pr-12 pl-5' : 'pl-12 pr-5'}`}
              aria-label={t.products.search}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className={`absolute top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal ${isRTL ? 'left-4' : 'right-4'}`}
                aria-label="Effacer la recherche"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowMobileFilters(v => !v)}
            className="lg:hidden flex items-center gap-2 px-4 h-12 rounded-full bg-white border border-rose-100 text-sm font-sans text-charcoal hover:border-rose-300 transition-colors"
            aria-label="Filtres"
          >
            <SlidersHorizontal size={16} className="text-rose-400" />
            {lang === 'fr' ? 'Filtres' : 'تصفية'}
          </button>
        </FadeIn>

        {/* Category pills — desktop always visible, mobile toggle */}
        <AnimatePresence>
          {(showMobileFilters || true) && (
            <motion.div
              className={`hidden lg:flex flex-wrap gap-2 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
              initial={false}
            >
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium font-sans transition-all duration-200 border ${
                    activeCategory === cat.id
                      ? 'bg-sage-600 text-white border-sage-600 shadow-soft'
                      : 'bg-white text-charcoal border-rose-100 hover:border-sage-300 hover:text-sage-600'
                  }`}
                  aria-pressed={activeCategory === cat.id}
                >
                  {lang === 'ar' ? (cat.nameAr || cat.name) : cat.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile category pills */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              className={`flex lg:hidden flex-wrap gap-2 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { handleCategoryChange(cat.id); setShowMobileFilters(false) }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium font-sans transition-all duration-200 border ${
                    activeCategory === cat.id
                      ? 'bg-sage-600 text-white border-sage-600'
                      : 'bg-white text-charcoal border-rose-100 hover:border-sage-300'
                  }`}
                >
                  {lang === 'ar' ? (cat.nameAr || cat.name) : cat.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <FadeIn className="mb-6">
          <p className="text-sm text-warm-gray font-sans">
            {lang === 'fr'
              ? `${filtered.length} produit${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`
              : `${filtered.length} منتج موجود`}
          </p>
        </FadeIn>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            staggerDelay={0.05}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map(product => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </AnimatePresence>
          </StaggerContainer>
        ) : (
          <FadeIn className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-rose-300" aria-hidden="true" />
            </div>
            <h3 className="font-serif text-xl text-charcoal mb-2">{t.products.no_results}</h3>
            <p className="text-sm text-warm-gray font-sans">{t.products.no_results_desc}</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="mt-5 px-6 py-2.5 rounded-full bg-sage-600 text-white text-sm font-medium font-sans hover:bg-sage-700 transition-colors"
            >
              {lang === 'fr' ? 'Réinitialiser les filtres' : 'إعادة تعيين الفلاتر'}
            </button>
          </FadeIn>
        )}
      </div>
    </PageTransition>
  )
}
