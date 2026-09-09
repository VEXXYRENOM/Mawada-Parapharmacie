import { useState, useEffect, useRef } from 'react'
import { X, Upload, ImageIcon, Loader2, ChevronDown, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { upsertProduct, uploadProductImage } from '../../lib/queries'

const CATEGORIES = [
  { id: 'Hair care',              label: 'Hair care' },
  { id: 'Complément Alimentaire', label: 'Complément Alimentaire' },
  { id: 'Nature & Bio',           label: 'Nature & Bio' },
  { id: 'Skin care',              label: 'Skin care' },
  { id: 'Body care',              label: 'Body care' },
  { id: 'Soin',                   label: 'Soin' },
  { id: 'Cosmétique',             label: 'Cosmétique' },
  { id: 'Beauty',                 label: 'Beauty' },
  { id: 'Bébé',                   label: 'Bébé' },
  { id: 'Dentaire',               label: 'Dentaire' },
  { id: 'Orthopédie',             label: 'Orthopédie' },
  { id: 'Santé',                  label: 'Santé' },
]

const EMPTY_FORM = {
  name_fr:        '',
  name_ar:        '',
  category:       'Skin care',
  brand:          '',
  price:          '',
  original_price: '',
  description_fr: '',
  description_ar: '',
  badge:          '',
  image_url:      '',
  is_active:      true,
  in_stock:       true,
}

export default function ProductFormModal({ isOpen, onClose, editProduct, onSuccess, onError }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileRef = useRef(null)

  const isEditing = !!editProduct

  // Remplir le formulaire si édition
  useEffect(() => {
    if (editProduct) {
      // Convertir explicitement les null de la DB en chaînes vides
      // pour éviter TypeError lors du .trim() dans handleSubmit
      setForm({
        name_fr:        editProduct.name_fr        ?? '',
        name_ar:        editProduct.name_ar        ?? '',
        category:       editProduct.category       ?? 'Skin care',
        brand:          editProduct.brand          ?? '',
        price:          editProduct.price?.toString()          ?? '',
        original_price: editProduct.original_price?.toString() ?? '',
        description_fr: editProduct.description_fr ?? '',
        description_ar: editProduct.description_ar ?? '',
        badge:          editProduct.badge          ?? '',
        image_url:      editProduct.image_url      ?? '',
        is_active:      editProduct.is_active      ?? true,
        in_stock:       editProduct.in_stock       ?? true,
      })
      setImagePreview(editProduct.image_url || null)
    } else {
      setForm(EMPTY_FORM)
      setImagePreview(null)
    }
    setImageFile(null)
  }, [editProduct, isOpen])

  function handleField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleImageSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name_fr.trim() || !form.price) {
      onError('Le nom (FR) et le prix sont requis.')
      return
    }

    setSubmitting(true)

    try {
      let imageUrl = form.image_url

      // Upload image si nouvelle
      if (imageFile) {
        setUploadingImage(true)
        const ext = imageFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${ext}`
        const uploaded = await uploadProductImage(imageFile, fileName)
        setUploadingImage(false)
        if (!uploaded) {
          onError('Erreur lors de l\'upload de l\'image. Le produit sera enregistré sans image.')
        } else {
          imageUrl = uploaded
        }
      }

      // Prix original : null si le toggle promo est désactivé
      const originalPriceVal = (form.original_price !== '' && form.original_price !== undefined)
        ? (parseFloat(form.original_price) || null)
        : null

      const payload = {
        ...(isEditing ? { id: editProduct.id } : {}),
        name_fr:        (form.name_fr        ?? '').trim(),
        name_ar:        (form.name_ar        ?? '').trim() || null,
        category:       form.category,
        brand:          (form.brand          ?? '').trim(),
        price:          parseFloat(form.price) || 0,
        original_price: originalPriceVal,
        description_fr: (form.description_fr ?? '').trim() || null,
        description_ar: (form.description_ar ?? '').trim() || null,
        badge:          (form.badge          ?? '').trim() || null,
        image_url:      imageUrl || null,
        is_active:      form.is_active,
        in_stock:       form.in_stock,
      }

      const { error } = await upsertProduct(payload)

      if (error) {
        console.error('[ProductForm] upsertProduct error:', error)
        // Erreur typique : colonne original_price manquante dans Supabase
        if (error.message?.includes('original_price') || error.code === '42703') {
          onError('Colonne "original_price" manquante. Exécutez la migration SQL dans Supabase d\'abord.')
        } else {
          onError(`Erreur : ${error.message ?? 'Réessayez.'}`)
        }
      } else {
        onSuccess(isEditing
          ? `"${form.name_fr}" modifié avec succès ✅`
          : `"${form.name_fr}" ajouté avec succès ✅`)
      }
    } catch (err) {
      console.error('[ProductForm] Exception inattendue:', err)
      onError('Une erreur inattendue est survenue. Réessayez.')
    } finally {
      // Garantit toujours la réinitialisation — même en cas d'exception réseau
      setSubmitting(false)
      setUploadingImage(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Mobile: full-screen sheet from bottom | Desktop: centered modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-center sm:p-4 sm:pt-8 overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-card sm:mb-6"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag handle (mobile only) */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-rose-200" aria-hidden="true" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100">
                <h2 className="font-serif text-lg text-charcoal">
                  {isEditing ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
                </h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-rose-100 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-5 pb-safe">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium font-sans text-charcoal mb-2">Image du produit</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative h-40 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-rose-300 mb-2" />
                        <p className="text-sm text-warm-gray font-sans">Cliquez pour choisir une image</p>
                        <p className="text-xs text-warm-gray/60 font-sans mt-1">JPG, PNG, WebP — max 5 Mo</p>
                      </>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-sage-600" />
                      </div>
                    )}
                    {imagePreview && (
                      <div className="absolute inset-0 bg-charcoal/0 hover:bg-charcoal/20 transition-all flex items-center justify-center">
                        <Upload size={24} className="text-white opacity-0 hover:opacity-100" />
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); handleField('image_url', '') }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-sans mt-2"
                    >
                      Supprimer l'image
                    </button>
                  )}
                </div>

                {/* Noms FR / AR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                      Nom (Français) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name_fr}
                      onChange={e => handleField('name_fr', e.target.value)}
                      required
                      placeholder="Ex: Sérum Vitamine C"
                      className="w-full h-10 px-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                      الاسم (العربي)
                    </label>
                    <input
                      type="text"
                      value={form.name_ar}
                      onChange={e => handleField('name_ar', e.target.value)}
                      placeholder="مثال: سيروم فيتامين سي"
                      dir="rtl"
                      className="w-full h-10 px-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
                    />
                  </div>
                </div>

                {/* Catégorie + Marque */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">Catégorie</label>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={e => handleField('category', e.target.value)}
                        className="w-full h-10 px-4 pr-8 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all appearance-none"
                      >
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">Marque</label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={e => handleField('brand', e.target.value)}
                      placeholder="Ex: Lumière Botanicals"
                      className="w-full h-10 px-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
                    />
                  </div>
                </div>

                {/* Prix + Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                      Prix actuel (TND) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => handleField('price', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Ex: 45.00"
                      className={`w-full h-10 px-4 border rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:ring-2 transition-all ${
                        form.original_price
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/40'
                          : 'border-rose-100 focus:border-sage-400 focus:ring-sage-100'
                      }`}
                    />
                    {form.original_price && (
                      <p className="text-[10px] text-rose-500 font-sans mt-1">↓ Prix après remise (affiché en rouge/gras)</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                      Badge <span className="text-warm-gray font-normal">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={form.badge}
                      onChange={e => handleField('badge', e.target.value)}
                      placeholder="Ex: Bestseller, Nouveauté..."
                      className="w-full h-10 px-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
                    />
                  </div>
                </div>

                {/* ── Bloc Promo ── */}
                <div className="rounded-2xl border border-rose-100 overflow-hidden">
                  {/* Toggle promo */}
                  <div className="flex items-center justify-between px-4 py-3 bg-rose-50/40">
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-rose-500" />
                      <div>
                        <p className="text-sm font-medium font-sans text-charcoal">Mettre en promotion</p>
                        <p className="text-xs text-warm-gray font-sans">Barrer l'ancien prix en rouge</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleField('original_price', form.original_price ? '' : form.price)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                        form.original_price ? 'bg-rose-500' : 'bg-warm-gray/30'
                      }`}
                      aria-label="Activer promotion"
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        form.original_price ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Champ prix original — visible seulement si promo activé */}
                  {form.original_price !== '' && form.original_price !== undefined && (
                    <div className="px-4 py-3 border-t border-rose-100 space-y-3">

                      {/* Instruction claire */}
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="text-amber-500 text-sm mt-0.5">&#9432;</span>
                        <p className="text-xs text-amber-700 font-sans leading-relaxed">
                          <strong>Comment ça marche :</strong><br />
                          ① Entrez l'<strong>ancien prix</strong> (plus élevé) dans «&nbsp;Prix barré&nbsp;»<br />
                          ② Mettez le <strong>nouveau prix réduit</strong> (plus bas) dans «&nbsp;Prix actuel&nbsp;»<br />
                          Ex : ancien = <strong>100 TND</strong>, nouveau = <strong>77 TND</strong> → „́100,00€​&nbsp;77 TND −23%“
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                          Prix barré (ancien prix, plus élevé) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={form.original_price}
                          onChange={e => handleField('original_price', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="Ex: 100.00"
                          className={`w-full h-10 px-4 border rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:ring-2 transition-all ${
                            form.original_price && form.price && parseFloat(form.original_price) <= parseFloat(form.price)
                              ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-100 bg-amber-50/30'
                              : 'border-rose-200 focus:border-rose-400 focus:ring-rose-100'
                          }`}
                        />

                        {/* Warning : original_price doit être > price */}
                        {form.original_price && form.price &&
                          parseFloat(form.original_price) <= parseFloat(form.price) && (
                          <p className="text-[11px] text-amber-600 font-sans mt-1.5 flex items-center gap-1">
                            ⚠️ Le prix barré ({parseFloat(form.original_price).toFixed(2)} TND) doit être
                            <strong> supérieur</strong> au prix actuel ({parseFloat(form.price).toFixed(2)} TND).
                          </p>
                        )}
                      </div>

                      {/* Preview promo — seulement si logique correcte */}
                      {form.price && form.original_price && parseFloat(form.original_price) > parseFloat(form.price) && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-rose-100">
                          <span className="text-xs text-warm-gray font-sans">Aperçu client :</span>
                          <span className="text-sm text-rose-400 line-through font-sans">
                            {parseFloat(form.original_price).toFixed(2)} TND
                          </span>
                          <span className="text-sm font-bold text-rose-600 font-sans">
                            {parseFloat(form.price).toFixed(2)} TND
                          </span>
                          <span className="ml-auto text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-sans font-bold">
                            -{Math.round((1 - parseFloat(form.price) / parseFloat(form.original_price)) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description FR */}
                <div>
                  <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">Description (Français)</label>
                  <textarea
                    value={form.description_fr}
                    onChange={e => handleField('description_fr', e.target.value)}
                    rows={3}
                    placeholder="Description du produit en français..."
                    className="w-full px-4 py-3 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all resize-none"
                  />
                </div>

                {/* Description AR */}
                <div>
                  <label className="block text-sm font-medium font-sans text-charcoal mb-1.5">وصف المنتج (العربي)</label>
                  <textarea
                    value={form.description_ar}
                    onChange={e => handleField('description_ar', e.target.value)}
                    rows={3}
                    dir="rtl"
                    placeholder="وصف المنتج بالعربية..."
                    className="w-full px-4 py-3 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all resize-none"
                  />
                </div>

                {/* Actif / Inactif */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50/40 border border-rose-100">
                    <div>
                      <p className="text-sm font-medium font-sans text-charcoal">Visible sur le site</p>
                      <p className="text-xs text-warm-gray font-sans mt-0.5">
                        {form.is_active ? 'Le produit est affiché dans la boutique' : 'Le produit est masqué de la boutique'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleField('is_active', !form.is_active)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form.is_active ? 'bg-sage-600' : 'bg-warm-gray/30'}`}
                      aria-label="Activer/désactiver visibilité"
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* En Stock / Rupture */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-sage-50/40 border border-sage-100">
                    <div>
                      <p className="text-sm font-medium font-sans text-charcoal">En stock (Disponibilité)</p>
                      <p className="text-xs text-warm-gray font-sans mt-0.5">
                        {form.in_stock ? 'Les clients peuvent ajouter au panier' : 'Affiche "Rupture de stock" et active "M\'alerter"'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleField('in_stock', !form.in_stock)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form.in_stock ? 'bg-emerald-500' : 'bg-amber-400'}`}
                      aria-label="Activer/désactiver stock"
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${form.in_stock ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2 pb-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-12 sm:h-12 rounded-xl border border-rose-100 text-charcoal font-medium font-sans text-sm hover:bg-rose-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="flex-1 h-12 sm:h-12 rounded-xl bg-sage-600 text-white font-medium font-sans text-sm hover:bg-sage-700 transition-colors shadow-soft disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Ajouter le produit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
