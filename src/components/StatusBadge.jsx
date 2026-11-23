const statusMap = {
  APROVADO: { label: 'Identificado', tone: 'success' },
  CONCLUIDO: { label: 'Concluído', tone: 'success' },
  EXPORTADO: { label: 'Exportado', tone: 'blue' },
  REVISAO: { label: 'Revisar', tone: 'warning' },
  ERRO: { label: 'Erro', tone: 'danger' },
}

export default function StatusBadge({ status, mapped }) {
  const config = mapped === false
    ? { label: 'Não identificado', tone: 'danger' }
    : statusMap[status] || { label: status || 'Pendente', tone: 'neutral' }
  return <span className={`status-badge tone-${config.tone}`}>{config.label}</span>
}
