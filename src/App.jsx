import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import FloatingButtons from './components/layout/FloatingButtons'

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" aria-label="Chargement..." />
        <p className="text-sm text-warm-gray font-sans">Chargement...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen overflow-x-hidden">
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/boutique" element={<ShopPage />} />
                  <Route path="/produit/:id" element={<ProductDetailPage />} />
                  <Route path="/a-propos" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  {/* Catch-all redirect to home */}
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
            <Footer />
            <FloatingButtons />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  )
}
