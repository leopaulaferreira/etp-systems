import { CalendarDays, Clock3, Download, Fingerprint } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Certificate } from '../../../types/certificate'
import { formatCertificateDate } from '../certificates'
import CertificatePreview from './CertificatePreview'

export const certificateButton =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 py-2.5 text-xs font-bold text-brand-blue-400 transition-colors hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'

export function CertificateBadge({ item }: { item: Certificate }) {
  return (
    <span
      className={`inline-flex self-start rounded-md px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${item.status === 'completed' ? 'bg-brand-blue-500/15 text-brand-blue-400' : 'bg-emerald-400/15 text-emerald-300'}`}
    >
      {item.status === 'completed' ? 'Concluído' : item.awaitingRelease ? 'Aguardando liberação' : 'Em andamento'}
    </span>
  )
}

export default function CertificateDetails({
  item,
  onDownload,
  onOpen,
}: {
  item: Certificate
  onDownload: (item: Certificate) => void
  onOpen?: (item: Certificate) => void
}) {
  return (
    <div className="grid min-w-0 items-center gap-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <CertificatePreview item={item} />
      <div className="flex min-w-0 flex-col gap-3">
        <CertificateBadge item={item} />
        <h3 className="text-lg font-extrabold leading-snug text-ink-900">{item.title}</h3>
        <p className="text-xs leading-5 text-ink-500">{item.description}</p>
        <div className="flex flex-col gap-2.5 py-1 text-xs text-ink-500">
          {item.issuedAt && (
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
              Emitido em {formatCertificateDate(item.issuedAt)}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Carga horária: {item.hours} horas
          </p>
          {item.code && (
            <p className="flex items-center gap-2 break-all">
              <Fingerprint className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Código: {item.code}</span>
            </p>
          )}
        </div>
        {item.status === 'completed' ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => onDownload(item)} className={certificateButton}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Baixar PDF
            </button>
            {onOpen && (
              <button
                type="button"
                onClick={() => onOpen(item)}
                className={`${certificateButton} border-brand-blue-700 bg-brand-blue-700 text-white hover:bg-brand-blue-600`}
              >
                Ver certificado
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs leading-5 text-ink-500">
              {item.awaitingRelease
                ? 'Avaliação aprovada. O certificado ficará disponível após a liberação do curso.'
                : `Progresso: ${item.progress}%. O certificado fica disponível após aprovação e liberação do curso.`}
            </p>
            <progress
              value={item.progress}
              max={100}
              aria-label={`Progresso de ${item.title}`}
              className="h-1.5 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-emerald-400 [&::-webkit-progress-bar]:bg-ink-100 [&::-webkit-progress-value]:bg-emerald-400"
            />
            <Link to="/meus-cursos" className={certificateButton}>
              Acessar Meus Cursos
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
