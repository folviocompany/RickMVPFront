import StatusBadge from './StatusBadge'

export default function TabelaItens({ itens }) {
  const pending = itens.filter((item) => !item.mapeado).length
  const quantity = itens.reduce((total, item) => total + Number(item.quantidade || 0), 0)
  const totalValue = itens.reduce((total, item) => total + Number(item.valorTotal || 0), 0)

  return (
    <section className="items-card">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Produtos</span>
          <h3>Itens do pedido</h3>
        </div>
        <span className="items-count">{itens.length} itens · {pending} pendentes</span>
      </div>
      <div className="table-scroll">
        <table className="data-table items-table">
          <thead>
            <tr>
              <th>Código cliente</th><th>Descrição</th><th>Código BIC</th><th>Qtd.</th><th>Valor unit.</th><th>Total</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, index) => (
              <tr key={item.id || index} className={!item.mapeado ? 'row-pending' : ''}>
                <td className="mono strong">{item.codigoOriginal || '—'}</td>
                <td>
                  <span className="item-description">{item.descricaoProduto || 'Descrição não identificada'}</span>
                  {item.observacao && <small>{item.observacao}</small>}
                </td>
                <td className="mono">{item.codigoIndustria || '—'}</td>
                <td className="numeric strong">{item.quantidade ?? '—'}</td>
                <td className="numeric">{formatCurrency(item.valorUnitario)}</td>
                <td className="numeric strong">{formatCurrency(item.valorTotal)}</td>
                <td><StatusBadge mapped={item.mapeado} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan="3">Totais</td><td className="numeric">{quantity}</td><td /><td className="numeric">{formatCurrency(totalValue)}</td><td /></tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}

function formatCurrency(value) {
  if (value === null || value === undefined) return '—'
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
