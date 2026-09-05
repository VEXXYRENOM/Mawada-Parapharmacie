import { Helmet } from 'react-helmet-async'
import { Heart, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem, ScaleIn } from '../components/ui/Animations'
import heroImg from '../assets/hero_products.jpg'
import skinImg from '../assets/skincare_face.jpg'

const STATS = [
  { key: 'stat1', labelKey: 'stat1Label' },
  { key: 'stat2', labelKey: 'stat2Label' },
  { key: 'stat3', labelKey: 'stat3Label' },
  { key: 'stat4', labelKey: 'stat4Label' },
]

const VALUES = [
  { titleKey: 'value1_title', descKey: 'value1_desc', Icon: Heart, color: '#C4747A', bg: '#FFF0EE' },
  { titleKey: 'value2_title', descKey: 'value2_desc', Icon: ShieldCheck, color: '#B8923A', bg: '#F5E8CC' },
  { titleKey: 'value3_title', descKey: 'value3_desc', Icon: Sparkles, color: '#8C3A44', bg: '#F5C9C3' },
]

export default function AboutPage() {
  const { t, lang, isRTL } = useLanguage()
  const ta = t.about

  return (
    <PageTransition>
      <Helmet>
        <title>À Propos — Mawada Parapharmacie | Kasserine, Tunisie</title>
        <meta name="description" content="Découvrez l'histoire de Mawada Parapharmacie, nos valeurs Soin, Confiance, Féminité et notre engagement pour des produits de beauté authentiques à Kasserine." />
      </Helmet>

      {/* Page Header */}
      <div className="pt-28 pb-14 bg-rose-gradient bg-pattern">
        <FadeIn className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-sans font-medium tracking-widest uppercase text-rose-400 mb-3">
            {lang === 'fr' ? 'Notre Identité' : 'هويتنا'}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal mb-4">{ta.title}</h1>
          <p className="text-base text-warm-gray font-sans">{ta.subtitle}</p>
        </FadeIn>
      </div>

      {/* Story section */}
      <section className="py-20 bg-white" aria-labelledby="our-story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-14 items-center ${isRTL ? 'lg:flex lg:flex-row-reverse' : ''}`}>
            <FadeIn direction={isRTL ? 'right' : 'left'}>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-card">
                  <img src={heroImg} alt="Mawada Parapharmacie — produits de qualité" className="w-full h-96 object-cover" loading="lazy" />
                </div>
                <div className="absolute -bottom-5 -right-5 w-40 h-40 rounded-2xl overflow-hidden shadow-card border-4 border-white">
                  <img src={skinImg} alt="Soins visage Mawada" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            </FadeIn>
            <FadeIn direction={isRTL ? 'left' : 'right'} delay={0.15} className={isRTL ? 'text-right' : ''}>
              <h2 id="our-story" className="font-serif text-3xl sm:text-4xl text-charcoal mb-5 leading-tight">
                {lang === 'fr' ? 'Une passion née à Kasserine' : 'شغف وُلد في القصرين'}
              </h2>
              <p className="text-base text-charcoal-light font-sans leading-relaxed mb-4">{ta.story}</p>
              <p className="text-base text-charcoal-light font-sans leading-relaxed">{ta.story2}</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-ivory bg-pattern" aria-labelledby="our-values">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <h2 id="our-values" className="font-serif text-3xl sm:text-4xl text-charcoal">{ta.values_title}</h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map(({ titleKey, descKey, Icon, color, bg }) => (
              <StaggerItem key={titleKey}>
                <div className={`bg-white rounded-3xl p-8 shadow-card border border-rose-50 h-full ${isRTL ? 'text-right' : ''}`}>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${isRTL ? 'mr-auto' : ''}`}
                    style={{ backgroundColor: bg }}
                    aria-hidden="true"
                  >
                    <Icon size={26} style={{ color }} />
                  </div>
                  <h3 className="font-serif text-xl text-charcoal mb-3">{ta[titleKey]}</h3>
                  <p className="text-sm text-charcoal-light font-sans leading-relaxed">{ta[descKey]}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-charcoal" aria-labelledby="our-stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 id="our-stats" className="font-serif text-2xl sm:text-3xl text-white">{ta.stats_title}</h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ key, labelKey }) => (
              <StaggerItem key={key}>
                <ScaleIn>
                  <div className="text-center">
                    <motion.p
                      className="font-serif text-4xl sm:text-5xl font-semibold text-rose-400 mb-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {ta[key]}
                    </motion.p>
                    <p className="text-sm text-white/60 font-sans">{ta[labelKey]}</p>
                  </div>
                </ScaleIn>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-rose-gradient">
        <FadeIn className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-4">
            {lang === 'fr' ? 'Venez nous rendre visite !' : 'تفضلوا بزيارتنا!'}
          </h2>
          <p className="text-base text-warm-gray font-sans mb-6">
            {lang === 'fr'
              ? 'Cité Manar, AV Ali Bash Hambah, Kasserine, Tunisie 1200 — Ouvert tous les jours'
              : 'حي المنار، ش علي باش حامبا، القصرين، تونس 1200 — مفتوح كل الأيام'}
          </p>
          <a
            href="https://wa.me/21623104341"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-sage-600 text-white text-sm font-medium font-sans hover:bg-sage-700 transition-colors shadow-soft"
          >
            {lang === 'fr' ? 'Nous contacter' : 'اتصل بنا'}
          </a>
        </FadeIn>
      </section>
    </PageTransition>
  )
}
