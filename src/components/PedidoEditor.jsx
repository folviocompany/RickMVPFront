import { useMemo, useState } from 'react'
import { Save, X } from 'lucide-react'

const headerFields = [
  ['numeroPdf', 'Número do pedido'],
  ['cnpjCliente', 'CNPJ do cliente'],
  ['prazoPagamento', 'Prazo de pagamento'],
  ['dataEmissao', 'Data de emissão'],
  ['previsaoEntrega', 'Previsão de entrega'],
  ['dataLimiteEntrega', 'Limite de entrega'],
  ['condicaoFrete', 'Condição de frete'],
]

export default function PedidoEditor({ pedido, saving, onSave, onCancel }) {
  const initial = useMemo(() => ({
    numeroPdf: pedido.numeroPdf || '',
    cnpjCliente: pedido.cnpjCliente || '',
    prazoPagamento: pedido.prazoPagamento || '',
    dataEmissao: pedido.dataEmissao || '',
    previsaoEntrega: pedido.previsaoEntrega || '',
    dataLimiteEntrega: pedido.dataLimiteEntrega || '',
    condicaoFrete: pedido.condicaoFrete || '',
    itens: (pedido.itens || []).map((item) => ({
      id: item.id,
      codigoOriginal: item.codigoOriginal || '',
      ean: item.ean || '',
      descricaoProduto: item.descricaoProduto || '',
      quantidade: item.quantidade ?? '',
      embalagemCx: item.embalagemCx ?? '',
      valorUnitario: item.valorUnitario ?? '',
      valorTotal: item.valorTotal ?? '',
      observacao: item.observacao || '',
    })),
  }), [pedido])
  const [draft, setDraft] = useState(initial)

  const setHeader = (field, value) => setDraft((current) => ({ ...current, [field]: value }))
  const setItem = (index, field, value) => setDraft((current) => ({
    ...current,
    itens: current.itens.map((item, itemIndex) => {
      if (itemIndex !== index) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantidade' || field === 'valorUnitario') {
        const quantity = Number(updated.quantidade)
        const unitValue = Number(updated.valorUnitario)
        updated.valorTotal = updated.quantidade !== '' && updated.valorUnitario !== ''
          ? (quantity * unitValue).toFixed(2)
          : ''
      }
      return updated
    }),
  }))

  const submit = (event) => {
    event.preventDefault()
    onSave({
      ...draft,
      itens: draft.itens.map((item) => ({
        ...item,
        quantidade: Number(item.quantidade),
        embalagemCx: item.embalagemCx === '' ? null : Number(item.embalagemCx),
        valorUnitario: item.valorUnitario === '' ? null : Number(item.valorUnitario),
        valorTotal: item.valorTotal === '' ? null : Number(item.valorTotal),
      })),
    })
  }

  return (
    <form className="review-data editor-form" onSubmit={submit}>
      <section className="summary-card">
        <div className="panel-heading"><div><span className="eyebrow">Correção manual</span><h3>Dados do pedido</h3></div></div>
        <div className="editor-grid">
          {headerFields.map(([field, label]) => (
            <label className="field" key={field}><span>{label}</span><input value={draft[field]} onChange={(event) => setHeader(field, event.target.value)} /></label>
          ))}
        </div>
      </section>

      <section className="items-card">
        <div className="panel-heading"><div><span className="eyebrow">Produtos</span><h3>Corrigir itens</h3></div></div>
        <div className="editor-items">
          {draft.itens.map((item, index) => (
            <fieldset className="editor-item" key={item.id}>
              <legend>Item {index + 1}</legend>
              <label className="field field-wide"><span>Descrição</span><input value={item.descricaoProduto} onChange={(event) => setItem(index, 'descricaoProduto', event.target.value)} /></label>
              <label className="field"><span>Código cliente</span><input value={item.codigoOriginal} onChange={(event) => setItem(index, 'codigoOriginal', event.target.value)} /></label>
              <label className="field"><span>EAN</span><input value={item.ean} onChange={(event) => setItem(index, 'ean', event.target.value)} /></label>
              <label className="field"><span>Quantidade</span><input type="number" min="1" required value={item.quantidade} onChange={(event) => setItem(index, 'quantidade', event.target.value)} /></label>
              <label className="field"><span>Embalagem</span><input type="number" min="1" value={item.embalagemCx} onChange={(event) => setItem(index, 'embalagemCx', event.target.value)} /></label>
              <label className="field"><span>Valor unitário</span><input type="number" min="0" step="0.01" value={item.valorUnitario} onChange={(event) => setItem(index, 'valorUnitario', event.target.value)} /></label>
              <label className="field"><span>Valor total</span><input type="number" min="0" step="0.01" value={item.valorTotal} onChange={(event) => setItem(index, 'valorTotal', event.target.value)} /></label>
              <label className="field field-wide"><span>Observação</span><input value={item.observacao} onChange={(event) => setItem(index, 'observacao', event.target.value)} /></label>
            </fieldset>
          ))}
        </div>
      </section>

      <div className="editor-actions">
        <button className="button button-secondary" type="button" onClick={onCancel}><X size={17} /> Cancelar</button>
        <button className="button button-primary" type="submit" disabled={saving}><Save size={17} /> {saving ? 'Salvando...' : 'Salvar alterações'}</button>
      </div>
    </form>
  )
}
