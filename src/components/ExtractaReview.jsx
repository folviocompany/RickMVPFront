import { useState } from 'react'
import api, { getErrorMessage } from '../services/api'

const headers = [
  ['order_number', 'Número do pedido'], ['edi_order_number', 'Pedido EDI'],
  ['issuer', 'Empresa emissora'], ['supplier', 'Fornecedor'],
  ['issue_date_raw', 'Emissão original'], ['payment_days', 'Pagamento em dias'],
  ['freight_type', 'Frete'], ['delivery_location', 'Local de entrega'],
  ['product_total', 'Total Produtos declarado'], ['order_total', 'Total Pedido declarado'],
]
const itemFields = [
  ['description', 'Descrição'], ['product_code_raw', 'Código composto'],
  ['packaging_raw', 'Embalagem'], ['barcode_raw', 'Código adicional'],
  ['delivery_date_raw', 'Entrega original'], ['quantity', 'Quantidade'],
  ['unit_price', 'Preço unitário'],
  ['ipi_raw', 'IPI original'], ['icms_substitution_raw', 'ICMS substituição original'],
  ['tax_base_raw', 'Base original'], ['commercial_discount_raw', 'Desconto comercial original'],
  ['additional_discount_raw', 'Desconto adicional original'], ['vendor_raw', 'Vendor original'],
  ['freight_raw', 'Frete original'], ['allowance_raw', 'Verba original'],
  ['other_raw', 'Outros original'], ['weight_kg', 'Peso em kg'],
  ['cp_raw', 'CP original'], ['final_price_marker_raw', 'Pr Final original'],
]
const numbers = new Set(['payment_days', 'product_total', 'order_total', 'quantity', 'unit_price', 'weight_kg'])

