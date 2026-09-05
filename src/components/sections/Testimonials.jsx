import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { FadeIn } from '../ui/Animations'
import data from '../../data/products.json'

export default function Testimonials() {
  const { t, lang, isRTL } = useLanguage()
  const testimonials = data.testimonials
  const [current, setCurrent] = useState(0)

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

          {/* Dots */}
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-rose-500' : 'w-1.5 bg-rose-200'
                }`}
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
  const text = lang === 'ar' ? item.textAr : item.text
  const name = lang === 'ar' ? item.nameAr : item.name

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-card border border-rose-50 h-full flex flex-col ${isRTL ? 'text-right' : ''}`}>
      <Quote
        size={28}
        className={`text-rose-200 mb-4 ${isRTL ? 'self-end scale-x-[-1]' : ''}`}
        aria-hidden="true"
      />
      <p className="text-sm text-charcoal-light font-sans leading-relaxed flex-1 mb-5 italic">
        "{text}"
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
