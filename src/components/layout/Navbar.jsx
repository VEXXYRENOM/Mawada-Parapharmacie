import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingCart, Globe } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useCart } from '../../context/CartContext'
import CartDrawer from '../ui/CartDrawer'
import logoImg from '../../assets/logo.jpg'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { t, lang, toggleLang, isRTL } = useLanguage()
  const { totalItems, setIsOpen: openCart } = useCart()
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
      {/* Cart Drawer (rendered at root so it's always accessible) */}
      <CartDrawer />

      <motion.nav
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
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
            <div className="flex items-center gap-2 sm:gap-3">
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

              {/* Cart icon with badge */}
              <motion.button
                onClick={() => openCart(true)}
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white border border-rose-100 text-charcoal hover:border-sage-300 hover:text-sage-600 transition-colors shadow-soft"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Panier (${totalItems} article${totalItems > 1 ? 's' : ''})`}
              >
                <ShoppingCart size={16} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold font-sans flex items-center justify-center leading-none"
                    >
                      {totalItems > 99 ? '99+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

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
              className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-72 bg-white z-40 shadow-2xl lg:hidden flex flex-col`}
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
              <div className="p-5 border-t border-rose-100 space-y-2">
                <button
                  onClick={() => { openCart(true); setMenuOpen(false) }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-sage-300 text-sage-600 text-sm font-medium hover:bg-sage-50 transition-colors relative"
                >
                  <ShoppingCart size={16} />
                  {lang === 'ar' ? 'السلة' : 'Mon panier'}
                  {totalItems > 0 && (
                    <span className="absolute right-4 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
