import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-rose-500 text-white hover:bg-rose-600 shadow-soft hover:shadow-md',
  secondary: 'bg-white text-rose-500 border border-rose-300 hover:bg-rose-50',
  gold: 'bg-gold-400 text-charcoal hover:bg-gold-500 shadow-gold',
  ghost: 'text-charcoal hover:text-rose-500 hover:bg-rose-50',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-md',
  messenger: 'bg-[#0084FF] text-white hover:bg-[#006ecc] shadow-md',
}

const sizes = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-sm gap-2',
  lg: 'px-8 py-4 text-base gap-2.5',
  xl: 'px-10 py-5 text-base gap-3',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconRight,
  disabled,
  onClick,
  href,
  target,
  ...props
}) {
  const base = `
    inline-flex items-center justify-center font-sans font-medium
    rounded-full transition-all duration-300 ease-out
    focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    cursor-pointer select-none
  `

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={cls}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        {Icon && !iconRight && <Icon size={size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 20 : 16} />}
        {children}
        {Icon && iconRight && <Icon size={size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 20 : 16} />}
      </motion.a>
    )
  }

  return (
    <motion.button
      className={cls}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      {...props}
    >
      {Icon && !iconRight && <Icon size={size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 20 : 16} />}
      {children}
      {Icon && iconRight && <Icon size={size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 20 : 16} />}
    </motion.button>
  )
}
