import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useSiteContent } from '../../hooks/useSiteContent'
import { FadeIn } from '../ui/Animations'
import heroImg from '../../assets/hero_products.jpg'

export default function BrandStory() {
  const { t, lang, isRTL } = useLanguage()
  const { getContent } = useSiteContent(lang)

  return (
    <section className="py-20 bg-white overflow-hidden" aria-labelledby="brand-story-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-14 items-center ${isRTL ? 'lg:flex lg:flex-row-reverse' : ''}`}>

          {/* Image */}
          <FadeIn direction={isRTL ? 'right' : 'left'} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-card">
              <img
                src={heroImg}
                alt="Notre histoire — Mawada Parapharmacie"
                className="w-full h-[420px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent" aria-hidden="true" />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-charcoal text-white rounded-2xl p-5 shadow-card w-40">
              <p className="font-serif text-3xl font-semibold text-rose-300">5 300+</p>
              <p className="text-xs text-white/60 font-sans mt-1 leading-snug">
                {lang === 'fr' ? 'Clientes nous font confiance' : 'زبونة تثق بنا'}
              </p>
            </div>
            {/* Decorative dot pattern */}
            <div
              className="absolute -top-6 -left-6 w-24 h-24 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle, #C4747A 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
              aria-hidden="true"
            />
          </FadeIn>

          {/* Text */}
          <FadeIn direction={isRTL ? 'left' : 'right'} delay={0.15} className={isRTL ? 'text-right' : ''}>
            <p className="text-xs font-sans font-medium tracking-widest uppercase text-rose-400 mb-3">
              {lang === 'fr' ? 'Notre Histoire' : 'قصتنا'}
            </p>
            <h2 id="brand-story-title" className="font-serif text-3xl sm:text-4xl text-charcoal mb-5 leading-tight">
              {t.about.subtitle}
            </h2>
            <p className="text-base text-charcoal-light font-sans leading-relaxed mb-4">
              {getContent('about_story', t.about.story)}
            </p>
            <p className="text-base text-charcoal-light font-sans leading-relaxed mb-8">
              {getContent('about_story2', t.about.story2)}
            </p>

            {/* Values mini */}
            <div className={`flex flex-wrap gap-3 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {[t.about.value1_title, t.about.value2_title, t.about.value3_title].map((val, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-sm font-medium text-rose-600 font-sans"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" aria-hidden="true" />
                  {val}
                </span>
              ))}
            </div>

            <Link
              to="/a-propos"
              className={`inline-flex items-center gap-2 text-sm font-medium font-sans text-rose-500 hover:text-rose-700 transition-colors link-underline ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {lang === 'fr' ? 'En savoir plus sur nous' : 'اعرف أكثر عنا'}
              <ArrowRight size={15} className={isRTL ? 'rotate-180' : ''} />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
