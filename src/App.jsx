import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import FloatingButtons from './components/layout/FloatingButtons'

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

// Admin components (not lazy-loaded for simplicity, or could be)
import AdminLayout from './components/admin/AdminLayout'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminContentPage from './pages/admin/AdminContentPage'
import AdminPromoCodesPage from './pages/admin/AdminPromoCodesPage'
import AdminRequestsPage from './pages/admin/AdminRequestsPage'

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

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </Suspense>
      <Footer />
      <FloatingButtons />
    </div>
  )
}

function GlobalSettings() {
  const { settings, loading } = useSettings()

  if (loading || !settings.pixelId) return null

  return (
    <Helmet>
      <script>
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${settings.pixelId}');
          fbq('track', 'PageView');
        `}
      </script>
      <noscript>
        {`<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.pixelId}&ev=PageView&noscript=1" />`}
      </noscript>
    </Helmet>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <BrowserRouter>
                <GlobalSettings />
                <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/produits" replace />} />
                <Route path="produits" element={<AdminProductsPage />} />
                <Route path="commandes" element={<AdminOrdersPage />} />
                <Route path="demandes" element={<AdminRequestsPage />} />
                <Route path="contenu" element={<AdminContentPage />} />
                <Route path="promo" element={<AdminPromoCodesPage />} />
              </Route>

              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="boutique" element={<ShopPage />} />
                <Route path="produit/:id" element={<ProductDetailPage />} />
                <Route path="a-propos" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                {/* Catch-all redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
              </Routes>
            </BrowserRouter>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  )
}
