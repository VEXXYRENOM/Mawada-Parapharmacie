import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllProducts, deleteProduct, upsertProduct } from '../../lib/queries'
import { Toast, useToast } from '../../components/admin/Toast'
import ProductFormModal from '../../components/admin/ProductFormModal'

// Toutes les catégories réelles du magasin (ordre d'affichage)
const ALL_CATEGORIES = [
  'Hair care',
  'Complément Alimentaire',
  'Nature & Bio',
  'Skin care',
  'Body care',
  'Soin',
  'Cosmétique',
  'Beauty',
  'Bébé',
  'Dentaire',
  'Orthopédie',
  'Santé',
]

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // product to delete
  const { toast, showToast, clearToast } = useToast()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const data = await getAllProducts()
    setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Catégories fixes (toutes les 12) — indépendantes des produits existants
  const categories = ['all', ...ALL_CATEGORIES]

  // Filtrage
  const filtered = products.filter(p => {
    const matchCat = filterCat === 'all' || p.category === filterCat
    const term = search.toLowerCase()
    const matchSearch = !term ||
      (p.name_fr ?? '').toLowerCase().includes(term) ||
      (p.brand ?? '').toLowerCase().includes(term)
    return matchCat && matchSearch
  })

  // Toggle actif/inactif
  async function handleToggleActive(product) {
    const { error } = await upsertProduct({ ...product, is_active: !product.is_active })
    if (error) {
      showToast('Erreur lors de la mise à jour. Réessayez.', 'error')
    } else {
      showToast(
        product.is_active
          ? `"${product.name_fr}" masqué du site.`
          : `"${product.name_fr}" visible sur le site. ✅`,
        'success'
      )
      await fetchProducts()
    }
  }

  // Suppression
  async function handleDelete(product) {
    const { error } = await deleteProduct(product.id)
    if (error) {
      showToast('Erreur lors de la suppression. Réessayez.', 'error')
    } else {
      showToast(`"${product.name_fr}" supprimé définitivement. ✅`, 'success')
      setDeleteConfirm(null)
      await fetchProducts()
    }
  }

  // Succès form
  async function handleFormSuccess(message) {
    setModalOpen(false)
    setEditingProduct(null)
    showToast(message, 'success')
    await fetchProducts()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-sm bg-white rounded-3xl shadow-card p-6"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              >
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-rose-500" />
                </div>
                <h3 className="font-serif text-lg text-charcoal text-center mb-2">Confirmer la suppression</h3>
                <p className="text-sm text-warm-gray font-sans text-center mb-6">
                  Voulez-vous vraiment supprimer <strong>"{deleteConfirm.name_fr}"</strong> ?<br />
                  <span className="text-rose-500">Cette action est irréversible.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 h-11 rounded-xl border border-rose-100 text-charcoal font-medium font-sans text-sm hover:bg-rose-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 h-11 rounded-xl bg-rose-500 text-white font-medium font-sans text-sm hover:bg-rose-600 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProduct(null) }}
        editProduct={editingProduct}
        onSuccess={handleFormSuccess}
        onError={(msg) => showToast(msg, 'error')}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal">📦 Produits</h1>
          <p className="text-sm text-warm-gray font-sans mt-1">{products.length} produit{products.length > 1 ? 's' : ''} au total</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-600 text-white font-medium font-sans text-sm hover:bg-sage-700 transition-colors shadow-soft"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Ajouter un produit</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou marque..."
            className="w-full h-10 pl-10 pr-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="w-full sm:w-auto h-10 pl-4 pr-8 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all bg-white appearance-none cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {ALL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" />
        </div>
      </div>

      {/* ─── Mobile: Card list ─── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-xl border border-rose-50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 py-16 text-center shadow-sm">
          <p className="font-serif text-lg text-charcoal mb-2">Aucun produit trouvé</p>
          <p className="text-sm text-warm-gray font-sans">Modifiez vos filtres ou ajoutez un nouveau produit.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS — visible on < md */}
          <div className="md:hidden space-y-3">
            {filtered.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden ${!product.is_active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3 p-3">
                  {/* Image */}
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name_fr}
                      className="w-16 h-16 rounded-xl object-cover border border-rose-100 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-rose-50 border border-rose-100 shrink-0 flex items-center justify-center text-2xl">📦</div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-sans text-charcoal line-clamp-2 leading-snug">{product.name_fr}</p>
                    <p className="text-xs text-warm-gray font-sans mt-0.5">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {product.original_price && product.original_price > product.price ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-sans font-bold">
                            -{Math.round((1 - product.price / product.original_price) * 100)}%
                          </span>
                          <span className="text-xs text-rose-400 line-through font-sans">{product.original_price?.toFixed(2)} TND</span>
                          <span className="text-sm font-bold font-sans text-rose-600">{product.price?.toFixed(2)} TND</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold font-sans text-sage-600">{product.price?.toFixed(2)} TND</span>
                      )}
                      <span className="text-[10px] font-sans text-warm-gray bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">{product.category}</span>
                      {product.badge && (
                        <span className="text-[10px] font-sans text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">{product.badge}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom bar: status toggle + actions */}
                <div className="flex items-center border-t border-rose-50 divide-x divide-rose-50">
                  {/* Toggle visible */}
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="flex-1 flex items-center justify-center gap-2 h-11 text-sm font-sans transition-colors"
                    aria-label={product.is_active ? 'Masquer' : 'Afficher'}
                  >
                    {product.is_active
                      ? <><ToggleRight size={20} className="text-emerald-500" /><span className="text-emerald-600 text-xs">Visible</span></>
                      : <><ToggleLeft size={20} className="text-warm-gray" /><span className="text-warm-gray text-xs">Masqué</span></>
                    }
                  </button>
                  {/* Edit */}
                  <button
                    onClick={() => { setEditingProduct(product); setModalOpen(true) }}
                    className="flex-1 flex items-center justify-center gap-1.5 h-11 text-sage-600 hover:bg-sage-50 transition-colors text-xs font-medium font-sans"
                    aria-label={`Modifier ${product.name_fr}`}
                  >
                    <Pencil size={15} /> Modifier
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirm(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-11 text-rose-500 hover:bg-rose-50 transition-colors text-xs font-medium font-sans"
                    aria-label={`Supprimer ${product.name_fr}`}
                  >
                    <Trash2 size={15} /> Supprimer
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* DESKTOP TABLE — hidden on < md */}
          <div className="hidden md:block bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rose-100 bg-rose-50/40">
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Produit</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider hidden lg:table-cell">Catégorie</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Prix</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider hidden lg:table-cell">Badge</th>
                    <th className="text-left px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Statut</th>
                    <th className="text-right px-4 py-3 text-xs font-medium font-sans text-warm-gray uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {filtered.map(product => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-rose-50/30 transition-colors ${!product.is_active ? 'opacity-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name_fr}
                              className="w-10 h-10 rounded-xl object-cover border border-rose-100 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 shrink-0 flex items-center justify-center text-rose-300 text-xs">?</div>
                          )}
                          <div>
                            <p className="text-sm font-medium font-sans text-charcoal line-clamp-1">{product.name_fr}</p>
                            <p className="text-xs text-warm-gray font-sans">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs font-sans text-warm-gray bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">{product.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        {product.original_price && product.original_price > product.price ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-sans font-bold">
                                -{Math.round((1 - product.price / product.original_price) * 100)}%
                              </span>
                              <span className="text-xs text-rose-400 line-through font-sans">{product.original_price?.toFixed(2)} TND</span>
                            </div>
                            <span className="text-sm font-bold font-sans text-rose-600">{product.price?.toFixed(2)} TND</span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold font-sans text-sage-600">{product.price?.toFixed(2)} TND</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {product.badge ? (
                          <span className="text-xs font-sans text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">{product.badge}</span>
                        ) : <span className="text-xs text-warm-gray font-sans">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleActive(product)} className="flex items-center gap-2 group" aria-label={product.is_active ? 'Masquer' : 'Afficher'}>
                          {product.is_active
                            ? <ToggleRight size={22} className="text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                            : <ToggleLeft size={22} className="text-warm-gray group-hover:text-charcoal transition-colors" />
                          }
                          <span className={`text-xs font-sans ${product.is_active ? 'text-emerald-600' : 'text-warm-gray'}`}>
                            {product.is_active ? 'Visible' : 'Masqué'}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditingProduct(product); setModalOpen(true) }}
                            className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center text-sage-600 hover:bg-sage-100 transition-colors"
                            aria-label={`Modifier ${product.name_fr}`}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(product)}
                            className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors"
                            aria-label={`Supprimer ${product.name_fr}`}>
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

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-warm-gray font-sans mt-3">
          {filtered.length} produit{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
