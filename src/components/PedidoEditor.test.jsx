import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PedidoEditor from './PedidoEditor'

const pedido = {
  id: 'pedido-1',
  numeroPdf: '51417',
  cnpjCliente: '12345678000190',
  prazoPagamento: '28',
  itens: [{
    id: 'item-1',
    codigoOriginal: 'ABC',
    descricaoProduto: 'Caneta',
    quantidade: 2,
    valorUnitario: 3.5,
    valorTotal: 7,
  }],
}

describe('PedidoEditor', () => {
  it('envia os campos corrigidos com valores numéricos', () => {
    const onSave = vi.fn()
    render(<PedidoEditor pedido={pedido} saving={false} onSave={onSave} onCancel={() => {}} />)

    fireEvent.change(screen.getByLabelText('Número do pedido'), { target: { value: '51417-A' } })
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: /salvar alterações/i }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      numeroPdf: '51417-A',
      itens: [expect.objectContaining({ quantidade: 4, valorTotal: 14 })],
    }))
  })
})
