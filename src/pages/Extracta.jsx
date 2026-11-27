import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ExtractaReview from '../components/ExtractaReview'
import api, { API_URL, getErrorMessage } from '../services/api'
import { validatePdf } from '../utils/fileValidation'
import { formatarMoeda } from '../utils/money'

const labels = {
  pending: 'Na fila', processing: 'Processando', needs_review: 'Conferência necessária',
  failed: 'Falhou', interrupted: 'Interrompido', validated: 'Validado',
  exported: 'Exportado',
}

export default function Extracta() {
  const [files, setFiles] = useState([])
  const [batch, setBatch] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pollGeneration, setPollGeneration] = useState(0)
  const controllerRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const batchId = searchParams.get('lote') || sessionStorage.getItem('extracta.batchId')

  useEffect(() => () => controllerRef.current?.abort(), [])

  useEffect(() => {
    if (!batchId) return
    const controller = new AbortController()
    let timer
    const poll = async () => {
      try {
        const { data } = await api.get(`/api/extracta/lotes/${batchId}`, {
          signal: controller.signal,
        })
        setBatch(data)
        const running = ['pending', 'processing'].includes(data.status)
        setBusy(running)
        if (running) timer = window.setTimeout(poll, 1000)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(err))
          setBusy(false)
        }
      }
    }
    poll()
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [batchId, pollGeneration])

  const select = (event) => {
    const selected = Array.from(event.target.files)
    const invalid = selected.map((file) => validatePdf(file)).find(Boolean)
    setError(invalid || (selected.length > 10 ? 'Selecione até 10 documentos por lote.' : ''))
    setFiles(invalid || selected.length > 10 ? [] : selected)
  }

  const process = async () => {
    setBusy(true)
    setError('')
    const controller = new AbortController()
    controllerRef.current = controller
    try {
      const form = new FormData()
      files.forEach((file) => form.append('arquivos', file))
      const { data } = await api.post('/api/extracta/lotes', form, {
        signal: controller.signal, timeout: 60000,
      })
      sessionStorage.setItem('extracta.batchId', data.id)
      setBatch(data)
      setSearchParams({ lote: data.id })
    } catch (err) {
      if (!controller.signal.aborted) setError(getErrorMessage(err))
      setBusy(false)
    }
  }

  const exportExcel = async (docId) => {
    setError('')
    try {
      const path = `/api/extracta/lotes/${batch.id}${docId ? `/documentos/${docId}` : ''}/exportar`
      const { data } = await api.post(path, null, { responseType: 'blob', timeout: 60000 })
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = `extracta_${docId || batch.id}.xlsx`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      const response = await api.get(`/api/extracta/lotes/${batch.id}`)
      setBatch(response.data)
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        try { setError(JSON.parse(await err.response.data.text()).detail) } catch { setError('Não foi possível exportar o documento.') }
      } else setError(getErrorMessage(err))
    }
  }

  const reprocess = async (doc) => {
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post(`/api/extracta/lotes/${batch.id}/documentos/${doc.id}/reprocessar`, {
        revision: doc.revision || 0,
      })
      setBatch(data)
      setPollGeneration((value) => value + 1)
    } catch (err) {
      setError(getErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="content-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Extracta</span>
            <h2>Processe seus documentos em lote</h2>
            <p>Selecione os PDFs e confira os dados de cada pedido com sua página de origem.</p>
          </div>
          <Link className="button button-secondary" to="/historico">Consultar histórico</Link>
        </div>
        <div className="extracta-upload">
          <label className="field"><span>Documentos PDF</span>
            <input type="file" accept="application/pdf,.pdf" multiple disabled={busy} onChange={select} />
          </label>
          {files.map((file) => <p key={`${file.name}-${file.lastModified}`}>{file.name}</p>)}
          <button className="button button-primary" type="button" disabled={busy || !files.length} onClick={process}>
            {busy ? 'Processando lote...' : `Processar ${files.length || ''} documento(s)`}
          </button>
          <p>O OCR é local. A recuperação opcional pela NVIDIA exige habilitação na configuração. Confira os dados antes de exportar.</p>
        </div>
      </section>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {batch && <div className="button-row">
        <button className="button button-primary" type="button" disabled={busy || !batch.documents.length || batch.documents.some((doc) => !['validated', 'exported'].includes(doc.status))} onClick={() => exportExcel()}>Exportar lote conferido</button>
        <span>Planilha provisória, sem template Salesforce validado.</span>
      </div>}
      {batch?.documents.map((doc) => (
        <section className="content-card" key={doc.id}>
          <div className="section-heading">
            <div><span className="eyebrow">{labels[doc.status] || doc.status}</span><h2>{doc.filename}</h2></div>
            {doc.result && <div>
              <span>{doc.result.page_count} página(s) · {doc.result.timings.total.toFixed(1)} s </span>
              <a className="button button-secondary" target="_blank" rel="noreferrer" href={`${API_URL}/api/extracta/lotes/${batch.id}/documentos/${doc.id}/arquivo`}>Abrir PDF</a>
            </div>}
          </div>
          {doc.error && <p className="extracta-upload" role="alert">{doc.error}</p>}
          {doc.can_reprocess && <div className="extracta-upload"><button className="button button-secondary" type="button" disabled={busy} onClick={() => reprocess(doc)}>Reprocessar este documento</button><p>O mesmo registro será mantido, com o histórico das tentativas.</p></div>}
          {!!doc.attempt_history?.length && <details className="extracta-order"><summary>Tentativas anteriores ({doc.attempt_history.length})</summary>{doc.attempt_history.map((attempt, index) => <p key={index}>{attempt.at} · {labels[attempt.status] || attempt.status} · {attempt.error || attempt.result?.errors?.join('; ') || 'Resultado anterior preservado'}</p>)}</details>}
          {!!doc.result?.recovery_events?.length && <details className="extracta-order"><summary>Recuperação de campos</summary>{doc.result.recovery_events.map((event, i) => <p key={i}>{event}</p>)}</details>}
          {doc.result?.errors.map((message, index) => <p className="extracta-upload" role="alert" key={index}>{message}</p>)}
          {doc.result?.warnings.map((message, index) => <p className="extracta-upload" key={index}>{message}</p>)}
          {doc.result?.orders.map((order, index) => (
            <article className="extracta-order" key={`${order.order_number}-${index}`}>
              <h3>Pedido {order.order_number || 'sem número'} · EDI {order.edi_order_number || 'não identificado'}</h3>
              <p>{order.items.length} mercadorias · Pagamento {order.payment_days ?? 'não identificado'} dias · Frete {order.freight_type || 'não identificado'}</p>
              <div className="extracta-totals">
                <span>Produtos: <strong>{money(order.product_total)}</strong></span>
                <span>Pedido declarado: <strong>{money(order.order_total)}</strong></span>
                <span>Soma calculada: <strong>{money(order.calculated_product_total)}</strong></span>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Página</th><th>Código original</th><th>Descrição</th><th>Embalagem</th><th>Qtd.</th><th>Unitário</th><th>IPI original</th><th>Evidência</th></tr></thead>
                  <tbody>{order.items.map((item) => (
                    <tr key={item.line_id}>
                      <td>{item.page_number}</td><td className="mono">{item.product_code_raw || 'Não identificado'}</td>
                      <td>{item.description}{item.warnings.map((warning) => <small key={warning}>{warning}</small>)}</td>
                      <td>{item.packaging_raw || 'Não identificada'}</td><td>{item.quantity ?? 'Ausente'}</td>
                      <td>{money(item.unit_price)}</td><td>{item.ipi_raw ?? 'Ausente'}</td>
                      <td><details><summary>Ver origem</summary><p>{item.evidence.description?.text}</p></details></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <details><summary>Avisos da extração original</summary>{order.warnings.map((warning, i) => <p className="extracta-warning" key={i}>{warning}</p>)}</details>
            </article>
          ))}
          {doc.result && !['failed', 'interrupted'].includes(doc.status) && batch.status === 'completed' && <ExtractaReview key={`${doc.id}-${doc.revision || 0}`} document={doc} batchId={batch.id} onUpdated={setBatch} onExport={() => exportExcel(doc.id)} />}
        </section>
      ))}
    </div>
  )
}

function money(value) {
  return value == null ? 'Não identificado' : formatarMoeda(value)
}
