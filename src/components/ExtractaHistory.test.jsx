import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import api from '../services/api'
import ExtractaHistory from './ExtractaHistory'

vi.mock('../services/api', () => ({
  default: { get: vi.fn() }, getErrorMessage: (err) => err.message,
}))

describe('ExtractaHistory', () => {
  it('recupera lotes persistidos e mantém um endereço próprio para reabertura', async () => {
    api.get.mockResolvedValue({ data: [{ id: 'persisted-id', created_at: '2026-11-26T10:00:00Z',
      status: 'completed', documents: [{ filename: 'loja.pdf', status: 'validated' }],
    }] })
    render(<MemoryRouter><ExtractaHistory /></MemoryRouter>)
    expect(await screen.findByText('loja.pdf')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir lote' })).toHaveAttribute('href', '/extracta?lote=persisted-id')
  })
})
