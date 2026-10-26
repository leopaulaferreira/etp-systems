import rafaelPhoto from '../assets/avatars/rafael-martins.webp'
import rhPhoto from '../assets/avatars/rh-etp.webp'

import anaPhoto from '../assets/avatars/ana-souza.webp'
import brunoPhoto from '../assets/avatars/bruno-lima.webp'
import carlaPhoto from '../assets/avatars/carla-mendes.webp'
import diegoPhoto from '../assets/avatars/diego-alves.webp'
import fernandaPhoto from '../assets/avatars/fernanda-oliveira.webp'
import gabrielPhoto from '../assets/avatars/gabriel-santos.webp'
import helenaPhoto from '../assets/avatars/helena-ribeiro.webp'
import joaoPhoto from '../assets/avatars/joao-silva.webp'

// Fotos das contas de demonstração; o vínculo por e-mail permanece ao editar o nome.
// Os oito retratos de @etp.example são fictícios, gerados por IA e armazenados localmente.
export function profilePhoto(email?: string): string | undefined {
  switch (email?.trim().toLowerCase()) {
    case 'etp@gmail.com': return rafaelPhoto
    case 'rhetp@gmail.com': return rhPhoto
    case 'ana.souza@etp.example': return anaPhoto
    case 'bruno.lima@etp.example': return brunoPhoto
    case 'carla.mendes@etp.example': return carlaPhoto
    case 'diego.alves@etp.example': return diegoPhoto
    case 'fernanda.oliveira@etp.example': return fernandaPhoto
    case 'gabriel.santos@etp.example': return gabrielPhoto
    case 'helena.ribeiro@etp.example': return helenaPhoto
    case 'joao.silva@etp.example': return joaoPhoto
    default: return undefined
  }
}
