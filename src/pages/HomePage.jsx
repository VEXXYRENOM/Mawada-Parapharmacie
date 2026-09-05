import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import HeroSection from '../components/sections/HeroSection'
import TrustBanner from '../components/sections/TrustBanner'
import FeaturedCategories from '../components/sections/FeaturedCategories'
import FeaturedProducts from '../components/sections/FeaturedProducts'
import Testimonials from '../components/sections/Testimonials'
import BrandStory from '../components/sections/BrandStory'
import CTABanner from '../components/sections/CTABanner'
import { PageTransition } from '../components/ui/Animations'

export default function HomePage() {
  const { lang } = useLanguage()
  return (
    <PageTransition>
      <Helmet>
        <title>Mawada Parapharmacie — Soin, Confiance, Féminité | Kasserine, Tunisie</title>
        <meta name="description" content="Mawada Parapharmacie à Kasserine — produits de beauté, cosmétiques et compléments alimentaires des meilleures marques mondiales. Commandez via WhatsApp." />
      </Helmet>
      <main>
        <HeroSection />
        <TrustBanner />
        <FeaturedCategories />
        <FeaturedProducts />
        <BrandStory />
        <Testimonials />
        <CTABanner />
      </main>
    </PageTransition>
  )
}
