import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react'

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '../components/ui/Animations'
import ProductCard from '../components/ui/ProductCard'
import OrderModal from '../components/ui/OrderModal'
import { buildWhatsAppUrl, FACEBOOK_PAGE } from '../utils/whatsapp'
import { getProductById, getPublicProducts } from '../lib/queries'

// Catégories statiques pour les labels
const CATEGORY_LABELS = {
  'complements-enfants': { fr: 'Compléments Enfants', ar: 'مكملات الأطفال' },
  'soins-visage':        { fr: 'Soins Visage',        ar: 'العناية بالوجه' },
  'soins-corps':         { fr: 'Soins Corps',         ar: 'العناية بالجسم' },
  'cosmetique':          { fr: 'Cosmétique',          ar: 'مستحضرات التجميل' },
  'bebe':                { fr: 'Bébé',                ar: 'منتجات الطفل' },
}

function normalizeProduct(p, lang) {
  if (!p) return null
  return {
    ...p,
    name:          lang === 'ar' ? (p.name_ar || p.name_fr) : p.name_fr,
    nameAr:        p.name_ar,
    description:   lang === 'ar' ? (p.description_ar || p.description_fr) : p.description_fr,
    image:         p.image_url,
    details:       p.details ?? [],
    whatsappText:  `${p.name_fr} (${p.price?.toFixed(2)} TND)`,
  }
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { t, lang, isRTL } = useLanguage()
  const navigate = useNavigate()

  const [rawProduct, setRawProduct] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)

  const fetchProduct = useCallback(async () => {
    setLoading(true)
    setError(null)
    const data = await getProductById(id)
    if (!data) {
      setError('not_found')
      setLoading(false)
      return
    }
    setRawProduct(data)

    // Produits similaires
    const allProducts = await getPublicProducts({ category: data.category })
    setSimilar(allProducts.filter(p => p.id !== id).slice(0, 4))
    setLoading(false)
  }, [id])

  useEffect(() => { fetchProduct() }, [fetchProduct])

  const product = normalizeProduct(rawProduct, lang)
  const catLabel = CATEGORY_LABELS[rawProduct?.category]
  const catName = catLabel ? (lang === 'ar' ? catLabel.ar : catLabel.fr) : (rawProduct?.category ?? '')
  const whatsappUrl = product ? buildWhatsAppUrl(product.whatsappText, lang) : '#'

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory pt-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-rose-400" />
          <p className="text-sm text-warm-gray font-sans">
            {lang === 'fr' ? 'Chargement...' : 'جارٍ التحميل...'}
          </p>
        </div>
      </div>
    )
  }

  // Not found / error
  if (error === 'not_found' || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory pt-24">
        <AlertCircle size={40} className="text-rose-300 mb-4" />
        <p className="font-serif text-2xl text-charcoal mb-4">
          {lang === 'fr' ? 'Produit introuvable' : 'المنتج غير موجود'}
        </p>
        <Link to="/boutique" className="text-sm text-rose-500 font-sans hover:underline">
          {lang === 'fr' ? '← Retour à la boutique' : 'العودة إلى المتجر'}
        </Link>
      </div>
    )
  }

  return (
    <PageTransition>
      <Helmet>
        <title>{product.name} — Mawada Parapharmacie</title>
        <meta name="description" content={product.description} />
      </Helmet>

      {/* Order Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        product={rawProduct}
        whatsappUrl={whatsappUrl}
        lang={lang}
      />

      <div className="pt-24 bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb */}
          <FadeIn className={`flex items-center gap-2 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-1.5 text-sm text-warm-gray hover:text-rose-500 transition-colors font-sans ${isRTL ? 'flex-row-reverse' : ''}`}
              aria-label="Retour"
            >
              <ArrowLeft size={15} className={isRTL ? 'rotate-180' : ''} />
              {lang === 'fr' ? 'Retour' : 'رجوع'}
            </button>
            <span className="text-rose-200" aria-hidden="true">/</span>
            <Link to="/boutique" className="text-sm text-warm-gray hover:text-rose-500 transition-colors font-sans">
              {t.nav.shop}
            </Link>
            <span className="text-rose-200" aria-hidden="true">/</span>
            <span className="text-sm text-charcoal font-sans truncate max-w-40">{product.name}</span>
          </FadeIn>

          {/* Main product layout */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 ${isRTL ? 'lg:flex lg:flex-row-reverse' : ''}`}>

            {/* Image */}
            <FadeIn direction={isRTL ? 'right' : 'left'} className="relative">
              <div className="sticky top-28">
                <div className="rounded-3xl overflow-hidden shadow-card bg-white border border-rose-50">
                  <img
                    src={product.image || '/assets/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-[420px] sm:h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                </div>
                {product.badge && (
                  <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                    <span className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-medium font-sans">
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Info */}
            <FadeIn direction={isRTL ? 'left' : 'right'} delay={0.1} className={isRTL ? 'text-right' : ''}>
              {/* Category + Brand */}
              <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <span className="text-xs uppercase tracking-widest text-warm-gray font-sans">{catName}</span>
                <span className="text-rose-200" aria-hidden="true">•</span>
                <span className="text-xs uppercase tracking-widest text-gold-400 font-sans font-medium">{product.brand}</span>
              </div>

              {/* Name */}
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mb-4 leading-tight">{product.name}</h1>

              {/* Price */}
              <div className={`flex items-baseline gap-2 mb-6 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <span className="font-sans text-3xl font-bold text-sage-600">{product.price?.toFixed(2)}</span>
                <span className="font-sans text-sm text-warm-gray">TND</span>
                <span className="font-sans text-xs text-warm-gray ml-1">({t.products.price})</span>
              </div>

              {/* Description */}
              <p className="text-base text-charcoal-light font-sans leading-relaxed mb-6">{product.description}</p>

              {/* Details list */}
              {product.details && product.details.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-serif text-base font-semibold text-charcoal mb-3">{t.products.details}</h2>
                  <ul className={`space-y-2 ${isRTL ? 'pr-0' : ''}`}>
                    {product.details.map((detail, i) => (
                      <li key={i} className={`flex items-center gap-2.5 text-sm font-sans text-charcoal-light ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                          <Check size={11} className="text-rose-500" aria-hidden="true" />
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Order CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* WhatsApp — ouvre le modal de commande */}
                <button
                  onClick={() => setOrderModalOpen(true)}
                  className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#25D366] text-white text-sm font-medium font-sans hover:bg-[#1ebe5d] transition-all duration-300 shadow-md hover:-translate-y-0.5"
                  aria-label={`Commander ${product.name} via WhatsApp`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t.products.order_whatsapp}
                </button>
                <a
                  href={FACEBOOK_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#0084FF] text-white text-sm font-medium font-sans hover:bg-[#006ecc] transition-all duration-300 shadow-md hover:-translate-y-0.5"
                  aria-label={`Commander ${product.name} via Messenger`}
                >
                  <FacebookIcon size={18} aria-hidden="true" />
                  {t.products.order_messenger}
                </a>
              </div>

              {/* Trust badges */}
              <div className={`flex flex-wrap gap-3 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {[
                  lang === 'fr' ? '✓ Produit authentique' : '✓ منتج أصلي',
                  lang === 'fr' ? '✓ Livraison rapide' : '✓ توصيل سريع',
                  lang === 'fr' ? '✓ Conseil expert' : '✓ نصيحة متخصصة',
                ].map((badge, i) => (
                  <span key={i} className="text-xs text-warm-gray font-sans">{badge}</span>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Similar products */}
          {similar.length > 0 && (
            <div>
              <FadeIn className="mb-8">
                <h2 className={`font-serif text-2xl text-charcoal ${isRTL ? 'text-right' : ''}`}>
                  {t.products.similar}
                </h2>
              </FadeIn>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similar.map(p => (
                  <StaggerItem key={p.id}>
                    <ProductCard product={normalizeProduct(p, lang)} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
