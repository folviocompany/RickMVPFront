import { describe, expect, it } from 'vitest'
import { MAX_FILE_SIZE, validatePdf } from '../utils/fileValidation'

describe('validatePdf', () => {
  it('aceita um PDF válido', () => {
    const file = new File(['pedido'], 'pedido.pdf', { type: 'application/pdf' })
    expect(validatePdf(file)).toBeNull()
  })

  it('recusa formatos diferentes de PDF', () => {
    const file = new File(['texto'], 'pedido.txt', { type: 'text/plain' })
    expect(validatePdf(file)).toMatch(/Formato inválido/)
  })

  it('recusa arquivos acima do limite', () => {
    const file = { name: 'grande.pdf', type: 'application/pdf', size: MAX_FILE_SIZE + 1 }
    expect(validatePdf(file)).toMatch(/20 MB/)
  })
})
