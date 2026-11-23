import { Check, FileText, LoaderCircle, X } from 'lucide-react'

const steps = [
  { key: 'recebido', label: 'Documento recebido', min: 0 },
  { key: 'ocr', label: 'Leitura e OCR', min: 10 },
  { key: 'ia', label: 'Interpretação com IA', min: 30 },
  { key: 'mapa', label: 'Identificação de produtos', min: 70 },
  { key: 'fim', label: 'Validação dos dados', min: 95 },
]

export default function LoadingProcessamento({ processamento, arquivo, onCancel }) {
  const progress = Number(processamento?.progresso || 0)
  const message = processamento?.mensagem || 'Preparando processamento'

  return (
    <section className="processing-card" aria-live="polite">
      <div className="processing-heading">
        <div className="processing-file-icon"><FileText size={24} /></div>
        <div>
          <span className="eyebrow">Processamento em andamento</span>
          <h2>{arquivo?.name || 'Pedido em PDF'}</h2>
          <p>{message}</p>
        </div>
        <LoaderCircle className="spinner-icon" size={26} aria-hidden="true" />
      </div>

      <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-label="Progresso do processamento">
        <span style={{ width: `${Math.min(100, progress)}%` }} />
      </div>
      <div className="progress-meta"><span>Status informado pelo backend</span><strong>{progress}%</strong></div>

      <ol className="step-list">
        {steps.map((step, index) => {
          const completed = progress > (steps[index + 1]?.min ?? 100)
          const active = progress >= step.min && !completed
          return (
            <li key={step.key} className={`${completed ? 'is-complete' : ''} ${active ? 'is-active' : ''}`}>
              <span className="step-marker">{completed ? <Check size={14} /> : index + 1}</span>
              <span>{step.label}</span>
            </li>
          )
        })}
      </ol>

      <button className="button button-ghost" type="button" onClick={onCancel}><X size={16} /> Cancelar</button>
    </section>
  )
}
