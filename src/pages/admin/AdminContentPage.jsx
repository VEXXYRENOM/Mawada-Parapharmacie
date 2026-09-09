import { useState, useEffect, useCallback } from 'react'
import { Save, Loader2, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSiteContent, saveSiteContent } from '../../lib/queries'
import { Toast, useToast } from '../../components/admin/Toast'

// Configuration des champs de contenu modifiables
const CONTENT_FIELDS = [
  {
    section: 'Accueil - En-tête (Héro)',
    fields: [
      { key: 'hero_title', label: 'Titre principal (Ligne 1)', type: 'text', placeholder: 'Soin.' },
      { key: 'hero_title2', label: 'Titre principal (Ligne 2)', type: 'text', placeholder: 'Confiance.' },
      { key: 'hero_title3', label: 'Titre principal (Ligne 3)', type: 'text', placeholder: 'Féminité.' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Des produits de santé et de beauté authentiques...' },
    ]
  },
  {
    section: 'À Propos - Notre Histoire',
    fields: [
      { key: 'about_story', label: 'Paragraphe 1', type: 'textarea', placeholder: 'Mawada Parapharmacie est née d\'une passion...' },
      { key: 'about_story2', label: 'Paragraphe 2', type: 'textarea', placeholder: 'Nous sélectionnons rigoureusement...' },
    ]
  },
  {
    section: 'Avis Clients - Témoignages',
    fields: [
      { key: 'testimonial_1_name', label: 'Témoignage 1 - Nom', type: 'text', placeholder: 'Fatma Ben Ali' },
      { key: 'testimonial_1_text', label: 'Témoignage 1 - Avis', type: 'textarea', placeholder: 'Je commande régulièrement...' },
      { key: 'testimonial_2_name', label: 'Témoignage 2 - Nom', type: 'text', placeholder: 'Salma Trabelsi' },
      { key: 'testimonial_2_text', label: 'Témoignage 2 - Avis', type: 'textarea', placeholder: 'Le sérum vitamine C a transformé ma peau...' },
      { key: 'testimonial_3_name', label: 'Témoignage 3 - Nom', type: 'text', placeholder: 'Meriem Jlassi' },
      { key: 'testimonial_3_text', label: 'Témoignage 3 - Avis', type: 'textarea', placeholder: 'La crème pour bébé est absolument parfaite...' },
    ]
  },
  {
    section: 'Paramètres Généraux & Réseaux',
    fields: [
      { key: 'whatsapp_number', label: 'Numéro WhatsApp', type: 'text', placeholder: '21623104341' },
      { key: 'facebook_url', label: 'Lien Page Facebook', type: 'text', placeholder: 'https://www.facebook.com/...' },
      { key: 'messenger_url', label: 'Lien Messenger', type: 'text', placeholder: 'https://m.me/...' },
      { key: 'pixel_id', label: 'ID Facebook Pixel (Optionnel)', type: 'text', placeholder: '123456789012345' },
    ]
  }
]

export default function AdminContentPage() {
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast, showToast, clearToast } = useToast()

  const fetchContent = useCallback(async () => {
    setLoading(true)
    const data = await getSiteContent()
    // Convertir objet { key: { value_fr, value_ar } } en { key: value_fr }
    const contentMap = {}
    Object.entries(data).forEach(([k, v]) => {
      contentMap[k] = v.value_fr || ''
    })
    setContent(contentMap)
    setLoading(false)
  }, [])

  useEffect(() => { fetchContent() }, [fetchContent])

  const handleFieldChange = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Préparer les données pour upsert global
      const rows = Object.entries(content)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => ({ key, value_fr: value }))

      await saveSiteContent(rows)
      showToast('Contenu mis à jour avec succès ✅', 'success')
    } catch (error) {
      console.error(error)
      showToast('Erreur lors de la sauvegarde du contenu.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-sage-400" />
          <p className="text-sm text-warm-gray font-sans">Chargement du contenu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal">✏️ Contenu du site</h1>
          <p className="text-sm text-warm-gray font-sans mt-1">Personnalisez les textes de votre site (Français uniquement pour le moment)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchContent}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-100 text-charcoal font-medium font-sans text-sm hover:bg-rose-50 transition-colors bg-white shadow-sm"
          >
            <RefreshCw size={16} /> Rafraîchir
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-600 text-white font-medium font-sans text-sm hover:bg-sage-700 transition-colors shadow-soft disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Enregistrement...' : 'Enregistrer tout'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {CONTENT_FIELDS.map((section, idx) => (
          <motion.div
            key={section.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm"
          >
            <div className="bg-rose-50/40 px-6 py-4 border-b border-rose-100">
              <h2 className="font-serif text-lg text-charcoal">{section.section}</h2>
            </div>
            <div className="p-6 space-y-5">
              {section.fields.map(field => (
                <div key={field.key} className="max-w-3xl">
                  <label htmlFor={field.key} className="block text-sm font-medium font-sans text-charcoal mb-1.5">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.key}
                      value={content[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full px-4 py-3 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all resize-y min-h-[100px]"
                    />
                  ) : (
                    <input
                      type="text"
                      id={field.key}
                      value={content[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full h-11 px-4 border border-rose-100 rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
                    />
                  )}
                  <p className="text-xs text-warm-gray font-sans mt-1.5">Identifiant interne : <code className="bg-rose-50 px-1 py-0.5 rounded text-rose-500">{field.key}</code></p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Floating save button on mobile */}
        <div className="sm:hidden fixed bottom-6 left-6 right-6 z-40">
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-sage-600 text-white font-medium font-sans text-base hover:bg-sage-700 shadow-xl disabled:opacity-60"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Enregistrement...' : 'Enregistrer tout'}
          </button>
        </div>
      </form>
    </div>
  )
}
