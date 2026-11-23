import { useRef, useState } from 'react'
import { CheckCircle2, FileText, UploadCloud, X } from 'lucide-react'
import { validatePdf } from '../utils/fileValidation'

export default function UploadZone({ onArquivo }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const selectFile = (candidate) => {
    const validation = validatePdf(candidate)
    setError(validation)
    setFile(validation ? null : candidate)
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    selectFile(event.dataTransfer.files[0])
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <section className="upload-card">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${error ? 'has-error' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Selecionar arquivo PDF"
        onClick={() => inputRef.current?.click()}
        onKeyDown={onKeyDown}
        onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => selectFile(event.target.files[0])}
          hidden
        />
        <div className="upload-icon"><UploadCloud size={29} /></div>
        <h3>{dragging ? 'Solte o documento aqui' : 'Arraste o PDF do pedido'}</h3>
        <p>ou clique para procurar no computador</p>
        <span className="file-rule">PDF · máximo de 20 MB · um arquivo por vez</span>
      </div>

      {error && <p className="field-error" role="alert">{error}</p>}

      {file && (
        <div className="selected-file" aria-live="polite">
          <div className="selected-file-icon"><FileText size={22} /></div>
          <div>
            <strong>{file.name}</strong>
            <span>{formatBytes(file.size)} · pronto para processar</span>
          </div>
          <CheckCircle2 className="selected-check" size={20} />
          <button type="button" className="icon-button" aria-label="Remover arquivo" onClick={(event) => { event.stopPropagation(); setFile(null) }}><X size={18} /></button>
        </div>
      )}

      <div className="upload-footer">
        <div className="privacy-note">
          <strong>Processamento seguro</strong>
          <span>O documento é enviado ao backend configurado e processado pela integração de IA.</span>
        </div>
        <button className="button button-primary button-large" type="button" disabled={!file} onClick={() => onArquivo(file)}>
          Processar pedido
        </button>
      </div>
    </section>
  )
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
