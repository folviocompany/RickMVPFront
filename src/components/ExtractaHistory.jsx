import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'

export default function ExtractaHistory({ refreshKey = '' }) {
  const [reports, setReports] = useState([])
  const [offset, setOffset] = useState(0)
  const [more, setMore] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    api.get('/api/extracta/lotes', { params: { limit: 20, offset }, signal: controller.signal })
      .then(({ data }) => { setReports(data); setMore(data.length === 20); setError('') })
      .catch((err) => { if (!controller.signal.aborted) setError(getErrorMessage(err)) })
    return () => controller.abort()
  }, [offset, refreshKey])
  return <section className="content-card">
    <div className="section-heading"><div><span className="eyebrow">Histórico persistente</span><h2>Lotes Extracta</h2></div></div>
    {error && <p role="alert" className="extracta-warning">{error}</p>}
    {!reports.length && !error && <p className="extracta-order">Nenhum lote encontrado.</p>}
    <div className="table-scroll"><table className="data-table"><thead><tr><th>Criado em</th><th>Documentos</th><th>Estado</th><th /></tr></thead><tbody>
      {reports.map((report) => <tr key={report.id}><td>{new Date(report.created_at).toLocaleString('pt-BR')}</td><td>{report.documents.map((doc) => doc.filename).join(', ')}</td><td>{report.status === 'completed' ? 'Concluído' : report.status === 'interrupted' ? 'Interrompido' : 'Em processamento'}</td><td><Link className="button button-ghost" to={`/extracta?lote=${report.id}`}>Abrir lote</Link></td></tr>)}
    </tbody></table></div>
    <div className="extracta-order button-row"><button className="button button-secondary" type="button" disabled={offset === 0} onClick={() => setOffset((value) => Math.max(0, value - 20))}>Anteriores</button><button className="button button-secondary" type="button" disabled={!more} onClick={() => setOffset((value) => value + 20)}>Próximos</button></div>
  </section>
}
