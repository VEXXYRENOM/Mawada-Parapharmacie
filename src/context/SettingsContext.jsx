import { createContext, useContext, useState, useEffect } from 'react'
import { getSiteContent } from '../lib/queries'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    whatsappNumber: '21623104341',
    facebookUrl: 'https://www.facebook.com/profile.php?id=100063516752985',
    messengerUrl: 'https://m.me/MawadaParapharmacie',
    pixelId: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      try {
        const content = await getSiteContent()
        setSettings({
          whatsappNumber: content.whatsapp_number?.value_fr || '21623104341',
          facebookUrl: content.facebook_url?.value_fr || 'https://www.facebook.com/profile.php?id=100063516752985',
          messengerUrl: content.messenger_url?.value_fr || 'https://m.me/MawadaParapharmacie',
          pixelId: content.pixel_id?.value_fr || '',
        })
      } catch (err) {
        console.error('Error loading settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
