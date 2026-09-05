import { useLanguage } from '../../context/LanguageContext'
import { FadeIn } from '../ui/Animations'

export default function CTABanner() {
  const { t, lang, isRTL } = useLanguage()

  return (
    <section className="py-16 bg-charcoal relative overflow-hidden" aria-label="Commander via WhatsApp">
      {/* Decorative glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <p className="text-xs font-sans font-medium tracking-widest uppercase text-rose-400 mb-4">
            {lang === 'fr' ? 'Commande rapide' : 'طلب سريع'}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4 leading-tight">
            {lang === 'fr'
              ? 'Prête à prendre soin de vous ?'
              : 'هل أنت مستعدة للعناية بنفسك؟'}
          </h2>
          <p className="text-base text-white/60 font-sans mb-8 max-w-xl mx-auto">
            {lang === 'fr'
              ? 'Contactez-nous directement sur WhatsApp. Nos conseillers répondent rapidement et vous aident à choisir les meilleurs produits pour vos besoins.'
              : 'تواصلي معنا مباشرة على واتساب. مستشاروننا يردون بسرعة ويساعدونك في اختيار أفضل المنتجات لاحتياجاتك.'}
          </p>
          <div className={`flex flex-wrap justify-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <a
              href="https://wa.me/21623104341"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#25D366] text-white text-sm font-medium font-sans hover:bg-[#1ebe5d] transition-all duration-300 shadow-md hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t.hero.cta_whatsapp}
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100063516752985"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/10 text-white text-sm font-medium font-sans border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {lang === 'fr' ? 'Nous suivre sur Facebook' : 'تابعونا على فيسبوك'}
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
