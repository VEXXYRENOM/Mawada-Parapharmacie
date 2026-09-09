export function buildWhatsAppUrl(productText, whatsappNumber, lang = 'fr') {
  const message = lang === 'ar'
    ? `مرحباً، أرغب في طلب: ${productText}`
    : `Bonjour, je souhaite commander : ${productText}`
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

export function buildCartWhatsAppUrl(items, whatsappNumber, lang = 'fr') {
  if (!items || items.length === 0) return '#'
  const greeting = lang === 'ar'
    ? 'مرحباً، أرغب في طلب:\n'
    : 'Bonjour, je souhaite commander :\n'
  const lines = items.map(i => `- ${i.name} x${i.qty}`).join('\n')
  const closing = lang === 'ar'
    ? '\nشكراً، أرجو تأكيد التوفر.'
    : '\nMerci de me confirmer la disponibilité.'
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(greeting + lines + closing)}`
}

export function buildWhatsAppContactUrl(name, phone, message, whatsappNumber, lang = 'fr') {
  const text = lang === 'ar'
    ? `مرحباً، اسمي ${name}، رقمي ${phone}.\n${message}`
    : `Bonjour, je m'appelle ${name}, mon téléphone est ${phone}.\n${message}`
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
}
