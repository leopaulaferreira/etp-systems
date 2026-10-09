import type { Certificate } from '../../types/certificate'
import { formatCertificateDate } from './certificates.ts'

// Os literais usam WinAnsi com escapes octais: acentos em português e offsets
// do PDF permanecem corretos sem dependências ou serviços externos.
function pdfText(value: string) {
  return Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code > 126 && code <= 255) return `\\${code.toString(8).padStart(3, '0')}`
      if (code > 255) return '?'
      return /[()\\]/.test(char) ? `\\${char}` : char
    })
    .join('')
}

export function createCertificatePdf(item: Certificate, name: string): Blob {
  if (item.status !== 'completed') throw new Error('O certificado ainda não está disponível.')
  const titleLines = item.title.split(' ').reduce<string[]>((lines, word) => {
    const last = lines.length - 1
    if (last < 0 || `${lines[last]} ${word}`.length > 48) lines.push(word)
    else lines[last] += ` ${word}`
    return lines
  }, [])
  const text = (value: string, x: number, y: number, size: number, bold = false) =>
    `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`
  const stream = [
    '0.98 0.99 1 rg 0 0 842 595 re f',
    '0.15 0.39 0.92 RG 2 w 28 28 786 539 re S',
    '0.65 0.77 0.96 RG 0.5 w 35 35 772 525 re S',
    '0.10 0.20 0.40 rg',
    text('ETP Systems', 70, 502, 18, true),
    text('CERTIFICADO DE CONCLUSÃO', 70, 446, 28, true),
    text('Certificamos que', 70, 393, 14),
    text(name, 70, 354, 26, true),
    text('concluiu o curso', 70, 321, 14),
    ...titleLines.map((line, index) => text(line, 70, 284 - index * 29, 22, true)),
    text(
      `Carga horária: ${item.hours} horas   |   Concluído em: ${formatCertificateDate(item.issuedAt)}`,
      70,
      168,
      13,
    ),
    text(`Código de referência: ${item.code}`, 70, 137, 12),
    '0.40 0.45 0.55 rg',
    text('Emitido pelo ETP Systems.', 70, 78, 10),
  ].join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ]
  let document = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(document.length)
    document += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = document.length
  document += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`
  document += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')
  document += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new Blob([document], { type: 'application/pdf' })
}

export function downloadCertificate(item: Certificate, name: string) {
  const url = URL.createObjectURL(createCertificatePdf(item, name))
  const link = document.createElement('a')
  link.href = url
  link.download = `certificado-${item.id}.pdf`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
