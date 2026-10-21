import type { Certificate } from '../../types/certificate'
import { formatCertificateDate } from './certificates.ts'

export type CertificateMark =
  | { kind: 'rect'; x: number; y: number; width: number; height: number; color: string }
  | { kind: 'line'; x: number; y: number; endX: number; endY: number; color: string; weight: number }
  | { kind: 'circle'; x: number; y: number; radius: number; color: string; weight: number }
  | { kind: 'text'; x: number; y: number; value: string; size: number; font: 'regular' | 'bold' | 'serif' | 'mono'; color: string }

// Coordenadas em pontos, em A4 paisagem. Tela e PDF usam a mesma composição.
export const certificateSize = { width: 842, height: 595 }
const ink = '#142D3D'
const muted = '#53636A'
const gold = '#A8874C'

function estimatedWidth(value: string, size: number) {
  return Array.from(value).reduce((sum, char) => sum + (
    /[MW@%]/.test(char) ? 1 : /[ilI.,:;'!| ]/.test(char) ? 0.32 : /[A-ZÀ-Ý]/.test(char) ? 0.75 : 0.62
  ), 0) * size
}

// Quebra inclusive palavras longas e reduz a fonte até caber no espaço reservado.
export function fitCertificateText(value: string, width: number, initialSize: number, maxLines: number) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  let size = initialSize
  for (;;) {
    const lines: string[] = []
    let line = ''
    for (const word of normalized.split(' ')) {
      const candidate = line ? `${line} ${word}` : word
      if (estimatedWidth(candidate, size) <= width) { line = candidate; continue }
      if (line) lines.push(line)
      line = ''
      for (const char of word) {
        if (line && estimatedWidth(line + char, size) > width) { lines.push(line); line = '' }
        line += char
      }
    }
    if (line) lines.push(line)
    if (lines.length <= maxLines || size <= 1) return { lines, size }
    size -= 0.5
  }
}

export function certificateArtwork(item: Certificate, name: string): CertificateMark[] {
  const marks: CertificateMark[] = []
  const rect = (x: number, y: number, width: number, height: number, color: string) => marks.push({ kind: 'rect', x, y, width, height, color })
  const line = (x: number, y: number, endX: number, endY: number, color = gold, weight = 0.7) => marks.push({ kind: 'line', x, y, endX, endY, color, weight })
  const text = (value: string, x: number, y: number, size = 10, font: 'regular' | 'bold' | 'serif' | 'mono' = 'regular', color = ink) => marks.push({ kind: 'text', value, x, y, size, font, color })
  rect(0, 0, 842, 595, '#FAF8F2')
  rect(0, 0, 14, 595, ink)
  rect(14, 0, 3, 595, gold)
  // Linhas geométricas leves evocam as conexões da marca, sem textura rasterizada.
  for (let i = 0; i < 7; i++) line(620 + i * 24, 0, 842, 222 - i * 24, '#E8E4D9', 0.6)
  line(39, 25, 817, 25, '#DCD4C2')
  line(817, 25, 817, 570, '#DCD4C2')
  line(39, 570, 817, 570, '#DCD4C2')
  rect(57, 48, 39, 39, ink)
  text('ETP', 62, 73, 14, 'bold', '#FAF8F2')
  text('ETP Systems', 108, 65, 16, 'bold')
  text('APRENDIZAGEM E DESENVOLVIMENTO', 108, 82, 7.5, 'regular', muted)
  text(item.status === 'completed' ? 'FORMAÇÃO CORPORATIVA' : 'PRÉVIA DO DOCUMENTO', 57, 124, 9, 'bold', gold)
  text('Certificado', 54, 173, 49, 'serif')
  text('D E  C O N C L U S Ã O', 58, 196, 10, 'regular', muted)
  line(57, 213, 127, 213, gold, 2)
  text(item.status === 'completed' ? 'Certificamos que' : 'Documento disponível após aprovação e liberação para', 57, 238, 11, 'regular', muted)
  const holder = fitCertificateText(item.holderName ?? name, 680, 31, 2)
  holder.lines.forEach((value, index) => text(value, 55, 271 + index * (holder.size + 3), holder.size, 'serif'))
  text(item.status === 'completed' ? 'concluiu com aprovação o curso' : 'Curso em andamento', 57, 321, 11, 'regular', muted)
  const title = fitCertificateText(item.title, 680, 21, 3)
  title.lines.forEach((value, index) => text(value, 57, 350 + index * (title.size + 3), title.size, 'bold'))
  line(57, 425, 785, 425, '#DCD4C2')
  text('CARGA HORÁRIA', 57, 448, 8, 'bold', muted)
  text(`${item.hours.toLocaleString('pt-BR')} horas`, 57, 470, 16, 'serif')
  line(235, 442, 235, 477, '#DCD4C2')
  text('DATA DE EMISSÃO', 260, 448, 8, 'bold', muted)
  text(item.issuedAt ? formatCertificateDate(item.issuedAt) : 'Aguardando conclusão', 260, 470, 14, 'serif')
  line(480, 442, 480, 477, '#DCD4C2')
  text('ETP Systems', 510, 451, 14, 'bold')
  text('Aprendizagem e desenvolvimento corporativo', 510, 470, 9, 'regular', muted)
  line(57, 502, 785, 502, '#DCD4C2')
  text('REGISTRO DO CERTIFICADO', 57, 525, 7, 'bold', muted)
  const code = fitCertificateText(item.code ?? 'Disponível após emissão', 470, 9, 2)
  code.lines.forEach((value, index) => text(value, 57, 542 + index * 11, code.size, 'mono', muted))
  text('Emitido pelo ETP Systems.', 633, 542, 8, 'regular', muted)
  // Selo institucional decorativo; não representa assinatura digital ou acreditação externa.
  for (const radius of [43, 38]) marks.push({ kind: 'circle', x: 739, y: 162, radius, color: gold, weight: 0.8 })
  for (let i = 0; i < 36; i++) {
    const angle = i * Math.PI / 18
    line(739 + Math.cos(angle) * 47, 162 + Math.sin(angle) * 47,
      739 + Math.cos(angle) * 50, 162 + Math.sin(angle) * 50, gold, 0.6)
  }
  text('ETP', 721, 163, 19, 'serif', gold)
  text(item.status === 'completed' ? 'CONCLUSÃO' : 'PRÉVIA', item.status === 'completed' ? 717 : 725, 180, 6.5, 'bold', gold)
  return marks
}

const xml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!)
export function certificateSvg(item: Certificate, name: string) {
  const content = certificateArtwork(item, name).map(mark => {
    switch (mark.kind) {
      case 'rect': return `<rect x="${mark.x}" y="${mark.y}" width="${mark.width}" height="${mark.height}" fill="${mark.color}"/>`
      case 'line': return `<line x1="${mark.x}" y1="${mark.y}" x2="${mark.endX}" y2="${mark.endY}" stroke="${mark.color}" stroke-width="${mark.weight}"/>`
      case 'circle': return `<circle cx="${mark.x}" cy="${mark.y}" r="${mark.radius}" fill="none" stroke="${mark.color}" stroke-width="${mark.weight}"/>`
      case 'text': return `<text x="${mark.x}" y="${mark.y}" font-size="${mark.size}" font-family="${mark.font === 'serif' ? 'Times New Roman, serif' : mark.font === 'mono' ? 'Courier New, monospace' : 'Arial, sans-serif'}" font-weight="${mark.font === 'bold' ? 700 : 400}" fill="${mark.color}">${xml(mark.value)}</text>`
    }
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">${content}</svg>`
}
