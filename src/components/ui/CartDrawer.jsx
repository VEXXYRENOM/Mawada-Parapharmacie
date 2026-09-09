import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingCart, Tag, CheckCircle, XCircle, Loader2, User, Phone, MapPin, MessageSquare, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { validatePromoCode, createOrder } from '../../lib/queries'

function buildCartWhatsAppUrl(items, whatsappNumber, lang, promoCode, discount, finalTotal, customer = null) {
  if (items.length === 0) return '#'
  
  const greeting = lang === 'ar'
    ? 'مرحباً، أرغب في تأكيد طلب السلة:\n\n'
    : 'Bonjour, je souhaite confirmer ma commande :\n\n'
    
  const lines = items
    .map(i => `- ${i.name} x${i.qty} — ${(i.price * i.qty).toFixed(2)} TND`)
    .join('\n')
    
  const promoLine = (promoCode && discount > 0)
    ? (lang === 'ar'
        ? `\n🎟️ كود الخصم: ${promoCode} (-${discount.toFixed(2)} TND)`
        : `\n🎟️ Code promo : ${promoCode} (-${discount.toFixed(2)} TND)`)
    : ''
    
  const totalLine = lang === 'ar'
    ? `\n💰 المجموع النهائي: ${finalTotal.toFixed(2)} TND\n`
    : `\n💰 Total final : ${finalTotal.toFixed(2)} TND\n`

  let customerInfo = ''
  if (customer) {
    customerInfo += lang === 'ar' ? `\n👤 الاسم: ${customer.name || 'غير محدد'}` : `\n👤 Nom : ${customer.name || 'Non spécifié'}`
    customerInfo += lang === 'ar' ? `\n📞 الهاتف: ${customer.phone}` : `\n📞 Téléphone : ${customer.phone}`
    if (customer.address) {
      customerInfo += lang === 'ar' ? `\n📍 العنوان: ${customer.address}` : `\n📍 Adresse : ${customer.address}`
    }
    if (customer.message) {
      customerInfo += lang === 'ar' ? `\n💬 ملاحظة: ${customer.message}` : `\n💬 Message : ${customer.message}`
    }
    customerInfo += '\n'
  }

  const closing = lang === 'ar'
    ? '\nشكراً، أرجو تأكيد الطلب.'
    : '\nMerci de me confirmer la commande.'
    
  const message = greeting + lines + promoLine + totalLine + customerInfo + closing
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCart()
  const { lang, isRTL } = useLanguage()
  const { settings } = useSettings()

  const [promoInput, setPromoInput]     = useState('')
  const [promoState, setPromoState]     = useState(null) // null | { valid, promo?, reason? }
  const [promoLoading, setPromoLoading] = useState(false)

  // Nouveaux états pour le checkout
  const [step, setStep] = useState('cart') // 'cart' | 'form' | 'success'
  const [form, setForm] = useState({ name: '', phone: '', address: '', message: '' })
  const [submitLoading, setSubmitLoading] = useState(false)

  const isEmpty = items.length === 0

  // Calculate discount from applied promo
  const discount = (() => {
    if (!promoState?.valid || !promoState.promo) return 0
    const p = promoState.promo
    if (p.discount_type === 'percentage') {
      return Math.min(totalPrice, (totalPrice * p.discount_value) / 100)
    }
    return Math.min(totalPrice, parseFloat(p.discount_value))
  })()
  const finalTotal = Math.max(0, totalPrice - discount)

  // Labels bilingual
  const L = {
    title:        lang === 'ar' ? 'سلة المشتريات' : 'Mon panier',
    empty:        lang === 'ar' ? 'سلتك فارغة' : 'Votre panier est vide',
    emptyHint:    lang === 'ar' ? 'أضف منتجات من المتجر' : 'Ajoutez des produits depuis la boutique',
    clear:        lang === 'ar' ? 'تفريغ السلة' : 'Vider le panier',
    subtotal:     lang === 'ar' ? 'المجموع' : 'Sous-total',
    discountLabel:lang === 'ar' ? 'الخصم' : 'Réduction',
    finalTotal:   lang === 'ar' ? 'المجموع النهائي' : 'Total final',
    order:        lang === 'ar' ? 'تأكيد الطلب' : 'Valider la commande',
    items:        lang === 'ar' ? `${totalItems} منتج` : `${totalItems} article${totalItems > 1 ? 's' : ''}`,
    promoLabel:   lang === 'ar' ? 'كود الخصم' : 'Code promo',
    promoPlaceholder: lang === 'ar' ? 'أدخل الكود...' : 'Entrez votre code...',
    promoApply:   lang === 'ar' ? 'تطبيق' : 'Appliquer',
    backToCart:   lang === 'ar' ? 'العودة للسلة' : 'Retour au panier',
    checkoutTitle:lang === 'ar' ? 'معلومات التوصيل' : 'Informations de livraison',
  }

  const handleApplyPromo = useCallback(async () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoLoading(true)
    setPromoState(null)
    const result = await validatePromoCode(code)
    setPromoState(result)
    setPromoLoading(false)
  }, [promoInput])

  const handleRemovePromo = () => {
    setPromoInput('')
    setPromoState(null)
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone.trim()) return

    setSubmitLoading(true)

    let fullMessage = ''
    if (form.address) fullMessage += `Adresse: ${form.address}\n`
    if (form.message) fullMessage += `Message: ${form.message}`

    // Sauvegarder dans la DB (ajout du total_price et cart_items)
    await createOrder({
      product_name:   'Commande Panier',
      customer_name:  form.name.trim() || null,
      customer_phone: form.phone.trim(),
      message:        fullMessage.trim() || null,
      total_price:    finalTotal,
      cart_items:     items // Le champ JSONB va stocker le tableau tel quel
    })

    setSubmitLoading(false)

    // Ouvrir WhatsApp avec le lien formaté
    const whatsappUrl = buildCartWhatsAppUrl(
      items, settings.whatsappNumber, lang,
      promoState?.valid ? promoState.promo?.code : null,
      discount,
      finalTotal,
      form
    )
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    
    // Vider le panier et afficher le message de succès
    clearCart()
    handleRemovePromo()
    setStep('success')
  }

  // Fermeture du tiroir (réinitialise l'état du formulaire)
  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setStep('cart')
      setForm({ name: '', phone: '', address: '', message: '' })
    }, 300) // reset après l'animation de fermeture
  }

  // WhatsApp SVG icon
  const WaIcon = () => (
    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Mobile: bottom sheet | Desktop: right drawer */}
          <motion.div
            role="dialog"
            aria-label={L.title}
            aria-modal="true"
            className="fixed z-50 bg-white shadow-2xl flex flex-col"
            style={isMobile
              ? { bottom: 0, left: 0, right: 0, borderRadius: '24px 24px 0 0', maxHeight: '90vh' }
              : { top: 0, bottom: 0, right: 0, width: '420px', borderRadius: '24px 0 0 24px' }
            }
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b border-rose-100 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {step === 'form' ? (
                  <button 
                    onClick={() => setStep('cart')}
                    className="flex items-center gap-1.5 text-sage-600 hover:text-sage-700 text-sm font-medium transition-colors"
                  >
                    <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    {L.backToCart}
                  </button>
                ) : (
                  <>
                    <ShoppingCart size={20} className="text-sage-600" />
                    <h2 className="font-serif text-lg text-charcoal">{step === 'success' ? (lang === 'ar' ? 'تم الطلب' : 'Commande réussie') : L.title}</h2>
                    {totalItems > 0 && step === 'cart' && (
                      <span className="text-xs font-medium font-sans text-warm-gray">({L.items})</span>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-rose-100 transition-colors"
                aria-label="Fermer le panier"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mobile drag indicator */}
            <div className="sm:hidden flex justify-center pt-3 pb-0 shrink-0">
              <div className="w-10 h-1 rounded-full bg-rose-200" aria-hidden="true" />
            </div>

            {/* Contenu Dynamique selon l'étape */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              
              {/* ÉTAPE : PANIER */}
              {step === 'cart' && (
                isEmpty ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                    <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
                      <ShoppingCart size={28} className="text-rose-300" />
                    </div>
                    <p className="font-serif text-base text-charcoal">{L.empty}</p>
                    <p className="text-xs text-warm-gray font-sans">{L.emptyHint}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {items.map(item => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-center gap-3 p-3 rounded-2xl bg-rose-50/40 border border-rose-100 ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-rose-100">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                                <ShoppingCart size={16} className="text-rose-300" />
                              </div>
                            )}
                          </div>
                          <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                            <p className="font-serif text-sm text-charcoal font-medium leading-snug line-clamp-2">{item.name}</p>
                            <p className="text-xs font-semibold font-sans text-sage-600 mt-0.5">{item.price.toFixed(2)} TND</p>
                          </div>
                          <div className={`flex items-center gap-1.5 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full bg-white border border-rose-200 flex items-center justify-center text-charcoal hover:bg-rose-100 transition-colors"><Minus size={12} /></button>
                            <span className="w-5 text-center text-sm font-medium font-sans text-charcoal">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-white border border-rose-200 flex items-center justify-center text-charcoal hover:bg-rose-100 transition-colors"><Plus size={12} /></button>
                            <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-200 transition-colors ml-1"><Trash2 size={12} /></button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )
              )}

              {/* ÉTAPE : FORMULAIRE DE VALIDATION */}
              {step === 'form' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h3 className={`font-serif text-lg text-charcoal mb-4 ${isRTL ? 'text-right' : ''}`}>{L.checkoutTitle}</h3>
                  <form id="checkout-form" onSubmit={handleCheckoutSubmit} className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
                    <div className="relative">
                      <User size={15} className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} aria-hidden="true" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Nom et Prénom *' : 'الاسم واللقب *'}
                        required
                        className={`w-full h-12 border border-rose-100 rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all bg-rose-50/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>
                    <div className="relative">
                      <Phone size={15} className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} aria-hidden="true" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Votre téléphone *' : 'رقم هاتفك *'}
                        required
                        className={`w-full h-12 border border-rose-100 rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all bg-rose-50/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>
                    <div className="relative">
                      <MapPin size={15} className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} aria-hidden="true" />
                      <input
                        type="text"
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Adresse de livraison *' : 'عنوان التوصيل *'}
                        required
                        className={`w-full h-12 border border-rose-100 rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all bg-rose-50/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>
                    <div className="relative">
                      <MessageSquare size={15} className={`absolute top-4 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} aria-hidden="true" />
                      <textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Message ou précision (optionnel)' : 'رسالة أو تفاصيل (اختياري)'}
                        rows={3}
                        className={`w-full border border-rose-100 rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all bg-rose-50/30 resize-none py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ÉTAPE : SUCCÈS */}
              {step === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-4">
                    <ShoppingBag size={28} className="text-[#25D366]" />
                  </div>
                  <h3 className="font-serif text-xl text-charcoal mb-2">
                    {lang === 'fr' ? 'Commande envoyée !' : 'تم إرسال الطلب!'}
                  </h3>
                  <p className="text-sm text-warm-gray font-sans mb-6">
                    {lang === 'fr'
                      ? 'WhatsApp est ouvert. Vous pouvez finaliser votre commande directement.'
                      : 'تم فتح واتساب. يمكنك إتمام طلبك مباشرةً.'}
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-8 py-3 rounded-full bg-sage-600 text-white text-sm font-medium font-sans hover:bg-sage-700 transition-colors"
                  >
                    {lang === 'fr' ? 'Fermer' : 'إغلاق'}
                  </button>
                </motion.div>
              )}

            </div>

            {/* Footer Fixe */}
            {step !== 'success' && !isEmpty && (
              <div className="px-5 py-4 border-t border-rose-100 bg-white space-y-3 shrink-0">
                {/* ── Code Promo (Uniquement à l'étape Panier) ── */}
                {step === 'cart' && (
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Tag size={13} className="text-rose-400 shrink-0" />
                      <span className="text-xs font-medium font-sans text-charcoal">{L.promoLabel}</span>
                    </div>

                    {promoState?.valid ? (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold font-mono text-emerald-700 tracking-wider">{promoState.promo.code}</p>
                            <p className="text-[10px] text-emerald-600 font-sans">
                              {promoState.promo.discount_type === 'percentage' ? `-${promoState.promo.discount_value}%` : `-${parseFloat(promoState.promo.discount_value).toFixed(2)} TND`} {lang === 'ar' ? 'خصم مطبق' : 'appliqué'}
                            </p>
                          </div>
                        </div>
                        <button onClick={handleRemovePromo} className="w-6 h-6 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors"><X size={11} className="text-emerald-600" /></button>
                      </motion.div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={e => { setPromoInput(e.target.value.toUpperCase()); if (promoState) setPromoState(null); }}
                          onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                          placeholder={L.promoPlaceholder}
                          className={`flex-1 h-9 px-3 border rounded-xl font-mono text-sm text-charcoal uppercase tracking-wider focus:outline-none focus:ring-2 transition-all ${promoState?.valid === false ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/30' : 'border-rose-100 focus:border-sage-400 focus:ring-sage-100'}`}
                        />
                        <button onClick={handleApplyPromo} disabled={promoLoading || !promoInput.trim()} className="h-9 px-3 rounded-xl bg-sage-600 text-white text-xs font-medium font-sans hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap">
                          {promoLoading ? <Loader2 size={13} className="animate-spin" /> : <Tag size={13} />} {L.promoApply}
                        </button>
                      </div>
                    )}
                    {promoState?.valid === false && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 text-rose-500">
                        <XCircle size={13} className="shrink-0" /><p className="text-[11px] font-sans">{promoState.reason}</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Totals ── */}
                <div className="space-y-1.5 pt-0.5">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-sans text-warm-gray">{L.subtotal}</span>
                    <span className="font-sans text-sm font-medium text-charcoal">{totalPrice.toFixed(2)} <span className="text-xs font-normal text-warm-gray">TND</span></span>
                  </div>
                  <AnimatePresence>
                    {promoState?.valid && discount > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-sans text-emerald-600">{L.discountLabel}</span>
                        <span className="font-sans text-sm font-bold text-emerald-600">-{discount.toFixed(2)} <span className="text-xs font-normal">TND</span></span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className={`flex items-center justify-between pt-1.5 border-t border-rose-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-sans font-semibold text-charcoal">{L.finalTotal}</span>
                    <span className="font-sans font-bold text-xl text-charcoal">{finalTotal.toFixed(2)} <span className="text-sm font-normal text-warm-gray">TND</span></span>
                  </div>
                </div>

                {/* Bouton d'action principal */}
                {step === 'cart' ? (
                  <button
                    onClick={() => setStep('form')}
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-charcoal text-white font-medium font-sans text-sm hover:bg-charcoal-light transition-colors shadow-md"
                  >
                    {L.order}
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={submitLoading || !form.phone.trim() || !form.address.trim()}
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-medium font-sans text-sm hover:bg-[#1ebe5d] transition-all duration-300 shadow-md disabled:opacity-60"
                  >
                    {submitLoading ? <Loader2 size={18} className="animate-spin" /> : <><WaIcon /> Envoyer la commande</>}
                  </button>
                )}

                {/* Clear cart */}
                {step === 'cart' && (
                  <button onClick={() => { clearCart(); handleRemovePromo() }} className="w-full py-2 text-xs font-sans text-warm-gray hover:text-rose-500 transition-colors">
                    {L.clear}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
