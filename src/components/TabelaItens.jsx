export default function TabelaItens({ itens }) {
  const naoMapeados = itens.filter(i => !i.mapeado).length

  return (
    <div style={styles.wrapper}>
      <div style={styles.cabecalho}>
        <h3 style={styles.titulo}>Itens do pedido</h3>
        {naoMapeados > 0 && (
          <span style={styles.alerta}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {naoMapeados} {naoMapeados === 1 ? 'item sem mapeamento' : 'itens sem mapeamento'}
          </span>
        )}
      </div>

      <div style={styles.tabela}>
        <div style={styles.headerRow}>
          <span style={styles.headerCell}>Cód. cliente</span>
          <span style={styles.headerCell}>Cód. indústria</span>
          <span style={{ ...styles.headerCell, textAlign: 'center' }}>Qtd.</span>
          <span style={styles.headerCell}>Observação</span>
          <span style={{ ...styles.headerCell, textAlign: 'center' }}>Status</span>
        </div>

        {itens.map((item, index) => (
          <div
            key={item.id || index}
            style={{
              ...styles.row,
              background: item.mapeado ? 'transparent' : 'var(--bg-danger)',
              borderLeft: item.mapeado ? '3px solid transparent' : '3px solid var(--text-danger)',
            }}
          >
            <span style={{ ...styles.cell, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              {item.codigoOriginal || '—'}
            </span>

            <span style={{ ...styles.cell, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              {item.mapeado
                ? <span style={{ color: 'var(--text-primary)' }}>{item.codigoIndustria}</span>
                : <span style={{ color: 'var(--text-danger)', fontWeight: 500 }}>Não mapeado</span>
              }
            </span>

            <span style={{ ...styles.cell, textAlign: 'center', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
              {item.quantidade}
            </span>

            <span style={{ ...styles.cell, color: 'var(--text-secondary)', fontSize: 13 }}>
              {item.observacao || <span style={{ color: 'var(--text-muted)' }}>—</span>}
            </span>

            <span style={{ ...styles.cell, textAlign: 'center' }}>
              {item.mapeado
                ? <Chip cor="success">OK</Chip>
                : <Chip cor="danger">Revisar</Chip>
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Chip({ cor, children }) {
  const cores = {
    success: { bg: 'var(--bg-success)', text: 'var(--text-success)' },
    danger:  { bg: 'var(--bg-danger)',  text: 'var(--text-danger)' },
  }
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      padding: '3px 8px',
      borderRadius: 4,
      background: cores[cor].bg,
      color: cores[cor].text,
      letterSpacing: '0.03em',
    }}>
      {children}
    </span>
  )
}

const styles = {
  wrapper: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '0.5px solid var(--border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
  },
  cabecalho: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '0.5px solid var(--border)',
    gap: 12,
    flexWrap: 'wrap',
  },
  titulo: {
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  alerta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: 'var(--text-danger)',
    background: 'var(--bg-danger)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 500,
  },
  tabela: {
    overflowX: 'auto',
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 80px 1fr 80px',
    padding: '10px 20px',
    background: 'var(--bg-surface)',
    borderBottom: '0.5px solid var(--border)',
    gap: 12,
  },
  headerCell: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 80px 1fr 80px',
    padding: '12px 20px',
    borderBottom: '0.5px solid var(--border)',
    gap: 12,
    alignItems: 'center',
    transition: 'background 0.15s',
  },
  cell: {
    fontSize: 14,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}
