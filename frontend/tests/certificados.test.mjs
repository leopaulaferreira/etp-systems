import test from 'node:test'
import assert from 'node:assert/strict'
import { certificates, initialDownloads } from '../src/mocks/certificados.mock.ts'
import {
  certificateSummary,
  formatCertificateDate,
  initialFilters,
  selectCertificates,
} from '../src/pages/Certificados/certificates.ts'
import { createCertificatePdf } from '../src/pages/Certificados/certificatePdf.ts'
import { parseCertificate } from '../src/pages/Certificados/certificatesApi.ts'

test('converte certificado emitido pela API e rejeita dados incompletos', () => {
  const payload = {
    id: '11111111-1111-4111-8111-111111111111',
    courseId: '22222222-2222-4222-8222-222222222222',
    holderName: 'Titular', title: 'Segurança da Informação', description: 'Curso piloto', durationHours: 3.5,
    code: `ETP-${'A'.repeat(32)}`, issuedAt: '2026-10-09T12:00:00Z',
  }
  const item = parseCertificate(payload)
  assert.equal(item.status, 'completed')
  assert.equal(item.courseId, '22222222-2222-4222-8222-222222222222')
  assert.equal(item.hours, 3.5)
  assert.equal(item.holderName, 'Titular')
  assert.throws(() => parseCertificate({ ...payload, code: '' }), /incompletos/)
  assert.equal(parseCertificate({ ...payload, code: 'LEGADO-123' }).code, 'LEGADO-123')
})

test('indicadores correspondem aos certificados e histórico disponíveis', () => {
  assert.deepEqual(certificateSummary(certificates), { completed: 7, ongoing: 3, hours: 48 })
  assert.equal(new Set(certificates.map((item) => item.id)).size, certificates.length)
  assert.equal(initialDownloads.length, 14)
  assert(
    initialDownloads.every((entry) =>
      certificates.some((item) => item.id === entry.certificateId && item.status === 'completed'),
    ),
  )
})

test('combina busca sem acentos, status e ano de emissão', () => {
  const found = selectCertificates(certificates, {
    ...initialFilters,
    query: '  INTRODUCAO A CRIPTOGRAFIA  ',
    status: 'completed',
    year: '2024',
  })
  assert.deepEqual(
    found.map((item) => item.id),
    ['criptografia'],
  )
  assert.equal(
    selectCertificates(certificates, { ...initialFilters, status: 'in_progress', year: '2024' })
      .length,
    0,
  )
  assert.equal(
    selectCertificates(certificates, { ...initialFilters, status: 'in_progress' }).length,
    3,
  )
  assert.equal(
    selectCertificates(certificates, { ...initialFilters, query: 'inexistente' }).length,
    0,
  )
})

test('ordena por data ou nome sem alterar os dados; sem emissão fica no final', () => {
  const original = structuredClone(certificates)
  assert.equal(selectCertificates(certificates, initialFilters)[0].id, 'lgpd')
  const oldest = selectCertificates(certificates, { ...initialFilters, order: 'oldest' })
  assert.equal(oldest[0].id, 'etica')
  assert(oldest.slice(-3).every((item) => item.status === 'in_progress'))
  const alphabetical = selectCertificates(certificates, { ...initialFilters, order: 'title' })
  assert(
    alphabetical.every(
      (item, index) =>
        !index || alphabetical[index - 1].title.localeCompare(item.title, 'pt-BR') <= 0,
    ),
  )
  assert.deepEqual(certificates, original)
  assert.equal(formatCertificateDate('2024-05-12'), '12/05/2024')
})

test('PDF mantém acentos e referências válidas com caracteres especiais no nome', async () => {
  const blob = createCertificatePdf(certificates[0], 'João (Silva) \\ ETP')
  assert.equal(blob.type, 'application/pdf')
  const pdf = await blob.text()
  assert(pdf.startsWith('%PDF-1.4'))
  assert(pdf.includes('Jo\\343o \\(Silva\\) \\\\ ETP'))
  assert(pdf.includes(certificates[0].code))
  assert(pdf.includes('Emitido pelo ETP Systems'))
  assert.equal(new TextEncoder().encode(pdf).length, pdf.length)
  const start = Number(pdf.match(/startxref\n(\d+)/)[1])
  assert.equal(pdf.slice(start, start + 4), 'xref')
  const offsets = [...pdf.matchAll(/(\d{10}) 00000 n/g)].map((match) => Number(match[1]))
  offsets.forEach((offset, index) => assert(pdf.slice(offset).startsWith(`${index + 1} 0 obj`)))
})

test('PDF não pode ser gerado para um curso em andamento', () => {
  assert.throws(
    () =>
      createCertificatePdf(
        certificates.find((item) => item.status === 'in_progress'),
        'João Silva',
      ),
    /ainda não está disponível/,
  )
})
