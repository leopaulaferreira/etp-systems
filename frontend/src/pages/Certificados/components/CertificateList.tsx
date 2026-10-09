import { Award, Download, Search, SlidersHorizontal } from 'lucide-react'
import type { Certificate } from '../../../types/certificate'
import { formatCertificateDate, type CertificateFilters } from '../certificates'
import { CertificateBadge, certificateButton } from './CertificateDetails'
import CertificatePreview from './CertificatePreview'

const selectClass =
  'min-h-10 min-w-0 rounded-xl border border-ink-200 bg-panel-alt px-3 py-2 text-xs font-semibold text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'

type Props = {
  items: Certificate[]
  filters: CertificateFilters
  years: string[]
  onChange: (update: Partial<CertificateFilters>) => void
  onReset: () => void
  onOpen: (item: Certificate) => void
  onDownload: (item: Certificate) => void
}

export function CertificateToolbar({
  filters,
  years,
  onChange,
  onReset,
}: Pick<Props, 'filters' | 'years' | 'onChange' | 'onReset'>) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-[20px] border border-ink-200/70 bg-panel p-4 shadow-card">
      <label className="flex min-w-0 basis-full items-center gap-2 rounded-xl border border-ink-200 bg-panel-alt px-3 focus-within:ring-2 focus-within:ring-brand-blue-400 xl:basis-auto xl:flex-1">
        <Search className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
        <input
          type="search"
          aria-label="Buscar certificados"
          placeholder="Buscar certificado..."
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          className="min-h-10 min-w-0 w-full bg-transparent text-xs text-ink-900 outline-none placeholder:text-ink-500"
        />
      </label>
      <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-[11px] font-semibold text-ink-500 sm:flex-none">
        Status
        <select
          value={filters.status}
          onChange={(event) =>
            onChange({ status: event.target.value as CertificateFilters['status'] })
          }
          className={selectClass}
        >
          <option value="all">Todos os status</option>
          <option value="completed">Concluídos</option>
          <option value="in_progress">Em andamento</option>
        </select>
      </label>
      <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-[11px] font-semibold text-ink-500 sm:flex-none">
        Data de emissão
        <select
          value={filters.year}
          onChange={(event) => onChange({ year: event.target.value })}
          className={selectClass}
        >
          <option value="all">Todos os períodos</option>
          {years.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>
      </label>
      <button type="button" onClick={onReset} className={certificateButton}>
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        Limpar filtros
      </button>
    </div>
  )
}

export default function CertificateList({
  items,
  filters,
  onChange,
  onReset,
  onOpen,
  onDownload,
}: Omit<Props, 'years'>) {
  return (
    <section
      id="certificate-list"
      tabIndex={-1}
      aria-labelledby="certificate-list-title"
      className="min-w-0 rounded-[22px] border border-ink-200/70 bg-panel p-4 shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2
            id="certificate-list-title"
            className="text-lg font-extrabold tracking-tight text-ink-900"
          >
            Todos os certificados
          </h2>
          <span role="status" className="text-xs text-ink-500">
            {items.length} {items.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
        <label className="flex items-center gap-2 text-[11px] text-ink-500">
          Ordenar por
          <select
            value={filters.order}
            onChange={(event) =>
              onChange({ order: event.target.value as CertificateFilters['order'] })
            }
            className={selectClass}
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="title">Nome do curso</option>
          </select>
        </label>
      </div>
      {items.length ? (
        <ul className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-ink-200/60 bg-panel-alt/40 p-3 transition-colors hover:border-brand-blue-500/40"
            >
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
              >
                <span className="hidden w-24 shrink-0 sm:block">
                  <CertificatePreview item={item} compact />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <CertificateBadge item={item} />
                  <span className="text-xs font-bold leading-5 text-ink-900">{item.title}</span>
                  <span className="text-[11px] leading-5 text-ink-500">
                    {item.status === 'completed'
                      ? `Emitido em ${formatCertificateDate(item.issuedAt)}`
                      : item.awaitingRelease ? 'Aguardando liberação' : `Progresso ${item.progress}%`}{' '}
                    · {item.hours} horas
                  </span>
                  {item.status === 'in_progress' && (
                    <progress
                      value={item.progress}
                      max={100}
                      aria-label={`Progresso de ${item.title}`}
                      className="h-1 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-emerald-400 [&::-webkit-progress-bar]:bg-ink-100 [&::-webkit-progress-value]:bg-emerald-400"
                    />
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDownload(item)}
                disabled={item.status !== 'completed'}
                aria-label={`Baixar certificado de ${item.title}`}
                title={
                  item.status === 'completed'
                    ? 'Baixar PDF'
                    : 'Disponível após aprovação e liberação do curso'
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 text-ink-500 hover:bg-brand-blue-500/10 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Award className="h-10 w-10 text-ink-400" aria-hidden="true" />
          <h3 className="text-sm font-bold text-ink-900">Nenhum certificado encontrado</h3>
          <p className="max-w-sm text-xs leading-5 text-ink-500">
            Certificados emitidos aparecem aqui. Ajuste a busca ou os filtros, ou conclua uma avaliação disponível.
          </p>
          <button type="button" onClick={onReset} className={certificateButton}>
            Limpar filtros
          </button>
        </div>
      )}
    </section>
  )
}
