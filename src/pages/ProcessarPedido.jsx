import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Download, Pencil, RotateCcw } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import DocumentPreview from '../components/DocumentPreview'
import LoadingProcessamento from '../components/LoadingProcessamento'
import PedidoEditor from '../components/PedidoEditor'
import PedidoResumo from '../components/PedidoResumo'
import TabelaItens from '../components/TabelaItens'
import UploadZone from '../components/UploadZone'

export default function ProcessarPedido() {
  const {
    etapa,
    pedidosAtivos,
    pedidoAtual,
    setPedidoAtual,
    erro,
    processamento,
    arquivo,
    arquivoUrl,
    processar,
    exportar,
    reiniciar,
    cancelar,
    salvarPedido,
    aprovar,
  } = useOutletContext()
  const pedido = pedidosAtivos[pedidoAtual]
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  if (etapa === 'upload') {
    return (
      <div className="upload-page">
        <div className="page-intro">
          <span className="eyebrow">Entrada de documento</span>
          <h2>Envie um pedido de compra</h2>
          <p>O ADI lê o PDF, interpreta os itens com IA e prepara os dados para conferência e exportação.</p>
        </div>
        <UploadZone onArquivo={processar} />
      </div>
    )
  }

  if (etapa === 'processando') {
    return <LoadingProcessamento processamento={processamento} arquivo={arquivo} onCancel={cancelar} />
  }

  if (etapa === 'erro') {
    return (
      <section className="error-state content-card" role="alert">
        <div className="error-symbol">!</div>
        <span className="eyebrow">Processamento interrompido</span>
        <h2>Não foi possível processar o pedido</h2>
        <p>{erro}</p>
        <div className="button-row center">
          <button className="button button-secondary" type="button" onClick={reiniciar}><RotateCcw size={17} /> Tentar novamente</button>
        </div>
      </section>
    )
  }

  if (!pedido) return null

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      await salvarPedido(pedido.id, payload)
      setEditing(false)
    } catch {
      // O hook exibe a mensagem detalhada sem fechar o formulário.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="review-page">
      <section className="review-toolbar">
        <div>
          <span className="eyebrow">Conferência inteligente</span>
          <h2>Pedido #{pedido.numeroPdf || 'S/N'}</h2>
          <p>Compare o documento original com os dados interpretados.</p>
        </div>
        <div className="review-actions">
          {pedidosAtivos.length > 1 && (
            <div className="pager" aria-label="Navegação entre pedidos">
              <button type="button" className="icon-button" disabled={editing || pedidoAtual === 0} onClick={() => setPedidoAtual((index) => index - 1)} aria-label="Pedido anterior"><ArrowLeft size={18} /></button>
              <span>{pedidoAtual + 1} de {pedidosAtivos.length} neste PDF</span>
              <button type="button" className="icon-button" disabled={editing || pedidoAtual === pedidosAtivos.length - 1} onClick={() => setPedidoAtual((index) => index + 1)} aria-label="Próximo pedido"><ArrowRight size={18} /></button>
            </div>
          )}
          <button className="button button-secondary" type="button" onClick={reiniciar}><RotateCcw size={17} /> Novo PDF</button>
          <button className="button button-secondary" type="button" onClick={() => setEditing((value) => !value)}><Pencil size={17} /> {editing ? 'Cancelar edição' : 'Editar dados'}</button>
          <button className="button button-secondary" type="button" disabled={editing || pedido.status === 'APROVADO'} onClick={() => aprovar(pedido.id)}><Check size={17} /> {pedido.status === 'APROVADO' ? 'Aprovado' : 'Aprovar'}</button>
          <button className="button button-primary" type="button" disabled={editing} onClick={() => exportar(pedido.id)}><Download size={17} /> Exportar Excel</button>
        </div>
      </section>

      <div className="read-only-banner">
        <strong>{editing ? 'Modo de edição' : 'Modo de conferência'}</strong>
        <span>{editing ? 'Revise os campos e salve antes de aprovar ou exportar.' : 'Compare o documento com os dados interpretados e edite qualquer divergência.'}</span>
      </div>

      <div className="review-split">
        <DocumentPreview url={arquivoUrl} filename={arquivo?.name || pedido.arquivoNome} />
        {editing ? (
          <PedidoEditor key={pedido.id} pedido={pedido} saving={saving} onSave={handleSave} onCancel={() => setEditing(false)} />
        ) : (
          <div className="review-data">
            <PedidoResumo pedido={pedido} />
            <TabelaItens itens={pedido.itens || []} />
          </div>
        )}
      </div>
    </div>
  )
}
