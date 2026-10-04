import { useState } from 'react'
import { certificates, initialDownloads } from '../../mocks/certificados.mock'
import { useProfile } from '../../profile/ProfileContext'
import type { Certificate } from '../../types/certificate'
import {
  certificateSummary,
  formatCertificateDate,
  initialFilters,
  selectCertificates,
  type CertificateFilters,
} from './certificates'
import { downloadCertificate } from './certificatePdf'
import CertificateAchievements from './components/CertificateAchievements'
import CertificateDetails from './components/CertificateDetails'
import CertificateDialog from './components/CertificateDialog'
import CertificateList, { CertificateToolbar } from './components/CertificateList'
import CertificateStats from './components/CertificateStats'
import CertificatesHero from './components/CertificatesHero'

const summary = certificateSummary(certificates)
const featured = selectCertificates(certificates, { ...initialFilters, status: 'completed' })[0]
const years = [
  ...new Set(certificates.flatMap((item) => (item.issuedAt ? [item.issuedAt.slice(0, 4)] : []))),
]
  .sort()
  .reverse()

export default function CertificadosPage() {
  const { profile } = useProfile()
  const [filters, setFilters] = useState(initialFilters)
  const [selected, setSelected] = useState<Certificate | null>(null)
  const [panel, setPanel] = useState<'hours' | 'history' | null>(null)
  const [downloads, setDownloads] = useState(initialDownloads)
  const [announcement, setAnnouncement] = useState('')
  const filtered = selectCertificates(certificates, filters)

  function updateFilters(update: Partial<CertificateFilters>) {
    setFilters((current) => ({ ...current, ...update }))
  }

  function download(item: Certificate) {
    if (item.status !== 'completed') return
    try {
      downloadCertificate(item, profile.name)
      setDownloads((current) => [
        ...current,
        { certificateId: item.id, downloadedAt: new Date().toISOString() },
      ])
      setAnnouncement(`Download solicitado: ${item.title}.`)
    } catch {
      setAnnouncement('Não foi possível gerar o PDF. Tente novamente.')
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <CertificatesHero />
      <CertificateStats
        summary={summary}
        downloads={downloads.length}
        onSelect={(action) => {
          if (action === 'hours' || action === 'history') setPanel(action)
          else {
            setFilters({ ...initialFilters, status: action })
            const list = document.getElementById('certificate-list')
            list?.focus({ preventScroll: true })
            list?.scrollIntoView({ block: 'start' })
          }
        }}
      />
      <CertificateToolbar
        filters={filters}
        years={years}
        onChange={updateFilters}
        onReset={() => setFilters(initialFilters)}
      />
      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {featured && (
          <section className="flex min-w-0 flex-col gap-5 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
            <h2 className="text-lg font-extrabold tracking-tight text-ink-900">
              Certificado em destaque
            </h2>
            <div className="flex flex-1 flex-col justify-center">
              <CertificateDetails item={featured} onDownload={download} onOpen={setSelected} />
            </div>
          </section>
        )}
        <CertificateAchievements completed={summary.completed} />
      </div>
      <CertificateList
        items={filtered}
        filters={filters}
        onChange={updateFilters}
        onReset={() => setFilters(initialFilters)}
        onOpen={setSelected}
        onDownload={download}
      />
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {selected && (
        <CertificateDialog
          title={selected.status === 'completed' ? 'Seu certificado' : 'Certificado em andamento'}
          onClose={() => setSelected(null)}
        >
          <CertificateDetails item={selected} onDownload={download} />
          <p className="text-xs leading-5 text-ink-500">
            Prévia demonstrativa. A emissão e a verificação de certificados serão disponibilizadas
            com a integração à plataforma.
          </p>
          <p role="status" className="text-xs text-brand-blue-400">
            {announcement}
          </p>
        </CertificateDialog>
      )}
      {panel && (
        <CertificateDialog
          title={panel === 'hours' ? 'Horas certificadas' : 'Histórico de downloads'}
          onClose={() => setPanel(null)}
        >
          <p className="text-sm text-ink-500">
            {panel === 'hours'
              ? `${summary.hours} horas de aprendizado em ${summary.completed} cursos concluídos.`
              : `${downloads.length} downloads solicitados. Os registros iniciais são demonstrativos.`}
          </p>
          <ul className="divide-y divide-ink-100">
            {panel === 'hours'
              ? certificates
                  .filter((item) => item.status === 'completed')
                  .map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <span>{item.title}</span>
                      <span className="shrink-0 font-bold text-brand-blue-400">{item.hours}h</span>
                    </li>
                  ))
              : [...downloads]
                  .sort((a, b) => b.downloadedAt.localeCompare(a.downloadedAt))
                  .map((entry, index) => (
                    <li
                      key={`${entry.certificateId}-${entry.downloadedAt}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"
                    >
                      <span className="font-semibold">
                        {certificates.find((item) => item.id === entry.certificateId)?.title}
                      </span>
                      <time dateTime={entry.downloadedAt} className="text-ink-500">
                        {formatCertificateDate(entry.downloadedAt)} ·{' '}
                        {new Date(entry.downloadedAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'UTC',
                        })}{' '}
                        UTC
                      </time>
                    </li>
                  ))}
          </ul>
        </CertificateDialog>
      )}
    </div>
  )
}
