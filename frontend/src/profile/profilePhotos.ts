import rafaelPhoto from '../assets/avatars/rafael-martins.webp'
import rhPhoto from '../assets/avatars/rh-etp.webp'

// Fotos das contas de demonstração; o vínculo por e-mail permanece ao editar o nome.
export function profilePhoto(email?: string): string | undefined {
  switch (email?.trim().toLowerCase()) {
    case 'etp@gmail.com': return rafaelPhoto
    case 'rhetp@gmail.com': return rhPhoto
    default: return undefined
  }
}
