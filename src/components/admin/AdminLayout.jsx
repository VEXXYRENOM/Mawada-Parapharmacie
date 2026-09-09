import { useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Package, ClipboardList, FileText, LogOut, Leaf, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  {
    to: '/admin/produits',
    icon: Package,
    label: '📦 Produits',
    desc: 'Ajouter, modifier, supprimer',
  },
  {
    to: '/admin/commandes',
    icon: ClipboardList,
    label: '📋 Commandes',
    desc: 'Voir et gérer les commandes',
  },
  {
    to: '/admin/contenu',
    icon: FileText,
    label: '✏️ Contenu du site',
    desc: 'Textes et descriptions',
  },
]

export default function AdminLayout() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Guard : redirection si non connecté
  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="w-8 h-8 rounded-full border-4 border-sage-200 border-t-sage-500 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  const currentPath = location.pathname

  return (
    <div className="min-h-screen bg-[#f8f6f3] flex">

      {/* ─── Sidebar Desktop ─── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-rose-100 shadow-sm fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage-600 flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <p className="font-serif text-sm font-semibold text-charcoal">Mawada</p>
              <p className="text-[10px] text-warm-gray font-sans uppercase tracking-widest">Admin</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/40">
          <p className="text-xs text-warm-gray font-sans">Connectée en tant que</p>
          <p className="text-sm font-medium font-sans text-charcoal truncate mt-0.5">{user.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigation Admin">
          {NAV_ITEMS.map(item => {
            const isActive = currentPath.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-sage-600 text-white shadow-soft'
                    : 'text-charcoal hover:bg-rose-50'
                }`}
              >
                <item.icon size={20} className={`shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-sage-500 group-hover:text-sage-600'}`} />
                <div>
                  <p className={`text-sm font-medium font-sans ${isActive ? 'text-white' : 'text-charcoal'}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs font-sans ${isActive ? 'text-white/70' : 'text-warm-gray'}`}>
                    {item.desc}
                  </p>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-rose-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-200 font-sans text-sm font-medium"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-xl border border-rose-100 text-warm-gray hover:text-charcoal hover:bg-rose-50/50 transition-all duration-200 font-sans text-xs"
          >
            ← Voir le site public
          </Link>
        </div>
      </aside>

      {/* ─── Mobile Header ─── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-rose-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sage-600 flex items-center justify-center">
            <Leaf size={15} className="text-white" />
          </div>
          <span className="font-serif text-sm font-semibold text-charcoal">Mawada Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(v => !v)}
          className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-charcoal"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-charcoal/40 z-30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-40 lg:hidden flex flex-col shadow-xl"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-5 border-b border-rose-100 mt-14">
                <p className="text-xs text-warm-gray font-sans">Connectée en tant que</p>
                <p className="text-sm font-medium font-sans text-charcoal truncate mt-0.5">{user.email}</p>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map(item => {
                  const isActive = currentPath.startsWith(item.to)
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive ? 'bg-sage-600 text-white' : 'text-charcoal hover:bg-rose-50'
                      }`}
                    >
                      <item.icon size={20} className={`shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-sage-500'}`} />
                      <div>
                        <p className={`text-sm font-medium font-sans ${isActive ? 'text-white' : ''}`}>{item.label}</p>
                        <p className={`text-xs font-sans ${isActive ? 'text-white/70' : 'text-warm-gray'}`}>{item.desc}</p>
                      </div>
                    </Link>
                  )
                })}
              </nav>
              <div className="p-4 border-t border-rose-100">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut() }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-sans text-sm font-medium"
                >
                  <LogOut size={18} /> Déconnexion
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ─── */}
      <main className="flex-1 lg:ml-64 pt-[60px] lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
