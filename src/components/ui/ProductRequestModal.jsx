import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, Package, Loader2, CheckCircle } from 'lucide-react'
import { createProductRequest } from '../../lib/queries'
import { useLanguage } from '../../context/LanguageContext'

export default function ProductRequestModal({ isOpen, onClose, initialProductName = '' }) {
  const { lang, isRTL } = useLanguage()
  const [form, setForm] = useState({ name: '', contact: '', productName: initialProductName })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'success'

  // Sync initial product name if it changes
  useState(() => {
    setForm(prev => ({ ...prev, productName: initialProductName }))
  }, [initialProductName])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim() || !form.productName.trim()) return

    setLoading(true)
    const success = await createProductRequest({
      customer_name: form.name.trim(),
      customer_contact: form.contact.trim(),
      product_name: form.productName.trim()
    })
    setLoading(false)

    if (success) {
      setStep('success')
    } else {
      alert(lang === 'ar' ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' : 'Une erreur s\'est produite. Veuillez réessayer.')
    }
  }

  const handleClose = () => {
    setStep('form')
    setForm({ name: '', contact: '', productName: initialProductName })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
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
                  <div className="relative bg-sage-50 px-6 pt-6 pb-5 border-b border-sage-100">
                    <button
                      onClick={handleClose}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-charcoal hover:bg-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                        <Package size={24} />
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <h3 className="font-serif text-lg text-charcoal font-semibold leading-tight">
                          {lang === 'fr' ? 'Demander un produit' : 'اطلب منتجاً'}
                        </h3>
                        <p className="text-xs text-warm-gray font-sans mt-0.5">
                          {lang === 'fr' 
                            ? 'Laissez vos coordonnées pour être notifié.' 
                            : 'أدخل بياناتك لنتواصل معك عند توفره.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className={`px-6 py-5 space-y-4 ${isRTL ? 'text-right' : ''}`}>
                    <div className="relative">
                      <User size={15} className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} />
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Votre nom et prénom *' : 'الاسم واللقب *'}
                        required
                        className={`w-full h-11 border border-sage-100 rounded-full font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all bg-sage-50/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>

                    <div className="relative">
                      <Phone size={15} className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} />
                      <input
                        type="text"
                        value={form.contact}
                        onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Numéro de téléphone ou Email *' : 'رقم الهاتف أو الإيميل *'}
                        required
                        className={`w-full h-11 border border-sage-100 rounded-full font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all bg-sage-50/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>

                    <div className="relative">
                      <Package size={15} className={`absolute top-1/2 -translate-y-1/2 text-warm-gray ${isRTL ? 'right-4' : 'left-4'}`} />
                      <input
                        type="text"
                        value={form.productName}
                        onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Nom du produit recherché *' : 'اسم المنتج الذي تبحث عنه *'}
                        required
                        className={`w-full h-11 border border-sage-100 rounded-full font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all bg-sage-50/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !form.name.trim() || !form.contact.trim() || !form.productName.trim()}
                      className="w-full flex items-center justify-center gap-2.5 h-12 rounded-full bg-sage-600 text-white text-sm font-medium font-sans hover:bg-sage-700 transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : (lang === 'fr' ? 'Envoyer la demande' : 'إرسال الطلب')}
                    </button>
                  </form>
                </>
              ) : (
                <div className="px-6 py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                  <h3 className="font-serif text-xl text-charcoal mb-2">
                    {lang === 'fr' ? 'Demande envoyée !' : 'تم إرسال طلبك!'}
                  </h3>
                  <p className="text-sm text-warm-gray font-sans mb-6">
                    {lang === 'fr' 
                      ? 'Nous vous contacterons dès que le produit sera disponible.' 
                      : 'سنتواصل معك فور توفر المنتج في أقرب وقت.'}
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