export default function ExtractaReview({ document: doc, batchId, onUpdated, onExport }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => structuredClone(doc.result.orders))
  const [reviewer, setReviewer] = useState(() => sessionStorage.getItem('extracta.reviewer') || '')
  const [note, setNote] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const base = `/api/extracta/lotes/${batchId}/documentos/${doc.id}`
  const approved = ['validated', 'exported'].includes(doc.status)

  const update = (index, field, value, lineIndex) => setDraft((current) => current.map((order, i) => {
    if (i !== index) return order
    if (lineIndex === undefined) return { ...order, [field]: value }
    return { ...order, items: order.items.map((item, j) => j === lineIndex ? { ...item, [field]: value } : item) }
  }))

  const request = async (action) => {
    setBusy(true)
    setError('')
    try {
      sessionStorage.setItem('extracta.reviewer', reviewer)
      const common = { revision: doc.revision || 0, reviewer, note }
      const response = action === 'save'
        ? await api.patch(base, {
          ...common,
          orders: draft.map((order, order_index) => ({
            order_index,
            ...Object.fromEntries(headers.map(([field]) => [field, clean(order[field], field)])),
            items: order.items.map((item) => ({
              line_id: item.line_id,
              ...Object.fromEntries(itemFields.map(([field]) => [field, clean(item[field], field)])),
            })),
          })),
        })
        : await api.post(`${base}/aprovar`, { ...common, acknowledge_issues: acknowledged })
      setEditing(false)
      onUpdated(response.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const applySuggestion = (suggestion) => {
    const index = suggestion.order_index
    const lineIndex = suggestion.line_id == null ? undefined
      : draft[index]?.items.findIndex((item) => item.line_id === suggestion.line_id)
    if (!draft[index] || lineIndex === -1) return
    update(index, suggestion.field, suggestion.normalized_value, lineIndex)
    setEditing(true)
  }

  return (
    <div className="extracta-order">
      <h3>Conferência do documento</h3>
      {!!doc.result.recovery_candidates?.length && <section>
        <h4>Sugestões de recuperação para conferência</h4>
        <p>As sugestões não substituem os dados automaticamente. Confirme a origem antes de usar.</p>
        {doc.result.recovery_candidates.map((suggestion, index) => <div className="extracta-warning" key={index}>
          <strong>{[...headers, ...itemFields].find(([field]) => field === suggestion.field)?.[1] || suggestion.field}: {suggestion.value}</strong>
          <p>Página {suggestion.page_number} · {suggestion.quote}</p>
          <button className="button button-secondary" type="button" disabled={busy} onClick={() => applySuggestion(suggestion)}>Usar sugestão na edição</button>
        </div>)}
      </section>}
      {doc.review_blockers?.map((message, i) => <p role="alert" className="extracta-warning" key={`b${i}`}>{message}</p>)}
      {doc.review_issues?.map((message, i) => <p className="extracta-warning" key={`w${i}`}>{message}</p>)}
      <div className="editor-grid">
        <label className="field"><span>Responsável pela conferência</span><input value={reviewer} maxLength={100} onChange={(event) => setReviewer(event.target.value)} /></label>
        <label className="field"><span>Justificativa da conferência</span><input value={note} maxLength={2000} onChange={(event) => setNote(event.target.value)} /></label>
      </div>
      {editing && (
        <div>
          <p>Os valores extraídos e as evidências originais serão preservados no histórico de alterações.</p>
          {draft.map((order, index) => (
            <section key={index}>
              <h4>Pedido {index + 1}</h4>
              <div className="editor-grid">
                {headers.map(([field, label]) => <EditField key={field} label={label} field={field} value={order[field]} disabled={busy} onChange={(value) => update(index, field, value)} />)}
              </div>
              {order.items.map((item, lineIndex) => (
                <fieldset className="editor-item" key={item.line_id}>
                  <legend>{item.line_id} · página {item.page_number}</legend>
                  {itemFields.map(([field, label]) => <EditField key={field} field={field} label={label} value={item[field]} disabled={busy} onChange={(value) => update(index, field, value, lineIndex)} />)}
                  <details className="field-wide"><summary>Evidência original da linha</summary><p>{item.evidence?.description?.text}</p></details>
                </fieldset>
              ))}
            </section>
          ))}
        </div>
      )}
      {!editing && !approved && <label className="extracta-ack">
        <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />
        Conferi as pendências e as diferenças de valores indicadas neste documento.
      </label>}
      {error && <p role="alert" className="alert alert-danger">{error}</p>}
      <div className="button-row">
        <button type="button" className="button button-secondary" disabled={busy} onClick={() => { setDraft(structuredClone(doc.result.orders)); setEditing((value) => !value) }}>{editing ? 'Cancelar edição' : 'Corrigir documento'}</button>
        {editing
          ? <button type="button" className="button button-primary" disabled={busy || reviewer.trim().length < 2} onClick={() => request('save')}>{busy ? 'Salvando...' : 'Salvar correções'}</button>
          : <button type="button" className="button button-primary" disabled={busy || approved || reviewer.trim().length < 2 || !!doc.review_blockers?.length || (!!doc.review_issues?.length && (!acknowledged || !note.trim()))} onClick={() => request('approve')}>{approved ? 'Documento aprovado' : 'Aprovar conferência'}</button>}
        <button type="button" className="button button-secondary" disabled={busy || editing || !approved} onClick={onExport}>Exportar este documento</button>
      </div>
      {!!doc.audit?.length && <details className="extracta-audit"><summary>Histórico de conferência ({doc.audit.length})</summary>
        {doc.audit.map((event) => <article key={event.revision}>
          <strong>Revisão {event.revision} · {event.action} · {event.reviewer}</strong><p>{event.at} · {event.note}</p>
          {event.changes?.map((change) => <p key={change.field}>{change.field}: {String(change.before ?? 'ausente')} → {String(change.after ?? 'ausente')}</p>)}
        </article>)}
      </details>}
    </div>
  )
}

function EditField({ field, label, value, disabled, onChange }) {
  return <label className="field"><span>{label}</span><input disabled={disabled} value={value ?? ''} type={numbers.has(field) ? 'number' : 'text'} step={field === 'quantity' ? '0.0001' : field === 'payment_days' ? '1' : '0.01'} min="0" onChange={(event) => onChange(event.target.value)} /></label>
}

function clean(value, field) {
  if (value === undefined || value === null || value === '') return null
  return field === 'payment_days' ? Number(value) : String(value)
}
