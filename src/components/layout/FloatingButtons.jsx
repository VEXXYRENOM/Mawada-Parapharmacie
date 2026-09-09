import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'

const WhatsAppIcon = () => (
  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const MessengerIcon = () => (
  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
  </svg>
)

export default function FloatingButtons() {
  const [hoveredId, setHoveredId] = useState(null)
  const { t, isRTL } = useLanguage()
  const { isOpen: cartOpen } = useCart()
  const { settings } = useSettings()

  // Masquer quand le panier est ouvert pour éviter le chevauchement
  if (cartOpen) return null

  const buttons = [
    {
      id: 'whatsapp',
      href: `https://wa.me/${settings.whatsappNumber}`,
      label: t.floating.whatsapp_tooltip,
      bgClass: 'bg-[#25D366]',
      Icon: WhatsAppIcon,
      pulse: true,
    },
    {
      id: 'messenger',
      href: settings.messengerUrl || settings.facebookUrl,
      label: t.floating.messenger_tooltip,
      bgClass: 'bg-[#0084FF]',
      Icon: MessengerIcon,
      pulse: false,
    },
  ]

  return (
    <div
      className={`fixed bottom-6 z-40 flex flex-col gap-3 ${isRTL ? 'left-5' : 'right-5'}`}
      aria-label="Boutons de contact flottants"
    >
      {buttons.map(btn => (
        <div key={btn.id} className="relative flex items-center">
          {/* Tooltip */}
          <AnimatePresence>
            {hoveredId === btn.id && (
              <motion.div
                className={`absolute ${isRTL ? 'left-14' : 'right-14'} whitespace-nowrap bg-charcoal text-white text-xs font-sans font-medium py-1.5 px-3 rounded-full shadow-card`}
                initial={{ opacity: 0, x: isRTL ? -8 : 8, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: isRTL ? -8 : 8, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {btn.label}
                {/* Arrow */}
                <span
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? '-right-1.5' : '-left-1.5'} w-0 h-0`}
                  style={{
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    ...(isRTL
                      ? { borderLeft: '6px solid #2C2C2C' }
                      : { borderRight: '6px solid #2C2C2C' })
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.a
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={btn.label}
            className={`w-13 h-13 rounded-full ${btn.bgClass} text-white flex items-center justify-center shadow-lg ${btn.pulse ? 'whatsapp-pulse' : ''}`}
            style={{ width: 52, height: 52 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onHoverStart={() => setHoveredId(btn.id)}
            onHoverEnd={() => setHoveredId(null)}
          >
            <btn.Icon />
          </motion.a>
        </div>
      ))}
    </div>
  )
}
