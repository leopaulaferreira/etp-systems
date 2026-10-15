import { useState } from 'react'
import { profilePhoto } from '../../profile/profilePhotos'

/** Foto da conta, com iniciais quando não houver imagem disponível. */
type AvatarProps = {
  name: string
  email?: string
  className?: string
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

export default function Avatar({ name, email, className = '' }: AvatarProps) {
  const src = profilePhoto(email)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  return (
    <div
      role="img"
      aria-label={name}
      className={`flex shrink-0 overflow-hidden items-center justify-center rounded-full bg-gradient-to-br from-brand-blue-600 to-brand-cyan-500 text-sm font-semibold text-white ${className}`}
    >
      {src && failedSrc !== src ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailedSrc(src)} />
      ) : getInitials(name)}
    </div>
  )
}
