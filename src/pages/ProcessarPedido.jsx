import UploadZone from '../components/UploadZone'
import LoadingProcessamento from '../components/LoadingProcessamento'
import PedidoResumo from '../components/PedidoResumo'
import TabelaItens from '../components/TabelaItens'
import { usePedido } from '../hooks/usePedido'

export default function ProcessarPedido() {
  const { etapa, pedidos, erro, progresso, processar, exportar, reiniciar } = usePedido()

  return (
    <div style={styles.pagina}>
      <div style={styles.container}>

        {etapa === 'upload' && (
          <UploadZone onArquivo={processar} />
        )}

        {etapa === 'processando' && (
          <LoadingProcessamento progresso={progresso} />
        )}

        {etapa === 'revisao' && pedidos.length > 0 && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={styles.barraAcoes}>
              <button onClick={reiniciar} style={styles.btnSecundario}>
                ← Novo PDF
              </button>
              {pedidos.length > 1 && (
                <span style={styles.contadorPedidos}>
                  {pedidos.length} pedidos encontrados
                </span>
              )}
            </div>

            {pedidos.map((pedido) => (
              <div key={pedido.id} style={styles.pedidoBloco}>
                <PedidoResumo pedido={pedido} />
                <TabelaItens itens={pedido.itens || []} />

                <div style={styles.pedidoRodape}>
                  {pedido.itensSemMapeamento > 0 && (
                    <div style={styles.avisoMapeamento}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span>
                        {pedido.itensSemMapeamento} {pedido.itensSemMapeamento === 1 ? 'item sem mapeamento será exportado' : 'itens sem mapeamento serão exportados'} com linha vermelha para revisão manual.
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => exportar(pedido.id)}
                    style={styles.btnPrimario}
                  >
                    Exportar Excel
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {etapa === 'erro' && (
          <div style={styles.erroContainer}>
            <div style={styles.erroIcone}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-danger)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3 style={styles.erroTitulo}>Erro ao processar</h3>
            <p style={styles.erroMsg}>{erro}</p>
            <button onClick={reiniciar} style={styles.btnPrimario}>
              Tentar novamente
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  pagina: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '2.5rem 1rem',
  },
  container: {
    width: '100%',
    maxWidth: 1100,
  },
  barraAcoes: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  btnSecundario: {
    fontSize: 13,
    padding: '8px 16px',
    background: 'var(--bg-card)',
    border: '0.5px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-main)',
  },
  btnPrimario: {
    fontSize: 13,
    fontWeight: 500,
    padding: '8px 18px',
    background: 'var(--text-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'var(--font-main)',
    opacity: 1,
  },
  contadorPedidos: {
    fontSize: 13,
    color: 'var(--text-muted)',
    fontWeight: 400,
  },
  pedidoBloco: {
    marginBottom: 32,
  },
  pedidoRodape: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  avisoMapeamento: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '12px 14px',
    background: '#FFFBEB',
    border: '0.5px solid rgba(180,83,9,0.2)',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
    color: '#92400E',
    lineHeight: 1.5,
  },
  erroContainer: {
    textAlign: 'center',
    padding: '3rem 2rem',
    animation: 'fadeUp 0.3s ease',
  },
  erroIcone: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'var(--bg-danger)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  erroTitulo: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 8,
    color: 'var(--text-primary)',
  },
  erroMsg: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    marginBottom: 24,
    maxWidth: 360,
    margin: '0 auto 24px',
  },
}
