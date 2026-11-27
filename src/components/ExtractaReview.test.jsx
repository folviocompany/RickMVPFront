import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../services/api'
import ExtractaReview from './ExtractaReview'

vi.mock('../services/api', () => ({
  default: { patch: vi.fn(), post: vi.fn() }, getErrorMessage: (err) => err.message,
}))

const doc = {
  id: 'doc-1', revision: 2, status: 'needs_review', review_issues: ['Diferença tributária'],
  result: { orders: [{ order_number: '001', product_total: '10.00', order_total: '11.50',
    items: [{ line_id: 'p1-l1', page_number: 1, description: 'Caneta', quantity: '2',
      unit_price: '5.00', product_code_raw: '0001/23', evidence: {}, warnings: [] }],
  }] },
}

describe('ExtractaReview', () => {
  beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear() })

  it('exige responsável e justificativa para aceitar pendências', async () => {
    api.post.mockResolvedValue({ data: { id: 'batch-1' } })
    const onUpdated = vi.fn()
    render(<ExtractaReview document={doc} batchId="batch-1" onUpdated={onUpdated} />)
    const approve = screen.getByRole('button', { name: 'Aprovar conferência' })
    expect(approve).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Responsável pela conferência'), { target: { value: 'Maria' } })
    fireEvent.change(screen.getByLabelText('Justificativa da conferência'), { target: { value: 'Diferença conferida no PDF' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(approve)
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      '/api/extracta/lotes/batch-1/documentos/doc-1/aprovar',
      expect.objectContaining({ reviewer: 'Maria', revision: 2, acknowledge_issues: true }),
    ))
    expect(onUpdated).toHaveBeenCalledWith({ id: 'batch-1' })
  })

  it('corrige preço sem substituir o total declarado e preserva formulário em conflito', async () => {
    api.patch.mockRejectedValue(new Error('O documento mudou'))
    render(<ExtractaReview document={doc} batchId="batch-1" onUpdated={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Responsável pela conferência'), { target: { value: 'Maria' } })
    fireEvent.click(screen.getByRole('button', { name: 'Corrigir documento' }))
    fireEvent.change(screen.getByLabelText('Preço unitário'), { target: { value: '6.00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar correções' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('O documento mudou')
    expect(screen.getByLabelText('Preço unitário')).toHaveValue(6)
    expect(api.patch.mock.calls[0][1].orders[0].order_total).toBe('11.50')
    expect(api.patch.mock.calls[0][1].orders[0].items[0].unit_price).toBe('6.00')
    expect(doc.result.orders[0].items[0].unit_price).toBe('5.00')
  })

  it('aplica sugestão somente ao rascunho após ação explícita', () => {
    const suggested = structuredClone(doc)
    suggested.result.recovery_candidates = [{ order_index: 0, line_id: 'p1-l1',
      field: 'unit_price', value: '6,00', normalized_value: '6.00',
      page_number: 1, quote: 'Preço unitário: 6,00' }]
    render(<ExtractaReview document={suggested} batchId="batch-1" onUpdated={vi.fn()} />)
    expect(api.patch).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Usar sugestão na edição' }))
    expect(screen.getByLabelText('Preço unitário')).toHaveValue(6)
    expect(suggested.result.orders[0].items[0].unit_price).toBe('5.00')
    expect(api.patch).not.toHaveBeenCalled()
  })
})
