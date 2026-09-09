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

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-rose-50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm">
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif text-lg text-charcoal mb-2">Aucune commande pour le moment</p>
              <p className="text-sm text-warm-gray font-sans">Les nouvelles commandes apparaîtront ici.</p>
            </div>
          ) : (
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
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-rose-50/30 transition-colors"
                      >
                        {/* Date */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium font-sans text-charcoal">{formatDate(order.created_at).split(' à ')[0]}</p>
                          <p className="text-xs text-warm-gray font-sans">{formatDate(order.created_at).split(' à ')[1]}</p>
                        </td>

                        {/* Client */}
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium font-sans text-charcoal">{order.customer_name || 'Client Anonyme'}</p>
                          <p className="text-xs text-warm-gray font-sans">{order.customer_phone}</p>
                        </td>

                        {/* Produit */}
                        <td className="px-4 py-4 max-w-[200px] truncate">
                          <p className="text-sm text-charcoal-light font-sans truncate" title={order.products?.name_fr || order.product_name}>
                            {order.products?.name_fr || order.product_name || 'Commande Générale'}
                          </p>
                          {order.message && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-warm-gray">
                              <MessageSquare size={12} /> Message joint
                            </div>
                          )}
                        </td>

                        {/* Statut avec select inline */}
                        <td className="px-4 py-4">
                          <div className="relative inline-block w-36">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
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

                        {/* Action Détails */}
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
          )}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-lg bg-white rounded-3xl shadow-card overflow-hidden"
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header Modal */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-rose-100 bg-rose-50/40">
                  <h3 className="font-serif text-xl text-charcoal">Détail de la commande</h3>
                  <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-warm-gray hover:text-charcoal shadow-sm transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Produit concerné */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8f6f3] border border-rose-100">
                    {selectedOrder.products?.image_url ? (
                      <img src={selectedOrder.products.image_url} alt="Produit" className="w-16 h-16 rounded-xl object-cover border border-white" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white border border-rose-100 flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-warm-gray font-sans mb-1 uppercase tracking-wider">Produit demandé</p>
                      <p className="text-sm font-semibold font-sans text-charcoal">
                        {selectedOrder.products?.name_fr || selectedOrder.product_name || 'Commande Générale'}
                      </p>
                    </div>
                  </div>

                  {/* Infos Client */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User size={14} className="text-rose-400" />
                        <span className="text-xs font-sans text-warm-gray">Client</span>
                      </div>
                      <p className="text-sm font-medium font-sans text-charcoal">{selectedOrder.customer_name || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone size={14} className="text-rose-400" />
                        <span className="text-xs font-sans text-warm-gray">Téléphone</span>
                      </div>
                      <p className="text-sm font-medium font-sans text-charcoal">{selectedOrder.customer_phone}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-rose-400" />
                        <span className="text-xs font-sans text-warm-gray">Date de commande</span>
                      </div>
                      <p className="text-sm font-medium font-sans text-charcoal">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={14} className="text-rose-400" />
                        <span className="text-xs font-sans text-warm-gray">Statut actuel</span>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium font-sans border ${STATUS_COLORS[selectedOrder.status]}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  {selectedOrder.message && (
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-blue-500" />
                        <span className="text-xs font-sans font-medium text-blue-800">Message du client</span>
                      </div>
                      <p className="text-sm font-sans text-charcoal italic">"{selectedOrder.message}"</p>
                    </div>
                  )}
                </div>

                {/* Footer Modal — Action WhatsApp */}
                <div className="px-6 py-5 border-t border-rose-100 flex gap-3">
                  <a
                    href={getWaLink(selectedOrder.customer_phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[#25D366] text-white font-medium font-sans text-sm hover:bg-[#1ebe5d] transition-colors shadow-soft"
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
