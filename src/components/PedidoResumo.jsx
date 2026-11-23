import StatusBadge from './StatusBadge'

export default function PedidoResumo({ pedido }) {
  return (
    <section className="summary-card">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Dados interpretados</span>
          <h3>Pedido #{pedido.numeroPdf || 'S/N'}</h3>
        </div>
        <StatusBadge status={pedido.status} />
      </div>
      <dl className="summary-grid">
        <SummaryItem label="Cliente" value={pedido.nomeCliente || 'Não identificado'} helper={formatCnpj(pedido.cnpjCliente)} pending={!pedido.nomeCliente} />
        <SummaryItem label="Arquivo" value={pedido.arquivoNome} />
        <SummaryItem label="Itens" value={`${pedido.totalItens} itens`} helper={`${pedido.itensSemMapeamento} sem mapeamento`} pending={pedido.itensSemMapeamento > 0} />
        <SummaryItem label="Prazo de pagamento" value={pedido.prazoPagamento ? `${pedido.prazoPagamento} dias` : 'Não informado'} pending={!pedido.prazoPagamento} />
        <SummaryItem label="Data de emissão" value={pedido.dataEmissao || 'Não informada'} pending={!pedido.dataEmissao} />
        <SummaryItem label="Previsão de entrega" value={pedido.previsaoEntrega || 'Não informada'} pending={!pedido.previsaoEntrega} />
        <SummaryItem label="Limite de entrega" value={pedido.dataLimiteEntrega || 'Não informado'} pending={!pedido.dataLimiteEntrega} />
        <SummaryItem label="Frete" value={pedido.condicaoFrete || 'Não informado'} pending={!pedido.condicaoFrete} />
      </dl>
    </section>
  )
}

function SummaryItem({ label, value, helper, pending }) {
  return (
    <div className={`summary-item ${pending ? 'is-pending' : ''}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
      {helper && <span>{helper}</span>}
    </div>
  )
}

function formatCnpj(cnpj) {
  if (!cnpj) return 'CNPJ não identificado'
  const value = cnpj.replace(/\D/g, '')
  if (value.length !== 14) return cnpj
  return `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8, 12)}-${value.slice(12)}`
}
