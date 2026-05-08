import { useState, useRef } from 'react'

export default function UploadZone({ onArquivo }) {
  const [arrastando, setArrastando] = useState(false)
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    setArrastando(false)
    const arquivo = e.dataTransfer.files[0]
    if (arquivo?.type === 'application/pdf') onArquivo(arquivo)
  }

  const handleChange = (e) => {
    const arquivo = e.target.files[0]
    if (arquivo) onArquivo(arquivo)
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div>
          <h1 style={styles.titulo}>ADI</h1>
          <p style={styles.subtitulo}>Automação de Digitação de Pedidos</p>
        </div>
      </div>

      <div
        style={{
          ...styles.dropzone,
          ...(arrastando ? styles.arrastando : {}),
        }}
        onDragOver={(e) => { e.preventDefault(); setArrastando(true) }}
        onDragLeave={() => setArrastando(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={handleChange}
        />

        <div style={styles.iconeUpload}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>

        <p style={styles.dropTexto}>
          {arrastando ? 'Solte o PDF aqui' : 'Arraste o PDF do pedido'}
        </p>
        <p style={styles.dropSub}>ou clique para selecionar</p>

        <span style={styles.badge}>PDF até 20MB</span>
      </div>

      <div style={styles.dica}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>O sistema identifica o CNPJ automaticamente e converte os códigos do cliente para os da indústria.</span>
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 'var(--radius-md)',
    background: '#000',
    border: '1px solid var(--border-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 600,
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  subtitulo: {
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  dropzone: {
    border: '1.5px dashed rgba(0,255,135,0.3)',
    borderRadius: 'var(--radius-xl)',
    padding: '4rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'var(--bg-card)',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow-card)',
  },
  arrastando: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-glow)',
    boxShadow: 'var(--shadow-accent)',
    transform: 'scale(1.01)',
  },
  iconeUpload: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  dropTexto: {
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  dropSub: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginBottom: 20,
  },
  badge: {
    fontSize: 12,
    color: 'var(--accent)',
    background: 'transparent',
    border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-sm)',
    padding: '4px 12px',
    fontFamily: 'var(--font-mono)',
  },
  dica: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 20,
    padding: '12px 14px',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    border: '0.5px solid var(--border)',
  },
}
