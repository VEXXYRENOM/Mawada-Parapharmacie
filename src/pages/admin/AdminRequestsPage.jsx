import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Search, Bell, CheckCircle, Mail, Phone, Loader2 } from 'lucide-react'
import { getAllProductRequests, updateProductRequestStatus, deleteProductRequest } from '../../lib/queries'

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'nouveau' | 'contacté'

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    const data = await getAllProductRequests()
    setRequests(data)
    setLoading(false)
  }

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await updateProductRequestStatus(id, newStatus)
    if (!error) {
      setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: newStatus } : r))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette demande ?')) return
    const { error } = await deleteProductRequest(id)
    if (!error) {
      setRequests(reqs => reqs.filter(r => r.id !== id))
    }
  }

  const filteredRequests = requests.filter(r => {
    const matchSearch = r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.customer_contact.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif text-charcoal font-semibold">Demandes de produits</h1>
          <p className="text-sm text-warm-gray mt-1 font-sans">
            Gérez les alertes de disponibilité et les produits recherchés par les clients.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-rose-50 overflow-hidden mb-6">
        <div className="p-4 border-b border-rose-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" size={18} />
            <input
              type="text"
              placeholder="Rechercher par nom, produit, contact..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-sage-50/50 border border-sage-100 rounded-xl text-sm font-sans focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-colors"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 bg-sage-50/50 border border-sage-100 rounded-xl text-sm font-sans focus:outline-none focus:border-sage-300"
          >
            <option value="all">Tous les statuts</option>
            <option value="nouveau">Nouveaux</option>
            <option value="contacté">Contactés</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-sage-50/50 text-sage-600 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Produit recherché</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              <AnimatePresence>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map(req => (
                    <motion.tr
                      key={req.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-rose-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-charcoal">{req.customer_name}</div>
                        <div className="text-sm text-warm-gray flex items-center gap-1 mt-1">
                          {req.customer_contact.includes('@') ? <Mail size={12} /> : <Phone size={12} />}
                          {req.customer_contact}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-sage-400" />
                          <span className="font-medium text-charcoal">{req.product_name}</span>
                        </div>
                        <div className="text-xs text-warm-gray mt-1">
                          {new Date(req.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          req.status === 'nouveau' 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {req.status === 'nouveau' ? <Bell size={12} /> : <CheckCircle size={12} />}
                          {req.status === 'nouveau' ? 'Nouveau' : 'Contacté'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={req.status}
                          onChange={e => handleStatusChange(req.id, e.target.value)}
                          className="mr-3 text-sm bg-transparent border border-sage-200 rounded-lg px-2 py-1 focus:outline-none focus:border-sage-400"
                        >
                          <option value="nouveau">Nouveau</option>
                          <option value="contacté">Contacté</option>
                        </select>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="text-rose-400 hover:text-rose-600 text-sm transition-colors"
                        >
                          Supprimer
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-warm-gray">
                      Aucune demande trouvée.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
