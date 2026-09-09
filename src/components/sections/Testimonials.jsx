import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { FadeIn } from '../ui/Animations'
import { useSiteContent } from '../../hooks/useSiteContent'

// Témoignages codés en dur comme fallback
const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    key: 'testimonial_1',
    name: 'Fatma Ben Ali',
    nameAr: 'فاطمة بن علي',
    location: 'Kasserine',
    rating: 5,
    text: 'Je commande régulièrement les vitamines Kinder Health pour mes enfants. La qualité est irréprochable et le service est excellent. Je recommande vivement Mawada !',
    textAr: 'أطلب منتجات كيندر هيلث بانتظام لأطفالي. الجودة ممتازة والخدمة رائعة. أنصح بمواده بشدة!',
    avatar: 'F',
    avatarColor: '#E8C5C1',
  },
  {
    id: 2,
    key: 'testimonial_2',
    name: 'Salma Trabelsi',
    nameAr: 'سلمى الطرابلسي',
    location: 'Kasserine',
    rating: 5,
    text: 'Le sérum vitamine C a transformé ma peau en 3 semaines ! Des produits authentiques, pas de contrefaçon. L\'équipe conseille vraiment bien selon le type de peau.',
    textAr: 'سيروم فيتامين سي غيّر بشرتي في 3 أسابيع! منتجات أصلية، والفريق ينصح جيداً حسب نوع البشرة.',
    avatar: 'S',
    avatarColor: '#C9A96E',
  },
  {
    id: 3,
    key: 'testimonial_3',
    name: 'Meriem Jlassi',
    nameAr: 'مريم الجلاصي',
    location: 'Kasserine',
    rating: 5,
    text: 'La crème pour bébé est absolument parfaite pour la peau sensible de ma petite. Zéro irritation, texture douce comme de la soie. Merci Mawada pour votre confiance !',
    textAr: 'كريم الطفل مثالي للبشرة الحساسة. لا تهيج، ملمس ناعم. شكراً مواده على ثقتكم!',
    avatar: 'M',
    avatarColor: '#C4747A',
  },
  {
    id: 4,
    key: 'testimonial_4',
    name: 'Hana Saidi',
    nameAr: 'هناء سعيدي',
    location: 'Kasserine',
    rating: 5,
    text: 'Commande via WhatsApp super rapide ! J\'ai reçu ma commande en moins d\'une heure. Les produits sont exactement comme décrits. Shop de confiance absolue.',
    textAr: 'الطلب عبر واتساب سريع جداً! تلقيت طلبي في أقل من ساعة. المنتجات تماماً كما وصفت.',
    avatar: 'H',
    avatarColor: '#B8923A',
  },
  {
    id: 5,
    key: 'testimonial_5',
    name: 'Rania Hamdi',
    nameAr: 'رانيا حمدي',
    location: 'Kasserine',
    rating: 5,
    text: 'Le highlighter Aurora est mon coup de cœur depuis des mois. Jamais trouvé ça ailleurs à Kasserine. Mawada Parapharmacie est mon adresse beauté préférée !',
    textAr: 'هايلايتر أورورا أفضل ما لديّ منذ أشهر. لم أجده في مكان آخر بالقصرين. مواده هي عنواني للجمال!',
    avatar: 'R',
    avatarColor: '#8C3A44',
  },
]

const AVATAR_COLORS = ['#E8C5C1', '#C9A96E', '#C4747A', '#B8923A', '#8C3A44']

export default function Testimonials() {
  const { t, lang, isRTL } = useLanguage()
  const { getContent } = useSiteContent(lang)
  const [current, setCurrent] = useState(0)

  // Fusionner les valeurs Supabase avec les fallbacks locaux
  const testimonials = DEFAULT_TESTIMONIALS.map((item, idx) => {
    const dynText = getContent(`${item.key}_text`, '')
    const dynName = getContent(`${item.key}_name`, '')
    return {
      ...item,
      text:   dynText || item.text,
      textAr: dynText || item.textAr,
      name:   dynName || item.name,
      nameAr: dynName || item.nameAr,
      avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      avatar: (dynName || item.name).charAt(0).toUpperCase(),
    }
  })

  const prev = () => setCurrent(i => (i - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent(i => (i + 1) % testimonials.length)

  const visible = [
    testimonials[current],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ]

  return (
    <section className="py-20 bg-rose-gradient overflow-hidden" aria-labelledby="testimonials-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-sans font-medium tracking-widest uppercase text-rose-400 mb-3">
            {lang === 'fr' ? 'Avis Clients' : 'آراء الزبائن'}
          </p>
          <h2 id="testimonials-title" className="font-serif text-3xl sm:text-4xl text-charcoal">
            {t.testimonials.title}
          </h2>
          <p className="mt-3 text-base text-warm-gray font-sans">{t.testimonials.subtitle}</p>
        </FadeIn>

        {/* Desktop: 3 cards */}
        <div className="hidden md:grid grid-cols-3 gap-6 mb-10">
          <AnimatePresence mode="wait">
            {visible.map((item, i) => (
              <motion.div
                key={`${current}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <TestimonialCard item={item} lang={lang} isRTL={isRTL} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile: 1 card */}
        <div className="md:hidden mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              transition={{ duration: 0.4 }}
            >
              <TestimonialCard item={testimonials[current]} lang={lang} isRTL={isRTL} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={isRTL ? next : prev}
            className="w-10 h-10 rounded-full bg-white border border-rose-200 flex items-center justify-center text-charcoal hover:bg-rose-50 hover:border-rose-400 transition-all duration-200"
            aria-label="Avis précédent"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-rose-500' : 'w-1.5 bg-rose-200'}`}
                aria-label={`Aller à l'avis ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={isRTL ? prev : next}
            className="w-10 h-10 rounded-full bg-white border border-rose-200 flex items-center justify-center text-charcoal hover:bg-rose-50 hover:border-rose-400 transition-all duration-200"
            aria-label="Avis suivant"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ item, lang, isRTL }) {
  const text = lang === 'ar' ? (item.textAr || item.text) : item.text
  const name = lang === 'ar' ? (item.nameAr || item.name) : item.name

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-card border border-rose-50 h-full flex flex-col ${isRTL ? 'text-right' : ''}`}>
      <Quote
        size={28}
        className={`text-rose-200 mb-4 ${isRTL ? 'self-end scale-x-[-1]' : ''}`}
        aria-hidden="true"
      />
      <p className="text-sm text-charcoal-light font-sans leading-relaxed flex-1 mb-5 italic">
        &ldquo;{text}&rdquo;
      </p>
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold text-base shrink-0"
          style={{ backgroundColor: item.avatarColor }}
          aria-hidden="true"
        >
          {item.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold font-sans text-charcoal">{name}</p>
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            {Array.from({ length: item.rating }).map((_, i) => (
              <Star key={i} size={12} className="text-gold-400 fill-gold-300" aria-hidden="true" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
