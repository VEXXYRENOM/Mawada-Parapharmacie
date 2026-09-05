import { createContext, useContext, useState, useEffect } from 'react'
import translations from '../i18n/translations.json'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('fr')

  const t = translations[lang]
  const isRTL = lang === 'ar'

  useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
  }, [lang, isRTL])

  const toggleLang = () => setLang(prev => prev === 'fr' ? 'ar' : 'fr')

  return (
    <LanguageContext.Provider value={{ lang, t, isRTL, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
