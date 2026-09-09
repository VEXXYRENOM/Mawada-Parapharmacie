import { useState, useEffect, useRef } from 'react'
import { X, Upload, ImageIcon, Loader2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { upsertProduct, uploadProductImage } from '../../lib/queries'

const CATEGORIES = [
  { id: 'complements-enfants', label: 'Compléments Enfants' },
  { id: 'soins-visage',        label: 'Soins Visage' },
  { id: 'soins-corps',         label: 'Soins Corps' },
  { id: 'cosmetique',          label: 'Cosmétique' },
  { id: 'bebe',                label: 'Bébé' },
]

const EMPTY_FORM = {
  name_fr:        '',
  name_ar:        '',
  category:       'soins-visage',
  brand:          '',
  price:          '',
  description_fr: '',
  description_ar: '',
  badge:          '',
  image_url:      '',
  is_active:      true,
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
      setForm({
        ...EMPTY_FORM,
        ...editProduct,
        price: editProduct.price?.toString() ?? '',
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

    const payload = {
      ...(isEditing ? { id: editProduct.id } : {}),
      name_fr:        form.name_fr.trim(),
      name_ar:        form.name_ar.trim() || null,
      category:       form.category,
      brand:          form.brand.trim(),
      price:          parseFloat(form.price) || 0,
      description_fr: form.description_fr.trim() || null,
      description_ar: form.description_ar.trim() || null,
      badge:          form.badge.trim() || null,
      image_url:      imageUrl || null,
      is_active:      form.is_active,
    }

    const { error } = await upsertProduct(payload)
    setSubmitting(false)

    if (error) {
      onError('Une erreur est survenue. Réessayez.')
    } else {
      onSuccess(isEditing ? `"${form.name_fr}" modifié avec succès ✅` : `"${form.name_fr}" ajouté avec succès ✅`)
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
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl bg-white rounded-3xl shadow-card mb-6"
              initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-rose-100">
                <h2 className="font-serif text-xl text-charcoal">
                  {isEditing ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
                </h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-rose-100 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
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
                      Prix (TND) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => handleField('price', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Ex: 45.00"
                      className="w-full h-10 px-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
                    />
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
                    aria-label="Activer/désactiver"
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-xl border border-rose-100 text-charcoal font-medium font-sans text-sm hover:bg-rose-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="flex-1 h-12 rounded-xl bg-sage-600 text-white font-medium font-sans text-sm hover:bg-sage-700 transition-colors shadow-soft disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? 'Enregistrement...' : isEditing ? 'Enregistrer les modifications' : 'Ajouter le produit'}
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
