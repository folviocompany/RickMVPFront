import { FileSearch } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import ExtractaHistory from '../components/ExtractaHistory'
import { calcularTotalPedido, calcularTotalPedidos, formatarMoeda } from '../utils/money'

export default function PedidosSessao({ mode }) {
  const { pedidos, abrirPedido, carregandoHistorico } = useOutletContext()
  const navigate = useNavigate()
  const lista = useMemo(() => (mode === 'revisoes'
    ? pedidos.filter((pedido) => pedido.status === 'REVISAO')
    : pedidos), [mode, pedidos])
  const title = mode === 'revisoes'
    ? 'Pedidos que exigem revisão'
    : mode === 'historico' ? 'Histórico de pedidos' : 'Pedidos processados'
  const grupos = useMemo(() => Array.from(lista.reduce((map, pedido) => {
    const key = pedido.processamentoId || pedido.id
    const grupo = map.get(key) || { id: key, arquivoNome: pedido.arquivoNome, pedidos: [] }
    grupo.pedidos.push(pedido)
    map.set(key, grupo)
    return map
  }, new Map()).values()), [lista])

  const handleOpen = (id) => {
    abrirPedido(id)
    navigate('/novo-pedido')
  }

  return (
    <div className="page-stack">
    {mode === 'historico' && <ExtractaHistory />}
    <section className="content-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Dados persistentes</span>
          <h2>{title}</h2>
          <p>Pedidos salvos no banco, disponíveis mesmo após atualizar a aplicação.</p>
        </div>
        <Link to="/novo-pedido" className="button button-primary">Novo pedido</Link>
      </div>

      {carregandoHistorico ? (
        <div className="empty-state"><p>Carregando histórico...</p></div>
      ) : lista.length === 0 ? (
        <div className="empty-state">
          <FileSearch size={32} />
          <h3>{mode === 'revisoes' ? 'Nenhuma revisão pendente' : 'Nenhum pedido encontrado'}</h3>
          <p>Os pedidos processados aparecerão aqui automaticamente.</p>
        </div>
      ) : (
        <div className="order-groups">
          {grupos.map((grupo) => (
            <section className="order-group" key={grupo.id}>
              <div className="order-group-heading">
                <div><span className="eyebrow">Documento processado</span><h3>{grupo.arquivoNome}</h3></div>
                <span className="group-count">{grupo.pedidos.length} pedido(s) · {formatarMoeda(calcularTotalPedidos(grupo.pedidos))}</span>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Valor</th><th>Pendências</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {grupo.pedidos.map((pedido) => (
                      <tr key={pedido.id}>
                        <td className="mono strong">#{pedido.numeroPdf || 'S/N'}</td>
                        <td>{pedido.nomeCliente || pedido.cnpjCliente || 'Não identificado'}</td>
                        <td>{pedido.totalItens}</td>
                        <td className="numeric strong">{formatarMoeda(calcularTotalPedido(pedido))}</td>
                        <td>{pedido.itensSemMapeamento}</td>
                        <td><StatusBadge status={pedido.status} /></td>
                        <td><button type="button" className="button button-ghost" onClick={() => handleOpen(pedido.id)}>Abrir documento</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
    </div>
  )
}
