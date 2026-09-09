import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, ShoppingBag } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useSiteContent } from '../../hooks/useSiteContent'
import heroImg from '../../assets/hero_products.jpg'
import logoImg from '../../assets/logo.jpg'

export default function HeroSection() {
  const { t, lang, isRTL } = useLanguage()
  const { getContent } = useSiteContent(lang)
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-rose-gradient"
      aria-label="Section d'accueil Mawada Parapharmacie"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern opacity-60" aria-hidden="true" />

      {/* Decorative circles */}
      <motion.div
        className="absolute top-16 right-1/4 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl"
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.45, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-gold-100/40 blur-3xl"
        aria-hidden="true"
        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 items-center min-h-screen">

        {/* ── Text Content ── */}
        <motion.div
          className={`relative z-10 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}
          style={{ y: textY, opacity }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-600 text-xs font-sans font-medium">
              <Star size={11} fill="currentColor" />
              {t.hero.badge}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={itemVariants} className="font-serif text-5xl sm:text-6xl lg:text-7xl text-charcoal leading-none mb-2">
            <span className="block">{getContent('hero_title', t.hero.title)}</span>
            <span className="block text-sage-600">{getContent('hero_title2', t.hero.title2)}</span>
            <span className="block text-gold-gradient">{getContent('hero_title3', t.hero.title3)}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="mt-6 text-base sm:text-lg text-charcoal-light leading-relaxed max-w-md font-sans">
            {getContent('hero_subtitle', t.hero.subtitle)}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-sage-600 text-white text-sm font-medium font-sans hover:bg-sage-700 transition-all duration-300 shadow-soft hover:shadow-md hover:-translate-y-0.5"
            >
              <ShoppingBag size={16} />
              {t.hero.cta_shop}
              <ArrowRight size={15} className={isRTL ? 'rotate-180' : ''} />
            </Link>
            <a
              href="https://wa.me/21623104341"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-charcoal text-sm font-medium font-sans border border-rose-200 hover:border-rose-400 hover:bg-rose-50 transition-all duration-300 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t.hero.cta_whatsapp}
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div variants={itemVariants} className="mt-12 flex items-center gap-6 sm:gap-10">
            {[
              { val: t.hero.stat1, label: t.hero.stat1Label },
              { val: t.hero.stat2, label: t.hero.stat2Label },
              { val: t.hero.stat3, label: t.hero.stat3Label },
            ].map((stat, i) => (
              <div key={i} className={`${i > 0 ? `${isRTL ? 'border-r' : 'border-l'} border-rose-200 ${isRTL ? 'pr-6 sm:pr-10' : 'pl-6 sm:pl-10'}` : ''}`}>
                <p className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">{stat.val}</p>
                <p className="text-xs text-warm-gray font-sans mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Image Panel ── */}
        <motion.div
          className={`relative ${isRTL ? 'lg:order-1' : 'lg:order-2'} flex justify-center lg:justify-end`}
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 0.94, x: isRTL ? -40 : 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main image container with clip-path */}
          <div className="relative w-full max-w-lg lg:max-w-none">
            {/* Decorative blob behind image */}
            <div
              className="absolute -inset-6 bg-gradient-to-br from-rose-200/60 to-gold-100/40 rounded-[60%_40%_40%_60%_/_50%_30%_70%_50%] blur-sm"
              aria-hidden="true"
            />

            <div className="relative rounded-3xl overflow-hidden shadow-card border border-white/60">
              <img
                src={heroImg}
                alt="Produits de beauté et de santé Mawada Parapharmacie — sérums, crèmes et compléments de qualité premium"
                className="w-full h-[420px] sm:h-[500px] object-cover"
                loading="eager"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent" aria-hidden="true" />
            </div>

            {/* Floating badge card */}
            <motion.div
              className={`absolute -bottom-5 ${isRTL ? '-left-4 sm:-left-8' : '-right-4 sm:-right-8'} bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 border border-rose-100`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Star size={18} className="text-rose-500 fill-rose-200" />
              </div>
              <div>
                <p className="text-xs font-medium font-sans text-charcoal">Produits Certifiés</p>
                <p className="text-[11px] text-warm-gray font-sans">100% Authentiques</p>
              </div>
            </motion.div>

            {/* Brand tag top — logo réel */}
            <motion.div
              className={`absolute -top-6 ${isRTL ? '-right-2' : '-left-2'} sm:${isRTL ? '-right-6' : '-left-6'} bg-white rounded-2xl shadow-card px-3 py-2.5 flex items-center gap-2.5 border border-rose-100`}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-rose-100 shrink-0">
                <img src={logoImg} alt="Mawada" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-serif text-sm font-semibold text-charcoal">Mawada</p>
                <p className="text-[10px] text-sage-500 tracking-widest uppercase">Parapharmacie</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ opacity }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <div className="w-5 h-8 rounded-full border-2 border-rose-300 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-rose-400" />
        </div>
      </motion.div>
    </section>
  )
}
