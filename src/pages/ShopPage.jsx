import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '../components/ui/Animations'
import ProductCard from '../components/ui/ProductCard'
import { getPublicProducts } from '../lib/queries'

// Catégories statiques (labels) — les IDs viennent des produits Supabase
const CATEGORY_LABELS = {
  'complements-enfants': { fr: 'Compléments Enfants', ar: 'مكملات الأطفال' },
  'soins-visage':        { fr: 'Soins Visage',        ar: 'العناية بالوجه' },
  'soins-corps':         { fr: 'Soins Corps',         ar: 'العناية بالجسم' },
  'cosmetique':          { fr: 'Cosmétique',          ar: 'مستحضرات التجميل' },
  'bebe':                { fr: 'Bébé',                ar: 'منتجات الطفل' },
}

export default function ShopPage() {
  const { t, lang, isRTL } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  // Fetch depuis Supabase
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPublicProducts()
      setProducts(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    if (catId === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: catId })
    }
  }

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory
      const term = search.toLowerCase()
      const matchSearch = !term ||
        (p.name_fr ?? '').toLowerCase().includes(term) ||
        (p.name_ar ?? '').includes(term) ||
        (p.brand ?? '').toLowerCase().includes(term)
      return matchCat && matchSearch
    })
  }, [products, activeCategory, search])

  // Catégories dynamiques déduites des produits
  const categories = useMemo(() => {
    const uniqueCats = [...new Set(products.map(p => p.category))]
    return [
      { id: 'all', name: 'Toutes les catégories', nameAr: 'جميع التصنيفات' },
      ...uniqueCats.map(id => ({
        id,
        name:   CATEGORY_LABELS[id]?.fr ?? id,
        nameAr: CATEGORY_LABELS[id]?.ar ?? id,
      }))
    ]
  }, [products])

  // Normaliser les produits Supabase pour ProductCard
  const normalizeProduct = (p) => ({
    ...p,
    id:          p.id,
    name:        lang === 'ar' ? (p.name_ar || p.name_fr) : p.name_fr,
    nameAr:      p.name_ar,
    description: lang === 'ar' ? (p.description_ar || p.description_fr) : p.description_fr,
    image:       p.image_url,
    whatsappText: `${p.name_fr} (${p.price?.toFixed(2)} TND)`,
  })

  return (
    <PageTransition>
      <Helmet>
        <title>Boutique — Mawada Parapharmacie | Produits Beauté &amp; Santé Kasserine</title>
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
            {loading
              ? (lang === 'fr' ? 'Chargement...' : 'جارٍ التحميل...')
              : lang === 'fr'
                ? `${products.length} produits soigneusement sélectionnés`
                : `${products.length} منتجاً مختاراً بعناية`}
          </p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Erreur non bloquante */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-sans">
            <AlertCircle size={18} />
            {lang === 'fr'
              ? 'Impossible de charger les produits. Veuillez réessayer.'
              : 'تعذّر تحميل المنتجات. يرجى المحاولة مجدداً.'}
          </div>
        )}

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

        {/* Category pills — desktop */}
        <div className={`hidden lg:flex flex-wrap gap-2 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
        </div>

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
            {loading
              ? ''
              : lang === 'fr'
                ? `${filtered.length} produit${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`
                : `${filtered.length} منتج موجود`}
          </p>
        </FadeIn>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-rose-50 overflow-hidden animate-pulse">
                <div className="h-56 bg-rose-50" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-rose-50 rounded-full w-2/3" />
                  <div className="h-4 bg-rose-50 rounded-full w-full" />
                  <div className="h-3 bg-rose-50 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && filtered.length > 0 && (
          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            staggerDelay={0.05}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map(product => (
                <StaggerItem key={product.id}>
                  <ProductCard product={normalizeProduct(product)} />
                </StaggerItem>
              ))}
            </AnimatePresence>
          </StaggerContainer>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && !error && (
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
