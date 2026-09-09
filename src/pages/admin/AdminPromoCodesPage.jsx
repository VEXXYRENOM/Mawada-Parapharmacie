import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, RefreshCw, X, Copy, Check, Calendar,
  Users, ToggleLeft, ToggleRight, Tag, Percent, DollarSign, Loader2
} from 'lucide-react'
import {
  getAllPromoCodes, createPromoCode, updatePromoCode, deletePromoCode
} from '../../lib/queries'
import { Toast, useToast } from '../../components/admin/Toast'

// ─── Générateur de code aléatoire ───────────────────────────────
function generateCode(prefix = 'MAWADA') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let rand = ''
  for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)]
  return `${prefix}-${rand}`
}

const EMPTY_FORM = {
  code:           '',
  discount_type:  'percentage',
  discount_value: '',
  expires_at:     '',
  max_uses:       '',
  is_active:      true,
}

function fmtDate(dateStr) {
  if (!dateStr) return 'Sans expiration'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr))
}

function isExpired(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

function StatusBadge({ promo }) {
  if (!promo.is_active)
    return <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-warm-gray/20 text-warm-gray border border-warm-gray/30">Inactif</span>
  if (isExpired(promo.expires_at))
    return <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 border border-rose-200">Expiré</span>
  if (promo.max_uses !== null && promo.current_uses >= promo.max_uses)
    return <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Épuisé</span>
  return <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Actif</span>
}

export default function AdminPromoCodesPage() {
  const [codes, setCodes]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [modalOpen, setModalOpen]       = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [submitting, setSubmitting]     = useState(false)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [copiedId, setCopiedId]         = useState(null)
  const { toast, showToast, clearToast } = useToast()

  const fetchCodes = useCallback(async () => {
    setLoading(true)
    const data = await getAllPromoCodes()
    setCodes(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchCodes() }, [fetchCodes])

  function handleField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function openNew() {
    setForm({ ...EMPTY_FORM, code: generateCode() })
    setModalOpen(true)
  }

  function copyCode(id, code) {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.code.trim() || !form.discount_value) {
      showToast('Le code et la valeur de réduction sont requis.', 'error')
      return
    }
    setSubmitting(true)
    const payload = {
      code:           form.code.trim().toUpperCase(),
      discount_type:  form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      expires_at:     form.expires_at || null,
      max_uses:       form.max_uses ? parseInt(form.max_uses) : null,
      is_active:      form.is_active,
    }
    const { error } = await createPromoCode(payload)
    setSubmitting(false)
    if (error) {
      showToast(error.message?.includes('unique') ? 'Ce code existe déjà.' : 'Erreur lors de la création.', 'error')
    } else {
      showToast(`Code "${payload.code}" créé avec succès ✅`, 'success')
      setModalOpen(false)
      await fetchCodes()
    }
  }

  async function handleToggle(promo) {
    const { error } = await updatePromoCode(promo.id, { is_active: !promo.is_active })
    if (error) {
      showToast('Erreur lors de la mise à jour.', 'error')
    } else {
      showToast(promo.is_active ? `"${promo.code}" désactivé.` : `"${promo.code}" activé ✅`, 'success')
      await fetchCodes()
    }
  }

  async function handleDelete(promo) {
    const { error } = await deletePromoCode(promo.id)
    if (error) {
      showToast('Erreur lors de la suppression.', 'error')
    } else {
      showToast(`"${promo.code}" supprimé ✅`, 'success')
      setDeleteConfirm(null)
      await fetchCodes()
    }
  }

  const activeCount = codes.filter(c => c.is_active && !isExpired(c.expires_at) && (c.max_uses === null || c.current_uses < c.max_uses)).length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="w-full max-w-sm bg-white rounded-3xl shadow-card p-6"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}>
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-rose-500" />
                </div>
                <h3 className="font-serif text-lg text-charcoal text-center mb-2">Supprimer ce code ?</h3>
                <p className="text-sm text-warm-gray font-sans text-center mb-6">
                  Le code <strong className="text-charcoal font-mono">{deleteConfirm.code}</strong> sera supprimé définitivement.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)}
                    className="flex-1 h-11 rounded-xl border border-rose-100 text-charcoal font-medium font-sans text-sm hover:bg-rose-50 transition-colors">
                    Annuler
                  </button>
                  <button onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 h-11 rounded-xl bg-rose-500 text-white font-medium font-sans text-sm hover:bg-rose-600 transition-colors">
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-card"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-rose-200" />
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100">
                  <h2 className="font-serif text-lg text-charcoal">🎟️ Nouveau code promo</h2>
                  <button onClick={() => setModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-rose-100 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5 pb-safe">

                  {/* Code + Generate */}
                  <div>
                    <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                      Code promo <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.code}
                        onChange={e => handleField('code', e.target.value.toUpperCase())}
                        placeholder="EX: MAWADA-ABC123"
                        required
                        className="flex-1 h-10 px-4 border border-rose-100 rounded-xl font-mono text-sm text-charcoal uppercase focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => handleField('code', generateCode())}
                        className="h-10 px-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition-colors flex items-center gap-1.5 text-xs font-medium font-sans whitespace-nowrap"
                      >
                        <RefreshCw size={14} /> Générer
                      </button>
                    </div>
                  </div>

                  {/* Discount type */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleField('discount_type', 'percentage')}
                      className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-medium font-sans transition-all ${
                        form.discount_type === 'percentage'
                          ? 'bg-sage-600 text-white border-sage-600 shadow-soft'
                          : 'bg-white text-charcoal border-rose-100 hover:bg-rose-50'
                      }`}
                    >
                      <Percent size={15} /> Pourcentage
                    </button>
                    <button
                      type="button"
                      onClick={() => handleField('discount_type', 'fixed')}
                      className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-medium font-sans transition-all ${
                        form.discount_type === 'fixed'
                          ? 'bg-sage-600 text-white border-sage-600 shadow-soft'
                          : 'bg-white text-charcoal border-rose-100 hover:bg-rose-50'
                      }`}
                    >
                      <DollarSign size={15} /> Montant fixe
                    </button>
                  </div>

                  {/* Discount value */}
                  <div>
                    <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                      {form.discount_type === 'percentage' ? 'Réduction (%)' : 'Réduction (TND)'}
                      <span className="text-rose-500"> *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form.discount_value}
                        onChange={e => handleField('discount_value', e.target.value)}
                        required
                        min="0"
                        max={form.discount_type === 'percentage' ? '100' : undefined}
                        step="0.01"
                        placeholder={form.discount_type === 'percentage' ? 'Ex: 15' : 'Ex: 10.00'}
                        className="w-full h-10 px-4 pr-12 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray text-sm font-sans pointer-events-none">
                        {form.discount_type === 'percentage' ? '%' : 'TND'}
                      </span>
                    </div>
                  </div>

                  {/* Expiry + Max uses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                        <Calendar size={13} className="inline mr-1 text-warm-gray" />
                        Date d'expiration <span className="text-warm-gray font-normal">(optionnel)</span>
                      </label>
                      <input
                        type="date"
                        value={form.expires_at ? form.expires_at.slice(0, 10) : ''}
                        onChange={e => handleField('expires_at', e.target.value ? e.target.value + 'T23:59:59Z' : '')}
                        min={new Date().toISOString().slice(0, 10)}
                        className="w-full h-10 px-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                        <Users size={13} className="inline mr-1 text-warm-gray" />
                        Max utilisateurs <span className="text-warm-gray font-normal">(optionnel)</span>
                      </label>
                      <input
                        type="number"
                        value={form.max_uses}
                        onChange={e => handleField('max_uses', e.target.value)}
                        min="1"
                        placeholder="Illimité si vide"
                        className="w-full h-10 px-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50/40 border border-rose-100">
                    <div>
                      <p className="text-sm font-medium font-sans text-charcoal">Activer immédiatement</p>
                      <p className="text-xs text-warm-gray font-sans mt-0.5">
                        {form.is_active ? 'Le code sera utilisable dès maintenant' : 'Le code sera créé inactif'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleField('is_active', !form.is_active)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form.is_active ? 'bg-sage-600' : 'bg-warm-gray/30'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-1 pb-2">
                    <button type="button" onClick={() => setModalOpen(false)}
                      className="flex-1 h-12 rounded-xl border border-rose-100 text-charcoal font-medium font-sans text-sm hover:bg-rose-50 transition-colors">
                      Annuler
                    </button>
                    <button type="submit" disabled={submitting}
                      className="flex-1 h-12 rounded-xl bg-sage-600 text-white font-medium font-sans text-sm hover:bg-sage-700 transition-colors shadow-soft disabled:opacity-60 flex items-center justify-center gap-2">
                      {submitting && <Loader2 size={16} className="animate-spin" />}
                      {submitting ? 'Création...' : 'Créer le code'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal">🎟️ Codes Promo</h1>
          <p className="text-sm text-warm-gray font-sans mt-1">
            {activeCount} code{activeCount !== 1 ? 's' : ''} actif{activeCount !== 1 ? 's' : ''} · {codes.length} au total
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-600 text-white font-medium font-sans text-sm hover:bg-sage-700 transition-colors shadow-soft">
          <Plus size={16} />
          <span className="hidden sm:inline">Nouveau code</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-rose-50 animate-pulse" />
          ))}
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 py-16 text-center shadow-sm">
          <Tag size={40} className="text-rose-200 mx-auto mb-3" />
          <p className="font-serif text-lg text-charcoal mb-2">Aucun code promo</p>
          <p className="text-sm text-warm-gray font-sans mb-4">Créez votre premier code de réduction.</p>
          <button onClick={openNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-600 text-white font-medium font-sans text-sm hover:bg-sage-700 transition-colors">
            <Plus size={16} /> Créer un code
          </button>
        </div>
      ) : (
        <>
          {/* MOBILE cards */}
          <div className="md:hidden space-y-3">
            {codes.map(promo => (
              <motion.div key={promo.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden ${
                  !promo.is_active || isExpired(promo.expires_at) ? 'opacity-60' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-base font-bold text-charcoal tracking-wider">{promo.code}</span>
                    <button onClick={() => copyCode(promo.id, promo.code)} className="text-warm-gray hover:text-sage-600 transition-colors">
                      {copiedId === promo.id ? <Check size={13} className="text-sage-600" /> : <Copy size={13} />}
                    </button>
                    <StatusBadge promo={promo} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-warm-gray font-sans">
                    <span className="font-bold text-sage-600 text-sm">
                      {promo.discount_type === 'percentage' ? `-${promo.discount_value}%` : `-${parseFloat(promo.discount_value).toFixed(2)} TND`}
                    </span>
                    <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(promo.expires_at)}</span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />{promo.current_uses}{promo.max_uses !== null ? `/${promo.max_uses}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex border-t border-rose-50 divide-x divide-rose-50">
                  <button onClick={() => handleToggle(promo)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-medium font-sans">
                    {promo.is_active
                      ? <><ToggleRight size={18} className="text-emerald-500" /><span className="text-emerald-600">Actif</span></>
                      : <><ToggleLeft size={18} className="text-warm-gray" /><span className="text-warm-gray">Inactif</span></>}
                  </button>
                  <button onClick={() => setDeleteConfirm(promo)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 text-rose-500 hover:bg-rose-50 transition-colors text-xs font-medium font-sans">
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* DESKTOP table */}
          <div className="hidden md:block bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rose-100 bg-rose-50/40">
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Réduction</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider hidden lg:table-cell">Expiration</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Utilisations</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Statut</th>
                    <th className="text-right px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {codes.map(promo => (
                    <motion.tr key={promo.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`hover:bg-rose-50/30 transition-colors ${
                        !promo.is_active || isExpired(promo.expires_at) ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-charcoal tracking-wider">{promo.code}</span>
                          <button onClick={() => copyCode(promo.id, promo.code)} className="text-warm-gray hover:text-sage-600 transition-colors" title="Copier">
                            {copiedId === promo.id ? <Check size={13} className="text-sage-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-sage-600 font-sans">
                          {promo.discount_type === 'percentage' ? `-${promo.discount_value}%` : `-${parseFloat(promo.discount_value).toFixed(2)} TND`}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs font-sans ${isExpired(promo.expires_at) ? 'text-rose-500 font-medium' : 'text-warm-gray'}`}>
                          {fmtDate(promo.expires_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-sans text-charcoal font-medium">
                            {promo.current_uses}
                            {promo.max_uses !== null && <span className="text-warm-gray font-normal">/{promo.max_uses}</span>}
                          </span>
                          {promo.max_uses !== null && (
                            <div className="w-16 h-1.5 rounded-full bg-rose-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-sage-500 transition-all"
                                style={{ width: `${Math.min(100, (promo.current_uses / promo.max_uses) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge promo={promo} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleToggle(promo)} aria-label="Toggle">
                            {promo.is_active
                              ? <ToggleRight size={22} className="text-emerald-500 hover:text-emerald-600 transition-colors" />
                              : <ToggleLeft size={22} className="text-warm-gray hover:text-charcoal transition-colors" />}
                          </button>
                          <button onClick={() => setDeleteConfirm(promo)}
                            className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
