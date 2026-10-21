import type { Certificate } from '../../types/certificate'
import { certificateArtwork } from './certificateArtwork.ts'

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
  const color = (hex: string) => [1, 3, 5].map(index => (parseInt(hex.slice(index, index + 2), 16) / 255).toFixed(4)).join(' ')
  const fonts = { regular: 'F1', bold: 'F2', serif: 'F3', mono: 'F4' }
  const stream = certificateArtwork(item, name).map(mark => {
    switch (mark.kind) {
      case 'rect': return `${color(mark.color)} rg ${mark.x} ${595 - mark.y - mark.height} ${mark.width} ${mark.height} re f`
      case 'line': return `${color(mark.color)} RG ${mark.weight} w ${mark.x} ${595 - mark.y} m ${mark.endX} ${595 - mark.endY} l S`
      case 'text': return `${color(mark.color)} rg BT /${fonts[mark.font]} ${mark.size} Tf ${mark.x} ${595 - mark.y} Td (${pdfText(mark.value)}) Tj ET`
      case 'circle': {
        const { x, radius: r } = mark
        const y = 595 - mark.y
        const k = r * 0.55228475
        return `${color(mark.color)} RG ${mark.weight} w ${x + r} ${y} m `
          + `${x + r} ${y + k} ${x + k} ${y + r} ${x} ${y + r} c `
          + `${x - k} ${y + r} ${x - r} ${y + k} ${x - r} ${y} c `
          + `${x - r} ${y - k} ${x - k} ${y - r} ${x} ${y - r} c `
          + `${x + k} ${y - r} ${x + r} ${y - k} ${x + r} ${y} c S`
      }
    }
  }).join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R /F4 8 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>',
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
