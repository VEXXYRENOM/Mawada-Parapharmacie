import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { createPortal } from 'react-dom'

// ─────────────────────────────────────────
// Toast Component
// ─────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg max-w-sm border ${
            type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-800'
              : 'bg-white border-rose-200 text-rose-800'
          }`}
          role="alert"
          aria-live="assertive"
        >
          {type === 'success'
            ? <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            : <XCircle size={20} className="text-rose-500 shrink-0" />
          }
          <p className="text-sm font-sans font-medium flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-warm-gray hover:text-charcoal transition-colors ml-2"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─────────────────────────────────────────
// useToast Hook
// ─────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState(null) // { message, type }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    // Auto-dismiss
    setTimeout(() => setToast(null), 3500)
  }

  function clearToast() {
    setToast(null)
  }

  return { toast, showToast, clearToast }
}
