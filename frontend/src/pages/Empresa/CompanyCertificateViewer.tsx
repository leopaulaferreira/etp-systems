import { useId, useState } from 'react'
import { Download, ZoomIn } from 'lucide-react'
import type { Certificate } from '../../types/certificate'
import CertificatePreview from '../Certificados/components/CertificatePreview'
import { downloadCertificate } from '../Certificados/certificatePdf'
import { formatCertificateDate } from '../Certificados/certificates'

export default function CompanyCertificateViewer({ certificate }: { certificate: Certificate }) {
  const [zoom, setZoom] = useState('fit')
  const [error, setError] = useState('')
  const zoomId = useId()
  const documentId = useId()

  function download() {
    try {
      downloadCertificate(certificate, certificate.holderName!)
      setError('')
    } catch {
      setError('Não foi possível baixar o certificado. Tente novamente.')
    }
  }

  return <>
    <div className="min-w-0 shrink-0"><p className="text-sm font-bold text-ink-900">{certificate.holderName}</p><p className="mt-0.5 text-xs text-ink-500">{certificate.title}</p></div>
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2"><label htmlFor={zoomId} className="sr-only"><ZoomIn className="h-4 w-4" aria-hidden="true" />Ampliação</label><select id={zoomId} value={zoom} onChange={event => setZoom(event.target.value)} aria-controls={documentId} className="min-h-11 rounded-xl border border-ink-200 bg-panel-alt px-2 text-xs text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><option value="fit">Ajustar à tela</option><option value="100">100%</option><option value="150">150%</option><option value="200">200%</option></select></div>
      <button type="button" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-3 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400" onClick={download}><Download className="h-4 w-4" aria-hidden="true" />Baixar PDF</button>
    </div>
    {error && <p role="alert" className="shrink-0 text-xs text-rose-400">{error}</p>}
    <div id={documentId} role="region" aria-label="Visualização do certificado" tabIndex={0} className="min-h-0 min-w-0 max-w-full flex-1 overflow-auto rounded-lg bg-ink-100/40 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 sm:p-3">
      <div className={zoom === 'fit' ? 'h-full w-full' : 'mx-auto'} style={zoom === 'fit' ? undefined : { width: `${842 * Number(zoom) / 100}px` }}><CertificatePreview item={certificate} fit={zoom === 'fit'} /></div>
    </div>
    {zoom !== 'fit' && <p className="shrink-0 text-[10px] text-ink-500">Role a área do documento para ver todos os detalhes ou selecione “Ajustar à tela”.</p>}
    <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 border-t border-ink-200 pt-2 text-[10px] text-ink-500"><span>Carga horária: {certificate.hours} horas</span><span>Emissão: {formatCertificateDate(certificate.issuedAt!)}</span><span className="w-full break-all">Código: {certificate.code}</span></div>
  </>
}
