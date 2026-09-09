import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Leaf, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Rediriger si déjà connectée
  useEffect(() => {
    if (!loading && user) {
      navigate('/admin/produits', { replace: true })
    }
  }, [user, loading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await signIn(email.trim(), password)

    if (error) {
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.')
      setSubmitting(false)
    } else {
      navigate('/admin/produits', { replace: true })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="w-8 h-8 rounded-full border-4 border-sage-200 border-t-sage-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-gradient flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card border border-rose-100 overflow-hidden">

          {/* Header */}
          <div className="bg-rose-gradient border-b border-rose-100 px-8 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sage-600 flex items-center justify-center mx-auto mb-4">
              <Leaf size={24} className="text-white" />
            </div>
            <h1 className="font-serif text-2xl text-charcoal mb-1">Mawada Admin</h1>
            <p className="text-sm text-warm-gray font-sans">Panneau d'administration</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <p className="text-center text-sm text-charcoal-light font-sans mb-6">
                Connectez-vous pour gérer votre boutique
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700 font-sans">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium font-sans text-charcoal mb-2">
                Adresse email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                className="w-full h-12 px-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all bg-rose-50/20"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium font-sans text-charcoal mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 px-4 pr-12 border border-rose-100 rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all bg-rose-50/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="w-full h-12 rounded-xl bg-sage-600 text-white font-medium font-sans text-sm hover:bg-sage-700 transition-all duration-200 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {submitting && <Loader2 size={17} className="animate-spin" />}
              {submitting ? 'Connexion...' : 'Se connecter'}
            </button>

            {/* Back link */}
            <div className="text-center pt-2">
              <Link
                to="/"
                className="text-xs text-warm-gray font-sans hover:text-charcoal transition-colors"
              >
                ← Retour au site
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-warm-gray font-sans mt-6 opacity-60">
          Mawada Parapharmacie — Panneau Admin sécurisé
        </p>
      </motion.div>
    </div>
  )
}
