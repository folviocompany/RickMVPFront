import { Download, ExternalLink, FileText } from 'lucide-react'

export default function DocumentPreview({ url, filename }) {
  return (
    <section className="document-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Documento original</span>
          <h3>{filename || 'Pedido em PDF'}</h3>
        </div>
        {url && (
          <div className="panel-actions">
            <a className="icon-button" href={url} target="_blank" rel="noreferrer" aria-label="Abrir PDF em nova guia"><ExternalLink size={17} /></a>
            <a className="icon-button" href={url} download={filename || 'pedido.pdf'} aria-label="Baixar PDF"><Download size={17} /></a>
          </div>
        )}
      </div>
      {url ? (
        <iframe className="pdf-frame" src={`${url}#toolbar=1&navpanes=0`} title={`Documento ${filename || 'do pedido'}`} />
      ) : (
        <div className="pdf-empty"><FileText size={32} /><p>A visualização local não está mais disponível.</p></div>
      )}
    </section>
  )
}
