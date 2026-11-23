import { AlertTriangle, CheckCircle2, FileSpreadsheet, PackageCheck } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const { pedidos, serviceStatus } = useOutletContext()
  const totalItens = pedidos.reduce((total, pedido) => total + (pedido.totalItens || 0), 0)
  const itensMapeados = pedidos.reduce(
    (total, pedido) => total + ((pedido.totalItens || 0) - (pedido.itensSemMapeamento || 0)),
    0,
  )
  const revisoes = pedidos.filter((pedido) => pedido.status === 'REVISAO').length
  const exportados = pedidos.filter((pedido) => pedido.status === 'EXPORTADO').length
  const taxa = totalItens ? Math.round((itensMapeados / totalItens) * 100) : 0

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Operação assistida por IA</span>
          <h2>Transforme pedidos em dados revisáveis.</h2>
          <p>Envie um PDF, acompanhe a leitura e confira todos os itens antes de exportar a planilha.</p>
        </div>
        <Link className="button button-primary" to="/novo-pedido">Processar novo pedido</Link>
      </section>

      <div className="session-notice">
        <AlertTriangle size={18} />
        <span>Os indicadores abaixo representam somente esta sessão. O backend ainda não possui um endpoint de histórico consolidado.</span>
      </div>

      <section className="metric-grid" aria-label="Indicadores da sessão">
        <MetricCard icon={FileSpreadsheet} label="Pedidos processados" value={pedidos.length} hint="Nesta sessão" />
        <MetricCard icon={CheckCircle2} label="Pedidos exportados" value={exportados} hint="Planilhas geradas" tone="success" />
        <MetricCard icon={PackageCheck} label="Itens identificados" value={`${taxa}%`} hint={`${itensMapeados} de ${totalItens}`} tone="blue" />
        <MetricCard icon={AlertTriangle} label="Aguardando revisão" value={revisoes} hint="Pedidos com pendências" tone="warning" />
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Atividade recente</span>
            <h2>Pedidos desta sessão</h2>
          </div>
          {pedidos.length > 0 && <Link className="text-link" to="/pedidos">Ver todos</Link>}
        </div>

        {pedidos.length === 0 ? (
          <div className="empty-state compact">
            <FileSpreadsheet size={28} />
            <h3>Nenhum pedido processado nesta sessão</h3>
            <p>O primeiro pedido aparecerá aqui assim que o processamento for concluído.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Status</th></tr>
              </thead>
              <tbody>
                {pedidos.slice(-5).reverse().map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="mono strong">#{pedido.numeroPdf || 'S/N'}</td>
                    <td>{pedido.nomeCliente || 'Cliente não identificado'}</td>
                    <td>{pedido.totalItens}</td>
                    <td><StatusBadge status={pedido.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {serviceStatus === 'offline' && (
        <div className="alert alert-danger">O backend está indisponível. Verifique se o FastAPI está em execução.</div>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, hint, tone = 'neutral' }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-icon"><Icon size={20} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  )
}
