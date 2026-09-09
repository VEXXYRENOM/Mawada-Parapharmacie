import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Clock, XCircle, ChevronDown, MessageSquare, Phone, User, Calendar, ExternalLink, X } from 'lucide-react'
import { getAllOrders, updateOrderStatus } from '../../lib/queries'
import { Toast, useToast } from '../../components/admin/Toast'

const STATUS_COLORS = {
  nouveau: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  traité:  'bg-sage-100 text-sage-700 border-sage-200',
  annulé:  'bg-rose-100 text-rose-700 border-rose-200',
}

const STATUS_ICONS = {
  nouveau: Clock,
  traité:  CheckCircle2,
  annulé:  XCircle,
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { toast, showToast, clearToast } = useToast()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const data = await getAllOrders()
    setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await updateOrderStatus(orderId, newStatus)
    if (error) {
      showToast('Erreur lors de la mise à jour du statut', 'error')
    } else {
      showToast('Statut mis à jour avec succès', 'success')
      // Mise à jour locale pour éviter un refetch complet
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }))
      }
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString))
  }

  // Créer un lien wa.me pré-rempli
  const getWaLink = (phone) => {
    // Nettoyer le numéro (enlever espaces, +, etc.)
    const cleanPhone = phone.replace(/\D/g, '')
    // Si c'est un numéro tunisien (ex: 23104341) sans indicatif, on l'ajoute
    const finalPhone = cleanPhone.length === 8 ? `216${cleanPhone}` : cleanPhone
    return `https://wa.me/${finalPhone}`
  }

  const counts = {
    nouveau: orders.filter(o => o.status === 'nouveau').length,
    traité:  orders.filter(o => o.status === 'traité').length,
    annulé:  orders.filter(o => o.status === 'annulé').length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal">📋 Commandes</h1>
        <p className="text-sm text-warm-gray font-sans mt-1">Historique des commandes reçues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Nouvelles', count: counts.nouveau, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Traitées',  count: counts.traité,  color: 'text-sage-600',    bg: 'bg-sage-50' },
          { label: 'Annulées',  count: counts.annulé,  color: 'text-rose-600',    bg: 'bg-rose-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex items-center justify-between">
            <p className="font-sans font-medium text-charcoal">{stat.label}</p>
            <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
              <span className={`font-serif text-lg font-bold ${stat.color}`}>{stat.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Mobile cards / Desktop table ─── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-rose-50 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 py-16 text-center shadow-sm">
          <p className="font-serif text-lg text-charcoal mb-2">Aucune commande pour le moment</p>
          <p className="text-sm text-warm-gray font-sans">Les nouvelles commandes apparaîtront ici.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-3">
            {orders.map(order => {
              const StatusIcon = STATUS_ICONS[order.status]
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden"
                >
                  <div className="p-4 space-y-2">
                    {/* Top row: date + status badge */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium font-sans text-charcoal">{formatDate(order.created_at).split(' à ')[0]}</p>
                        <p className="text-[10px] text-warm-gray font-sans">{formatDate(order.created_at).split(' à ')[1]}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium font-sans ${STATUS_COLORS[order.status]}`}>
                        <StatusIcon size={11} />
                        {order.status}
                      </span>
                    </div>

                    {/* Client */}
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-rose-400 shrink-0" />
                      <span className="text-sm font-sans text-charcoal font-medium">{order.customer_name || 'Client Anonyme'}</span>
                      <span className="text-xs text-warm-gray font-sans">·</span>
                      <span className="text-xs text-warm-gray font-sans">{order.customer_phone}</span>
                    </div>

                    {/* Product */}
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-charcoal-light font-sans line-clamp-1">
                        📦 {order.products?.name_fr || order.product_name || 'Commande Générale'}
                      </p>
                      {order.total_price && (
                        <p className="text-xs font-semibold text-sage-600">{Number(order.total_price).toFixed(2)} TND</p>
                      )}
                    </div>
                  </div>

                  {/* Bottom bar: status change + details */}
                  <div className="flex items-center border-t border-rose-50 divide-x divide-rose-50">
                    <div className="flex-1 relative px-3">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className={`w-full h-11 appearance-none bg-transparent text-xs font-medium font-sans focus:outline-none cursor-pointer ${STATUS_COLORS[order.status].split(' ').find(c => c.startsWith('text-'))}`}
                      >
                        <option value="nouveau">Nouveau</option>
                        <option value="traité">Traité</option>
                        <option value="annulé">Annulé</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-warm-gray" />
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-11 text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium font-sans"
                    >
                      <ExternalLink size={13} /> Détails
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rose-100 bg-rose-50/40">
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Produit</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Statut</th>
                    <th className="text-right px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {orders.map(order => {
                    const StatusIcon = STATUS_ICONS[order.status]
                    return (
                      <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-rose-50/30 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium font-sans text-charcoal">{formatDate(order.created_at).split(' à ')[0]}</p>
                          <p className="text-xs text-warm-gray font-sans">{formatDate(order.created_at).split(' à ')[1]}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium font-sans text-charcoal">{order.customer_name || 'Client Anonyme'}</p>
                          <p className="text-xs text-warm-gray font-sans">{order.customer_phone}</p>
                        </td>
                        <td className="px-4 py-4 max-w-[200px] truncate">
                          <p className="text-sm text-charcoal-light font-sans truncate" title={order.products?.name_fr || order.product_name}>
                            {order.products?.name_fr || order.product_name || 'Commande Générale'}
                          </p>
                          {order.total_price && (
                            <p className="text-xs font-semibold text-sage-600 mt-0.5">{Number(order.total_price).toFixed(2)} TND</p>
                          )}
                          {order.message && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-warm-gray">
                              <MessageSquare size={12} /> Message joint
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="relative inline-block w-36">
                            <select
                              value={order.status}
                              onChange={e => handleStatusChange(order.id, e.target.value)}
                              className={`w-full appearance-none px-3 py-1.5 pl-8 rounded-full border text-xs font-medium font-sans focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer transition-colors ${STATUS_COLORS[order.status]}`}
                            >
                              <option value="nouveau">Nouveau</option>
                              <option value="traité">Traité</option>
                              <option value="annulé">Annulé</option>
                            </select>
                            <StatusIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-medium font-sans transition-colors"
                          >
                            <ExternalLink size={14} /> Voir
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Order Details Modal — Full screen on mobile, centered on desktop */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-card overflow-hidden max-h-[92vh] overflow-y-auto"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Drag handle (mobile) */}
                <div className="sm:hidden flex justify-center pt-3">
                  <div className="w-10 h-1 rounded-full bg-rose-200" />
                </div>

                {/* Header Modal */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100 bg-rose-50/40">
                  <h3 className="font-serif text-lg text-charcoal">Détail de la commande</h3>
                  <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-warm-gray hover:text-charcoal shadow-sm transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Produit concerné ou Panier */}
                  {selectedOrder.cart_items && selectedOrder.cart_items.length > 0 ? (
                    <div className="space-y-3 p-4 rounded-2xl bg-[#f8f6f3] border border-rose-100">
                      <p className="text-xs text-warm-gray font-sans uppercase tracking-wider">Produits commandés ({selectedOrder.cart_items.length})</p>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {selectedOrder.cart_items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-rose-100 shadow-sm">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-rose-50" />
                            ) : (
                              <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-300">📦</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-charcoal truncate" title={item.name}>{item.name}</p>
                              <p className="text-[11px] text-warm-gray mt-0.5">{item.qty} x {Number(item.price).toFixed(2)} TND</p>
                            </div>
                            <p className="text-sm font-semibold text-sage-600 shrink-0">{(item.qty * item.price).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-rose-100/60 mt-2">
                        <span className="text-sm font-sans text-charcoal font-medium">Total de la commande</span>
                        <span className="text-lg font-bold text-charcoal">{Number(selectedOrder.total_price).toFixed(2)} TND</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8f6f3] border border-rose-100">
                      {selectedOrder.products?.image_url ? (
                        <img src={selectedOrder.products.image_url} alt="Produit" className="w-14 h-14 rounded-xl object-cover border border-white" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white border border-rose-100 flex items-center justify-center"><span className="text-2xl">📦</span></div>
                      )}
                      <div>
                        <p className="text-xs text-warm-gray font-sans mb-1 uppercase tracking-wider">Produit demandé</p>
                        <p className="text-sm font-semibold font-sans text-charcoal">
                          {selectedOrder.products?.name_fr || selectedOrder.product_name || 'Commande Générale'}
                        </p>
                        {selectedOrder.total_price && (
                          <p className="text-xs font-bold text-sage-600 mt-1">{Number(selectedOrder.total_price).toFixed(2)} TND</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Infos Client — empilées sur mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-rose-50/30 border border-rose-100">
                      <div className="flex items-center gap-2 mb-1"><User size={13} className="text-rose-400" /><span className="text-xs font-sans text-warm-gray">Client</span></div>
                      <p className="text-sm font-medium font-sans text-charcoal">{selectedOrder.customer_name || 'Non renseigné'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/30 border border-rose-100">
                      <div className="flex items-center gap-2 mb-1"><Phone size={13} className="text-rose-400" /><span className="text-xs font-sans text-warm-gray">Téléphone</span></div>
                      <p className="text-sm font-medium font-sans text-charcoal">{selectedOrder.customer_phone}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/30 border border-rose-100">
                      <div className="flex items-center gap-2 mb-1"><Calendar size={13} className="text-rose-400" /><span className="text-xs font-sans text-warm-gray">Date</span></div>
                      <p className="text-sm font-medium font-sans text-charcoal">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/30 border border-rose-100">
                      <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={13} className="text-rose-400" /><span className="text-xs font-sans text-warm-gray">Statut</span></div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border ${STATUS_COLORS[selectedOrder.status]}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  {/* Changer statut dans le modal */}
                  <div>
                    <p className="text-xs font-sans text-warm-gray mb-2">Changer le statut :</p>
                    <div className="flex gap-2 flex-wrap">
                      {['nouveau', 'traité', 'annulé'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(selectedOrder.id, s)}
                          className={`flex-1 min-w-[80px] h-10 rounded-xl border text-xs font-medium font-sans transition-all ${
                            selectedOrder.status === s
                              ? STATUS_COLORS[s] + ' ring-2 ring-offset-1'
                              : 'border-rose-100 text-charcoal hover:bg-rose-50'
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  {selectedOrder.message && (
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2"><MessageSquare size={13} className="text-blue-500" /><span className="text-xs font-sans font-medium text-blue-800">Message du client</span></div>
                      <p className="text-sm font-sans text-charcoal italic">"{selectedOrder.message}"</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-rose-100">
                  <a
                    href={getWaLink(selectedOrder.customer_phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#25D366] text-white font-medium font-sans text-sm hover:bg-[#1ebe5d] transition-colors shadow-soft"
                  >
                    <Phone size={16} /> Contacter sur WhatsApp
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
