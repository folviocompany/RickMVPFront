export default function LoadingProcessamento({ progresso }) {
  const etapas = ['Lendo o PDF...', 'Enviando para a IA...', 'Convertendo códigos...']
  const atual = etapas.indexOf(progresso)

  return (
    <div style={styles.container}>
      <div style={styles.spinner} />

      <h2 style={styles.titulo}>Processando pedido</h2>

      <div style={styles.etapas}>
        {etapas.map((etapa, i) => {
          const concluida = i < atual
          const ativa = i === atual
          return (
            <div key={etapa} style={{ ...styles.etapa, ...(ativa ? styles.etapaAtiva : {}) }}>
              <div style={{
                ...styles.etapaDot,
                background: concluida ? 'var(--text-success)' : ativa ? 'var(--text-primary)' : 'var(--border-strong)',
              }}>
                {concluida && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                )}
              </div>
              <span style={{
                fontSize: 13,
                color: ativa ? 'var(--text-primary)' : concluida ? 'var(--text-success)' : 'var(--text-muted)',
                fontWeight: ativa ? 500 : 400,
              }}>
                {etapa}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '3rem 2rem',
    animation: 'fadeUp 0.3s ease',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '2.5px solid var(--border)',
    borderTopColor: 'var(--text-primary)',
    borderRadius: '50%',
    margin: '0 auto 24px',
    animation: 'spin 0.8s linear infinite',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: 28,
  },
  etapas: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 260,
    margin: '0 auto',
    textAlign: 'left',
  },
  etapa: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  etapaAtiva: {
    animation: 'pulse 1.5s ease infinite',
  },
  etapaDot: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s ease',
  },
}
