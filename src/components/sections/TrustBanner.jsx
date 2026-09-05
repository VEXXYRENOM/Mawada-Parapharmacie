import { ShieldCheck, MessageCircle, Star } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { StaggerContainer, StaggerItem } from '../ui/Animations'

export default function TrustBanner() {
  const { t, isRTL } = useLanguage()

  const items = [
    {
      icon: ShieldCheck,
      title: t.trust.title1,
      desc: t.trust.desc1,
      color: '#C4747A',
      bg: '#FFF0EE',
    },
    {
      icon: Star,
      title: t.trust.title2,
      desc: t.trust.desc2,
      color: '#C9A96E',
      bg: '#F5E8CC',
    },
    {
      icon: MessageCircle,
      title: t.trust.title3,
      desc: t.trust.desc3,
      color: '#25D366',
      bg: '#E8F9F0',
    },
  ]

  return (
    <section className="py-14 bg-white border-y border-rose-100" aria-label="Nos engagements">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer
          className={`grid grid-cols-1 sm:grid-cols-3 gap-8 ${isRTL ? 'direction-rtl' : ''}`}
        >
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: item.bg }}
                  aria-hidden="true"
                >
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-charcoal mb-1">{item.title}</h3>
                  <p className="text-sm text-warm-gray font-sans leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
