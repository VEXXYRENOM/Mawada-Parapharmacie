import { useState } from 'react'
import PhoneNumber, { PhoneLink } from '../components/ui/PhoneNumber'
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react'

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '../components/ui/Animations'
import { buildWhatsAppContactUrl, FACEBOOK_PAGE } from '../utils/whatsapp'

const CONTACT_ITEMS = [
  {
    Icon: MapPin,
    labelKey: 'address',
    color: '#C4747A',
    bg: '#FFF0EE',
    href: 'https://www.google.com/maps?q=Kasserine,+Tunisie',
  },
  {
    Icon: Phone,
    labelKey: 'phone',
    color: '#B8923A',
    bg: '#F5E8CC',
    href: 'tel:+21623104341',
  },
  {
    Icon: Mail,
    labelKey: 'email',
    color: '#8C3A44',
    bg: '#F5C9C3',
    href: 'mailto:mawadasalhi94@gmail.com',
  },
  {
    Icon: Clock,
    labelKey: 'hours',
    color: '#25D366',
    bg: '#E8F9F0',
    href: null,
  },
]

export default function ContactPage() {
  const { t, lang, isRTL } = useLanguage()
  const tc = t.contact

  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = lang === 'fr' ? 'Le nom est requis' : 'الاسم مطلوب'
    if (!form.phone.trim()) e.phone = lang === 'fr' ? 'Le téléphone est requis' : 'الهاتف مطلوب'
    if (!form.message.trim()) e.message = lang === 'fr' ? 'Le message est requis' : 'الرسالة مطلوبة'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const url = buildWhatsAppContactUrl(form.name, form.phone, form.message, lang)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <PageTransition>
      <Helmet>
        <title>Contact — Mawada Parapharmacie | Kasserine, Tunisie</title>
        <meta name="description" content="Contactez Mawada Parapharmacie à Kasserine. Téléphone : +216 23 104 341. Email : mawadasalhi94@gmail.com. Ouvert tous les jours." />
      </Helmet>

      {/* Page header */}
      <div className="pt-28 pb-14 bg-rose-gradient bg-pattern">
        <FadeIn className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-sans font-medium tracking-widest uppercase text-rose-400 mb-3">
            {lang === 'fr' ? 'Nous Joindre' : 'تواصل معنا'}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal mb-4">{tc.title}</h1>
          <p className="text-base text-warm-gray font-sans">{tc.subtitle}</p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact info + Map */}
          <div className={isRTL ? 'text-right' : ''}>
            <FadeIn direction={isRTL ? 'right' : 'left'}>
              <h2 className="font-serif text-2xl text-charcoal mb-8">
                {lang === 'fr' ? 'Informations de contact' : 'معلومات الاتصال'}
              </h2>
            </FadeIn>

            <StaggerContainer className="space-y-5 mb-10">
              {CONTACT_ITEMS.map(({ Icon, labelKey, color, bg, href }) => (
                <StaggerItem key={labelKey}>
                  <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: bg }}
                      aria-hidden="true"
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div className="pt-2">
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-sm font-sans text-charcoal hover:text-rose-500 transition-colors leading-snug"
                          {...(labelKey === 'phone' ? { dir: 'ltr', style: { unicodeBidi: 'plaintext', display: 'inline-block' } } : {})}
                        >
                          {tc[labelKey]}
                        </a>
                      ) : (
                        <p className="text-sm font-sans text-charcoal leading-snug">{tc[labelKey]}</p>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Social */}
            <FadeIn delay={0.3}>
              <h3 className="font-serif text-base font-semibold text-charcoal mb-4">{tc.social_title}</h3>
              <a
                href={FACEBOOK_PAGE}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1877F2] text-white text-sm font-medium font-sans hover:bg-[#1463cc] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FacebookIcon size={18} aria-hidden="true" />
                Mawada Parapharmacie — 5 300+ abonnés
                <ExternalLink size={13} className="opacity-70" aria-hidden="true" />
              </a>
            </FadeIn>

            {/* Map embed */}
            <FadeIn delay={0.4} className="mt-10">
              <h3 className="font-serif text-base font-semibold text-charcoal mb-4">{tc.map_title}</h3>
              <div className="rounded-2xl overflow-hidden shadow-card border border-rose-50 h-52">
                <iframe
                  title="Localisation Mawada Parapharmacie Kasserine"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50000!2d8.8365!3d35.1776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fdb8a97a30f40f%3A0x6d8e09b8a4a50c97!2sKasserine%2C%20Tunisia!5e0!3m2!1sfr!2stn!4v1700000000000!5m2!1sfr!2stn"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </FadeIn>
          </div>

          {/* Contact form */}
          <FadeIn direction={isRTL ? 'left' : 'right'} delay={0.15}>
            <div className="bg-white rounded-3xl shadow-card border border-rose-50 p-8 lg:p-10">
              <h2 className={`font-serif text-2xl text-charcoal mb-7 ${isRTL ? 'text-right' : ''}`}>
                {lang === 'fr' ? 'Envoyez-nous un message' : 'أرسل لنا رسالة'}
              </h2>
              <form
                onSubmit={handleSubmit}
                noValidate
                aria-label={lang === 'fr' ? 'Formulaire de contact' : 'نموذج الاتصال'}
                className="space-y-5"
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className={`block text-sm font-medium font-sans text-charcoal mb-1.5 ${isRTL ? 'text-right' : ''}`}
                  >
                    {tc.form_name}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder={tc.form_name}
                    className={`w-full h-12 px-4 bg-ivory border rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray/70 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all ${errors.name ? 'border-red-400' : 'border-rose-100'} ${isRTL ? 'text-right' : ''}`}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && <p id="name-error" className={`mt-1 text-xs text-red-500 font-sans ${isRTL ? 'text-right' : ''}`}>{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="contact-phone"
                    className={`block text-sm font-medium font-sans text-charcoal mb-1.5 ${isRTL ? 'text-right' : ''}`}
                  >
                    {tc.form_phone}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="+216 XX XXX XXX"
                    dir="ltr"
                    style={{ unicodeBidi: 'plaintext' }}
                    className={`w-full h-12 px-4 bg-ivory border rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray/70 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all ${errors.phone ? 'border-red-400' : 'border-rose-100'}`}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && <p id="phone-error" className={`mt-1 text-xs text-red-500 font-sans ${isRTL ? 'text-right' : ''}`}>{errors.phone}</p>}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className={`block text-sm font-medium font-sans text-charcoal mb-1.5 ${isRTL ? 'text-right' : ''}`}
                  >
                    {tc.form_message}
                  </label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={handleChange('message')}
                    rows={4}
                    placeholder={lang === 'fr' ? 'Votre message ou question...' : 'رسالتك أو سؤالك...'}
                    className={`w-full px-4 py-3 bg-ivory border rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray/70 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all resize-none ${errors.message ? 'border-red-400' : 'border-rose-100'} ${isRTL ? 'text-right' : ''}`}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && <p id="message-error" className={`mt-1 text-xs text-red-500 font-sans ${isRTL ? 'text-right' : ''}`}>{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-[#25D366] text-white text-sm font-medium font-sans hover:bg-[#1ebe5d] transition-all duration-300 shadow-md hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {tc.form_submit}
                </button>
              </form>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  )
}
