/**
 * PhoneNumber — composant réutilisable pour afficher un numéro de téléphone
 * dans un contexte RTL sans que le navigateur l'inverse (bug Bidi).
 *
 * Usage:
 *   <PhoneNumber value="+216 23 104 341" />
 *   <PhoneNumber value="+216 23 104 341" className="text-sm text-white" />
 */
export default function PhoneNumber({ value = '+216 23 104 341', className = '', tag: Tag = 'span' }) {
  return (
    <Tag
      dir="ltr"
      style={{ unicodeBidi: 'plaintext', display: 'inline-block' }}
      className={className}
    >
      {value}
    </Tag>
  )
}

/**
 * Wrapper pour <a href="tel:..."> avec protection Bidi intégrée.
 */
export function PhoneLink({ value = '+216 23 104 341', href = 'tel:+21623104341', className = '' }) {
  return (
    <a
      href={href}
      dir="ltr"
      style={{ unicodeBidi: 'plaintext', display: 'inline-block' }}
      className={className}
    >
      {value}
    </a>
  )
}
