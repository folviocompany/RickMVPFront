import { describe, expect, it } from 'vitest'
import { calcularTotalItem, calcularTotalPedido, calcularTotalPedidos } from './money'

describe('cálculos financeiros', () => {
  it('usa quantidade vezes valor unitário quando o total do item não existe', () => {
    expect(calcularTotalItem({ quantidade: 3, valorUnitario: 4.5, valorTotal: null })).toBe(13.5)
  })

  it('soma todos os pedidos', () => {
    const pedidos = [
      { totalValor: 20 },
      { itens: [{ quantidade: 2, valorUnitario: 7.5, valorTotal: null }] },
    ]
    expect(calcularTotalPedido(pedidos[1])).toBe(15)
    expect(calcularTotalPedidos(pedidos)).toBe(35)
  })
})
