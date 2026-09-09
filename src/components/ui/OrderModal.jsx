import { useState } from 'react'
import { X, Phone, User, MessageSquare, ShoppingBag, Loader2, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createOrder } from '../../lib/queries'

/**
 * Modal de commande rapide avant redirection WhatsApp
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - product: { id, name_fr, name_ar, price, image_url }
 *  - whatsappUrl: string
 *  - lang: 'fr' | 'ar'
 */
export default function OrderModal({ isOpen, onClose, product, whatsappUrl, lang }) {
  const isRTL = lang === 'ar'
  const [form, setForm] = useState({ name: '', phone: '', address: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'success'

  const productName = lang === 'ar' ? (product?.name_ar || product?.name_fr) : product?.name_fr

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone.trim() || !form.address.trim()) return

    setLoading(true)

    // Enregistrer la commande (silencieux si échec — ne bloque pas WhatsApp)
    await createOrder({
      product_id:     product?.id ?? null,
      product_name:   product?.name_fr ?? null,
      customer_name:  form.name.trim() || null,
      customer_phone: form.phone.trim(),
      message:        (form.address ? `Adresse: ${form.address}\n` : '') + (form.message.trim() || ''),
    })

    setLoading(false)

    // Dans tous les cas : ouvrir WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    setStep('success')
  }

  const handleClose = () => {
    setForm({ name: '', phone: '', address: '', message: '' })
    setStep('form')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-white rounded-3xl shadow-card overflow-hidden"
              initial={{ y: 60, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 60, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              {step === 'form' ? (
                <>
                  {/* Header */}
                  <div className="relative bg-rose-gradient px-6 pt-6 pb-5">
                    <button
                      onClick={handleClose}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-charcoal hover:bg-white transition-colors"
                      aria-label="Fermer"
                    >
                      <X size={16} />
                    </button>
                    <div className="flex items-center gap-3">
                      {product?.image_url && (
                        <img
                          src={product.image_url}
                          alt={productName}
                          className="w-12 h-12 rounded-xl object-cover border border-white/60"
                        />
                      )}
                      <div>
                        <p className="text-xs text-warm-gray font-sans">
                          {lang === 'fr' ? 'Commander via WhatsApp' : 'الطلب عبر واتساب'}
                        </p>
                        <p className="font-serif text-base text-charcoal font-semibold leading-tight">
                          {productName}
                        </p>
                        {product?.price && (
                          <p className="text-sm font-sans font-bold text-sage-600">
                            {product.price.toFixed(2)} TND
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className={`px-6 py-5 space-y-4 ${isRTL ? 'text-right' : ''}`}>
                    <p className="text-sm text-warm-gray font-sans">
                      {lang === 'fr'
                        ? 'Laissez vos coordonnées pour un meilleur suivi de votre commande.'
                        : 'أدخل معلوماتك لمتابعة طلبك بشكل أفضل.'}
                    </p>

                    {/* Nom */}
                    <div className="relative">
                      <User size={15} className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} aria-hidden="true" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Votre prénom (optionnel)' : 'اسمك (اختياري)'}
                        className={`w-full h-11 border border-rose-100 rounded-full font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all bg-rose-50/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>

                    {/* Téléphone */}
                    <div className="relative">
                      <Phone size={15} className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} aria-hidden="true" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Votre téléphone *' : 'رقم هاتفك *'}
                        required
                        className={`w-full h-11 border border-rose-100 rounded-full font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all bg-rose-50/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>

                    {/* Adresse */}
                    <div className="relative">
                      <MapPin size={15} className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} aria-hidden="true" />
                      <input
                        type="text"
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Adresse de livraison *' : 'عنوان التوصيل *'}
                        required
                        className={`w-full h-11 border border-rose-100 rounded-full font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all bg-rose-50/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>

                    {/* Message */}
                    <div className="relative">
                      <MessageSquare size={15} className={`absolute top-3 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} aria-hidden="true" />
                      <textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Message ou précision (optionnel)' : 'رسالة أو تفاصيل (اختياري)'}
                        rows={2}
                        className={`w-full border border-rose-100 rounded-2xl font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all bg-rose-50/30 resize-none pt-3 pb-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || !form.phone.trim() || !form.address.trim()}
                      className="w-full flex items-center justify-center gap-2.5 h-12 rounded-full bg-[#25D366] text-white text-sm font-medium font-sans hover:bg-[#1ebe5d] transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          {lang === 'fr' ? 'Commander via WhatsApp' : 'اطلب عبر واتساب'}
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-warm-gray font-sans">
                      {lang === 'fr'
                        ? '* Numéro de téléphone requis pour votre commande'
                        : '* رقم الهاتف مطلوب لمعالجة طلبك'}
                    </p>
                  </form>
                </>
              ) : (
                /* Success state */
                <div className="px-6 py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
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
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
