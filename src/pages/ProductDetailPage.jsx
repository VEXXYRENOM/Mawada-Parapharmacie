import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, AlertCircle, ShoppingBag, Bell, Phone } from 'lucide-react'

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '../components/ui/Animations'
import ProductCard from '../components/ui/ProductCard'
import OrderModal from '../components/ui/OrderModal'
import ProductRequestModal from '../components/ui/ProductRequestModal'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { getProductById, getPublicProducts } from '../lib/queries'

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
  const { addItem } = useCart()
  const { settings } = useSettings()
  const navigate = useNavigate()

  const [rawProduct, setRawProduct] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

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

    const sameCat = await getPublicProducts({ category: data.category })
    let similarList = sameCat.filter(p => p.id !== id).slice(0, 4)
    if (similarList.length < 3) {
      const others = await getPublicProducts()
      const extra = others
        .filter(p => p.id !== id && p.category !== data.category)
        .slice(0, 4 - similarList.length)
      similarList = [...similarList, ...extra]
    }
    setSimilar(similarList)
    setLoading(false)
  }, [id])

  useEffect(() => { fetchProduct() }, [fetchProduct])

  const product = normalizeProduct(rawProduct, lang)
  const catName = rawProduct?.category ?? ''
  const isOutOfStock = rawProduct?.in_stock === false
  const whatsappUrl = product ? buildWhatsAppUrl(product.whatsappText, settings.whatsappNumber, lang) : '#'

  function handleAddToCart() {
    if (!rawProduct) return
    addItem({ ...rawProduct, quantity })
  }

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

      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        product={rawProduct}
        whatsappUrl={whatsappUrl}
        lang={lang}
      />
      
      <ProductRequestModal 
        isOpen={requestModalOpen} 
        onClose={() => setRequestModalOpen(false)} 
        initialProductName={product.name} 
      />

      <div className="pt-24 bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 ${isRTL ? 'lg:flex lg:flex-row-reverse' : ''}`}>
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

            <FadeIn direction={isRTL ? 'left' : 'right'} delay={0.1} className={isRTL ? 'text-right' : ''}>
              <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <span className="text-xs uppercase tracking-widest text-warm-gray font-sans">{catName}</span>
                <span className="text-rose-200" aria-hidden="true">•</span>
                <span className="text-xs uppercase tracking-widest text-gold-400 font-sans font-medium">{product.brand}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mb-4 leading-tight">{product.name}</h1>

              {rawProduct?.original_price && rawProduct.original_price > rawProduct.price ? (
                <div className={`mb-6 ${isRTL ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-3 flex-wrap mb-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-bold font-sans">
                      -{Math.round((1 - rawProduct.price / rawProduct.original_price) * 100)}%
                    </span>
                    <span className="font-sans text-xl text-rose-400 line-through">
                      {rawProduct.original_price.toFixed(2)} TND
                    </span>
                  </div>
                  <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    <span className="font-sans text-3xl font-bold text-rose-600">{rawProduct.price?.toFixed(2)}</span>
                    <span className="font-sans text-sm text-rose-400">TND</span>
                    <span className="font-sans text-xs text-warm-gray ml-1">({t.products.price})</span>
                  </div>
                </div>
              ) : (
                <div className={`flex items-baseline gap-2 mb-6 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <span className="font-sans text-3xl font-bold text-sage-600">{product.price?.toFixed(2)}</span>
                  <span className="font-sans text-sm text-warm-gray">TND</span>
                  <span className="font-sans text-xs text-warm-gray ml-1">({t.products.price})</span>
                </div>
              )}

              <p className="text-base text-charcoal-light font-sans leading-relaxed mb-6">{product.description}</p>

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


              {/* Actions */}
              <div className="pt-8 border-t border-sage-100/50">
                {isOutOfStock ? (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col items-center gap-3">
                    <span className="text-amber-700 font-medium font-sans text-center">
                      {lang === 'fr' ? 'Ce produit est actuellement en rupture de stock.' : 'هذا المنتج غير متوفر حالياً في المخزون.'}
                    </span>
                    <button
                      onClick={() => setRequestModalOpen(true)}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 h-12 rounded-full bg-amber-100 text-amber-700 font-medium font-sans hover:bg-amber-200 transition-colors"
                    >
                      <Bell size={18} />
                      {lang === 'fr' ? 'M\'alerter lors du réassort' : 'أعلمني عند توفره'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center justify-between border-2 border-sage-100 rounded-full px-4 h-14 sm:w-32 bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-full transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        -
                      </button>
                      <span className="font-sans font-medium text-charcoal w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-full transition-colors"
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 h-14 rounded-full bg-sage-600 text-white font-medium font-sans hover:bg-sage-700 transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                      <ShoppingBag size={20} />
                      {lang === 'fr' ? 'Ajouter au panier' : 'أضف إلى السلة'}
                    </button>
                    
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-[#25D366]/10 text-[#1a9e4e] border border-[#25D366]/30 font-medium font-sans hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all duration-300"
                    >
                      <Phone size={20} />
                      <span className="hidden sm:inline">
                        {lang === 'fr' ? 'Commander via WhatsApp' : 'الطلب عبر واتساب'}
                      </span>
                      <span className="sm:hidden">
                        {lang === 'fr' ? 'WhatsApp' : 'واتساب'}
                      </span>
                    </a>
                  </div>
                )}
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
