import { useState, useEffect, useCallback } from 'react'
import { getSiteContent } from '../lib/queries'

// Cache module-level pour éviter de refetch à chaque mount de composant
let cachedContent = null
let fetchPromise = null

/**
 * Hook qui charge les textes éditables depuis site_content une seule fois.
 * Retourne une fonction getContent(key, fallback) qui renvoie la valeur
 * dans la langue courante, ou le fallback si la clé est manquante.
 */
export function useSiteContent(lang = 'fr') {
  const [content, setContent] = useState(cachedContent)
  const [loading, setLoading] = useState(!cachedContent)

  useEffect(() => {
    if (cachedContent) {
      setContent(cachedContent)
      setLoading(false)
      return
    }

    // Éviter les fetch parallèles
    if (!fetchPromise) {
      fetchPromise = getSiteContent().then(data => {
        cachedContent = data
        fetchPromise = null
        return data
      })
    }

    fetchPromise.then(data => {
      setContent(data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const getContent = useCallback(
    (key, fallback = '') => {
      if (!content) return fallback
      const entry = content[key]
      if (!entry) return fallback
      if (lang === 'ar' && entry.value_ar) return entry.value_ar
      return entry.value_fr || fallback
    },
    [content, lang]
  )

  return { getContent, loading, raw: content }
}

/**
 * Invalide le cache (utile après une sauvegarde depuis le panneau admin)
 */
export function invalidateSiteContentCache() {
  cachedContent = null
  fetchPromise = null
}
