import { FileSearch } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'

export default function PedidosSessao({ mode }) {
  const { pedidos } = useOutletContext()
  const lista = mode === 'revisoes'
    ? pedidos.filter((pedido) => pedido.status === 'REVISAO')
    : pedidos

  return (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Dados da sessão</span>
          <h2>{mode === 'revisoes' ? 'Pedidos que exigem revisão' : 'Pedidos processados'}</h2>
          <p>Esta lista permanece em memória enquanto a aplicação estiver aberta.</p>
        </div>
        <Link to="/novo-pedido" className="button button-primary">Novo pedido</Link>
      </div>

      {lista.length === 0 ? (
        <div className="empty-state">
          <FileSearch size={32} />
          <h3>{mode === 'revisoes' ? 'Nenhuma revisão pendente' : 'Nenhum pedido nesta sessão'}</h3>
          <p>O histórico persistente depende de um endpoint de listagem no backend.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Arquivo</th><th>Itens</th><th>Pendências</th><th>Status</th></tr></thead>
            <tbody>
              {lista.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="mono strong">#{pedido.numeroPdf || 'S/N'}</td>
                  <td>{pedido.nomeCliente || 'Não identificado'}</td>
                  <td>{pedido.arquivoNome}</td>
                  <td>{pedido.totalItens}</td>
                  <td>{pedido.itensSemMapeamento}</td>
                  <td><StatusBadge status={pedido.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
