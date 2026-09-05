import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, Globe } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import logoImg from '../../assets/logo.jpg'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { t, lang, toggleLang, isRTL } = useLanguage()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/boutique', label: t.nav.shop },
    { to: '/a-propos', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ]

  const isActive = (to) => location.pathname === to

  return (
    <>
      <motion.nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-rose-100'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="Mawada Parapharmacie - Accueil">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-rose-100 shadow-soft group-hover:shadow-md transition-all duration-300">
                <img src={logoImg} alt="Logo Mawada Parapharmacie" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <p className="font-serif font-semibold text-charcoal text-[15px] leading-tight">Mawada</p>
                <p className="text-warm-gray text-[10px] tracking-widest uppercase">Parapharmacie</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`link-underline font-sans text-sm font-medium transition-colors duration-200 ${
                    isActive(link.to)
                      ? 'text-sage-600'
                      : 'text-charcoal hover:text-sage-500'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <motion.button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sage-200 text-xs font-medium text-charcoal hover:bg-sage-50 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Changer la langue vers ${lang === 'fr' ? 'العربية' : 'Français'}`}
              >
                <Globe size={13} className="text-rose-400" />
                <span>{lang === 'fr' ? 'عربي' : 'FR'}</span>
              </motion.button>

              {/* Shop CTA */}
              <Link
                to="/boutique"
                className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 transition-all duration-300 shadow-soft hover:shadow-md"
              >
                <ShoppingBag size={15} />
                {t.nav.order}
              </Link>

              {/* Mobile menu toggle */}
              <motion.button
                className="lg:hidden p-2 rounded-full hover:bg-sage-50 text-charcoal transition-colors"
                onClick={() => setMenuOpen(v => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-72 bg-white z-50 shadow-2xl lg:hidden flex flex-col`}
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-rose-100">
                    <img src={logoImg} alt="Logo Mawada Parapharmacie" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-serif font-semibold text-charcoal text-sm">Mawada</p>
                    <p className="text-warm-gray text-[10px] tracking-widest uppercase">Parapharmacie</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-full hover:bg-rose-50 text-charcoal" aria-label="Fermer">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer links */}
              <nav className="flex flex-col p-5 gap-1 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      to={link.to}
                      className={`block px-4 py-3 rounded-xl font-sans text-sm font-medium transition-colors duration-200 ${
                        isActive(link.to)
                          ? 'bg-sage-50 text-sage-600'
                          : 'text-charcoal hover:bg-sage-50 hover:text-sage-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Drawer footer */}
              <div className="p-5 border-t border-rose-100">
                <Link
                  to="/boutique"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 transition-colors"
                >
                  <ShoppingBag size={16} />
                  {t.nav.order}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
