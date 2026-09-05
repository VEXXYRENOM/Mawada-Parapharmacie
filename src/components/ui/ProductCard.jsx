import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { buildWhatsAppUrl } from '../../utils/whatsapp'

export default function ProductCard({ product }) {
  const { lang, t, isRTL } = useLanguage()
  const name = lang === 'ar' ? product.nameAr : product.name

  return (
    <motion.article
      className="group relative bg-white rounded-2xl shadow-card overflow-hidden flex flex-col border border-rose-50 hover:border-rose-200 transition-colors duration-300"
      whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(196, 116, 122, 0.18)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Badge */}
      {product.badge && (
        <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-10`}>
          <span className="inline-block px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-medium font-sans tracking-wide">
            {product.badge}
          </span>
        </div>
      )}

      {/* Image */}
      <Link to={`/produit/${product.id}`} className="block overflow-hidden relative" aria-label={`Voir ${name}`}>
        <div className="h-52 overflow-hidden">
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            loading="lazy"
          />
        </div>
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300 flex items-center justify-center">
          <motion.div
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-charcoal text-xs font-medium font-sans"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            animate={{}}
            style={{ opacity: 0 }}
            whileInView={{}}
          >
            <Eye size={13} />
            {t.products.view_details}
          </motion.div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <span className="text-[10px] uppercase tracking-widest text-warm-gray font-sans mb-1.5">
          {product.brand}
        </span>

        {/* Name */}
        <Link to={`/produit/${product.id}`}>
          <h3 className="font-serif text-base text-charcoal font-semibold leading-snug mb-2 group-hover:text-sage-600 transition-colors duration-200 line-clamp-2">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <p className="font-sans text-lg font-semibold text-sage-600 mt-auto mb-3">
          {product.price.toFixed(2)} <span className="text-xs font-normal text-warm-gray">TND</span>
        </p>

        {/* CTA */}
        <a
          href={buildWhatsAppUrl(product.whatsappText, lang)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-medium font-sans hover:bg-[#1ebe5d] transition-colors duration-300"
          aria-label={`Commander ${name} via WhatsApp`}
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {t.products.order_whatsapp}
        </a>
      </div>
    </motion.article>
  )
}
