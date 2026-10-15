import { useEffect, useId, useState } from 'react'
import { Download, Eye } from 'lucide-react'
import type { Certificate } from '../../../types/certificate'
import { fetchCertificates } from '../../Certificados/certificatesApi'
import { downloadCertificate } from '../../Certificados/certificatePdf'
import CertificateDetails, { certificateButton } from '../../Certificados/components/CertificateDetails'

type Result =
  | { status: 'loading' | 'missing' | 'error' }
  | { status: 'ready'; certificate: Certificate }

export default function AssessmentCertificateResult({ courseId }: { courseId: string }) {
  const [result, setResult] = useState<Result>({ status: 'loading' })
  const [request, setRequest] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [downloadError, setDownloadError] = useState(false)
  const previewId = useId()

  useEffect(() => {
    const controller = new AbortController()
    fetchCertificates(controller.signal).then((certificates) => {
      if (controller.signal.aborted) return
      const certificate = certificates.find((item) => item.courseId === courseId)
      setResult(certificate ? { status: 'ready', certificate } : { status: 'missing' })
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ status: 'error' })
    })
    return () => controller.abort()
  }, [courseId, request])

  function download(certificate: Certificate) {
    try {
      setDownloadError(false)
      downloadCertificate(certificate, certificate.holderName!)
    } catch {
      setDownloadError(true)
    }
  }

  return (
    <section aria-label="Certificado da avaliação" className="rounded-2xl border border-ink-200 bg-panel-alt p-4 sm:p-5">
      <p role="status" className="text-sm font-bold leading-6 text-ink-900">
        {result.status === 'loading' && 'Consultando seu certificado…'}
        {result.status === 'ready' && 'Seu certificado está disponível!'}
        {result.status === 'missing' && 'Sua aprovação foi registrada. O certificado deste curso ainda não está disponível.'}
        {result.status === 'error' && 'Sua aprovação foi registrada, mas não foi possível consultar o certificado agora.'}
      </p>
      {result.status === 'ready' && (
        <>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="button" className={`${certificateButton} min-h-11`} aria-expanded={expanded} aria-controls={previewId} onClick={() => setExpanded(!expanded)}>
              <Eye className="h-4 w-4" aria-hidden="true" />
              {expanded ? 'Ocultar certificado' : 'Ver certificado'}
            </button>
            <button type="button" className={`${certificateButton} min-h-11`} onClick={() => download(result.certificate)}>
              <Download className="h-4 w-4" aria-hidden="true" /> Baixar PDF
            </button>
          </div>
          {expanded && <div id={previewId} className="mt-5 border-t border-ink-200 pt-5">
            <CertificateDetails item={result.certificate} onDownload={download} />
          </div>}
          {downloadError && <p role="alert" className="mt-3 text-sm text-rose-400">Não foi possível baixar o PDF. Tente novamente.</p>}
        </>
      )}
      {(result.status === 'error' || result.status === 'missing') && (
        <button type="button" className={`${certificateButton} mt-3 min-h-11`} onClick={() => {
          setResult({ status: 'loading' })
          setRequest((value) => value + 1)
        }}>Consultar novamente</button>
      )}
    </section>
  )
}
