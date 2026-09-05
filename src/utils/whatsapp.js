const WHATSAPP_NUMBER = '21623104341'
const FACEBOOK_PAGE = 'https://www.facebook.com/profile.php?id=100063516752985'
const MESSENGER_URL = 'https://m.me/MawadaParapharmacie'

export function buildWhatsAppUrl(productText, lang = 'fr') {
  const message = lang === 'ar'
    ? `مرحباً، أرغب في طلب: ${productText}`
    : `Bonjour, je souhaite commander : ${productText}`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppContactUrl(name, phone, message, lang = 'fr') {
  const text = lang === 'ar'
    ? `مرحباً، اسمي ${name}، رقمي ${phone}.\n${message}`
    : `Bonjour, je m'appelle ${name}, mon téléphone est ${phone}.\n${message}`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

export { FACEBOOK_PAGE, MESSENGER_URL, WHATSAPP_NUMBER }
