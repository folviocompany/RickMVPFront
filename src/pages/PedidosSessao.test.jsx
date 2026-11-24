import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import PedidosSessao from './PedidosSessao'

const pedidos = [
  { id: '1', processamentoId: 'proc-a', arquivoNome: 'loja-a.pdf', numeroPdf: '100', totalItens: 2, totalValor: 10, itensSemMapeamento: 0, status: 'APROVADO' },
  { id: '2', processamentoId: 'proc-a', arquivoNome: 'loja-a.pdf', numeroPdf: '101', totalItens: 3, totalValor: 15, itensSemMapeamento: 1, status: 'REVISAO' },
  { id: '3', processamentoId: 'proc-b', arquivoNome: 'loja-b.pdf', numeroPdf: '200', totalItens: 1, totalValor: 8, itensSemMapeamento: 0, status: 'APROVADO' },
]

describe('PedidosSessao', () => {
  it('separa pedidos por documento processado', () => {
    const abrirPedido = vi.fn()
    const context = { pedidos, abrirPedido, carregandoHistorico: false }
    const Layout = () => <Outlet context={context} />

    render(
      <MemoryRouter initialEntries={['/pedidos']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="pedidos" element={<PedidosSessao mode="todos" />} />
            <Route path="novo-pedido" element={<div>Revisão</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('loja-a.pdf')).toBeInTheDocument()
    expect(screen.getByText('loja-b.pdf')).toBeInTheDocument()
    expect(screen.getByText(/2 pedido\(s\).*R\$ 25,00/)).toBeInTheDocument()
    expect(screen.getByText(/1 pedido\(s\).*R\$ 8,00/)).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir documento' })[2])
    expect(abrirPedido).toHaveBeenCalledWith('3')
    expect(screen.getByText('Revisão')).toBeInTheDocument()
  })
})
