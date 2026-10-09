export type Certificate = {
  id: string
  courseId?: string
  holderName?: string
  title: string
  description: string
  hours: number
  accent: 'blue' | 'green' | 'purple' | 'orange' | 'cyan'
} & (
  | { status: 'completed'; issuedAt: string; code: string; progress: 100 }
  | { status: 'in_progress'; issuedAt?: never; code?: never; progress: number; awaitingRelease?: boolean }
)

export type CertificateDownload = { certificateId: string; downloadedAt: string }
