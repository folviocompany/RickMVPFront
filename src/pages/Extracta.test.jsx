import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import api from '../services/api'
import Extracta from './Extracta'

vi.mock('../services/api', () => ({
  default: { post: vi.fn(), get: vi.fn() },
  API_URL: 'http://localhost:8080',
  getErrorMessage: (error) => error.message,
}))

describe('Extracta', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('reprocessa uma falha no mesmo documento e retoma a consulta do lote', async () => {
    const failed = { id: 'same-batch', status: 'completed', documents: [
      { id: 'same-doc', revision: 2, filename: 'loja.pdf', status: 'failed', can_reprocess: true },
    ] }
    const complete = { ...failed, documents: [{ ...failed.documents[0], status: 'needs_review', can_reprocess: false }] }
    api.get.mockResolvedValueOnce({ data: failed }).mockResolvedValue({ data: complete })
    api.post.mockResolvedValue({ data: { ...failed, status: 'pending' } })
    render(<MemoryRouter initialEntries={['/extracta?lote=same-batch']}><Extracta /></MemoryRouter>)
    fireEvent.click(await screen.findByRole('button', { name: 'Reprocessar este documento' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      '/api/extracta/lotes/same-batch/documentos/same-doc/reprocessar', { revision: 2 },
    ))
    expect(await screen.findByText('Conferência necessária')).toBeInTheDocument()
  })

  it('envia vários documentos e exibe os resultados individuais do lote', async () => {
    api.post.mockResolvedValue({ data: { id: 'batch-1', documents: [], status: 'pending' } })
    api.get.mockResolvedValue({ data: {
      id: 'batch-1', status: 'completed', documents: [
        { id: 'doc-1', filename: 'loja1.pdf', status: 'needs_review', result: {
          page_count: 2, timings: { total: 5 }, warnings: [], errors: [], orders: [{
            order_number: '42', edi_order_number: '142', items: [], warnings: [],
            product_total: '100.00', order_total: '115.00', calculated_product_total: '100.00',
          }],
        } },
        { id: 'doc-2', filename: 'loja2.pdf', status: 'failed', error: 'PDF inválido' },
      ],
    } })
    render(<MemoryRouter><Extracta /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Documentos PDF'), { target: { files: [
      new File(['%PDF'], 'loja1.pdf', { type: 'application/pdf' }),
      new File(['%PDF'], 'loja2.pdf', { type: 'application/pdf' }),
    ] } })
    fireEvent.click(screen.getByRole('button', { name: 'Processar 2 documento(s)' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1))
    expect(api.post.mock.calls[0][1].getAll('arquivos')).toHaveLength(2)
    expect(await screen.findByText('PDF inválido')).toBeInTheDocument()
    expect(screen.getByText('Pedido 42 · EDI 142')).toBeInTheDocument()
    expect(screen.getByText('R$ 115,00')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir PDF' })).toHaveAttribute(
      'href', 'http://localhost:8080/api/extracta/lotes/batch-1/documentos/doc-1/arquivo',
    )
  })
})
