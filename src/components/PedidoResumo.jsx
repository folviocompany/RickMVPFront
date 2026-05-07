export default function PedidoResumo({ pedido }) {
  const statusCor = pedido.status === 'REVISAO'
    ? { bg: 'var(--bg-danger)', text: 'var(--text-danger)', label: 'Revisão necessária' }
    : { bg: 'var(--bg-success)', text: 'var(--text-success)', label: 'Pronto para exportar' }

  return (
    <div style={styles.container}>
      <div style={styles.cabecalho}>
        <div>
          <p style={styles.label}>Pedido processado</p>
          <h2 style={styles.numero}>#{pedido.numeroPdf || 'S/N'}</h2>
        </div>
        <span style={{ ...styles.status, background: statusCor.bg, color: statusCor.text }}>
          {statusCor.label}
        </span>
      </div>

      <div style={styles.grid}>
        <Card label="Cliente" valor={pedido.nomeCliente} sub={formatarCnpj(pedido.cnpjCliente)} />
        <Card label="Arquivo" valor={pedido.arquivoNome} />
        <Card
          label="Itens"
          valor={`${pedido.totalItens} itens`}
          sub={pedido.itensSemMapeamento > 0
            ? `${pedido.itensSemMapeamento} sem mapeamento`
            : 'Todos mapeados'}
          subCor={pedido.itensSemMapeamento > 0 ? 'var(--text-danger)' : 'var(--text-success)'}
        />
        <Card label="Prazo pagamento" valor={pedido.prazoPagemento ? `${pedido.prazoPagemento} dias` : '—'} />
        <Card label="Data emissão" valor={pedido.dataEmissao || '—'} />
        <Card label="Prev. entrega" valor={pedido.previsaoEntrega || '—'} />
        <Card label="Limite entrega" valor={pedido.dataLimiteEntrega || '—'} />
        <Card label="Frete" valor={pedido.condicaoFrete || '—'} />
      </div>
    </div>
  )
}

function Card({ label, valor, sub, subCor }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={styles.cardValor}>{valor || '—'}</p>
      {sub && <p style={{ ...styles.cardSub, color: subCor || 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

function formatarCnpj(cnpj) {
  if (!cnpj) return ''
  const s = cnpj.replace(/\D/g, '')
  if (s.length !== 14) return cnpj
  return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5,8)}/${s.slice(8,12)}-${s.slice(12)}`
}

const styles = {
  container: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '0.5px solid var(--border)',
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: 'var(--shadow-card)',
  },
  cabecalho: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  numero: {
    fontSize: 20,
    fontWeight: 600,
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
    fontFamily: 'var(--font-mono)',
  },
  status: {
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 12px',
    borderRadius: 'var(--radius-sm)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 10,
  },
  card: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
  },
  cardLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  cardValor: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardSub: {
    fontSize: 12,
  },
}
