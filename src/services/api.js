import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

const aguardar = (ms, signal) => new Promise((resolve, reject) => {
  const timeout = window.setTimeout(resolve, ms)
  if (!signal) return
  signal.addEventListener('abort', () => {
    window.clearTimeout(timeout)
    reject(new DOMException('Operação cancelada', 'AbortError'))
  }, { once: true })
})

export function getErrorMessage(error) {
  if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
    return 'Processamento cancelado.'
  }
  const detail = error?.response?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || String(item)).join('; ')
  }
  return detail
    || error?.response?.data?.erro
    || error?.message
    || 'Não foi possível concluir a operação.'
}

export async function verificarSaude(signal) {
  const { data } = await api.get('/health', { signal, timeout: 8000 })
  return data
}

export async function buscarPedido(id, signal) {
  const { data } = await api.get(`/api/pedidos/${id}`, { signal })
  return data
}

export async function processarPdf(arquivo, onProgresso, signal) {
  const formData = new FormData()
  formData.append('arquivo', arquivo)
  const { data: processamentoInicial } = await api.post('/api/processamentos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal,
    timeout: 60000,
  })

  let processamento = processamentoInicial
  onProgresso?.(processamento)

  for (let tentativa = 0; tentativa < 240; tentativa += 1) {
    if (['CONCLUIDO', 'PARCIAL', 'ERRO'].includes(processamento.status)) break
    await aguardar(1000, signal)
    const { data } = await api.get(`/api/processamentos/${processamento.id}`, { signal })
    processamento = data
    onProgresso?.(processamento)
  }

  if (processamento.status === 'ERRO') {
    throw new Error(processamento.erro || 'Falha ao processar o PDF')
  }
  if (!['CONCLUIDO', 'PARCIAL'].includes(processamento.status)) {
    throw new Error('O processamento excedeu o tempo limite de 4 minutos')
  }

  const { data: resumos } = await api.get(
    `/api/processamentos/${processamento.id}/pedidos`,
    { signal },
  )
  return Promise.all(resumos.map(({ id }) => buscarPedido(id, signal)))
}

export async function exportarExcel(id) {
  const response = await api.get(`/api/pedidos/${id}/exportar`, {
    responseType: 'blob',
    timeout: 60000,
  })
  const contentDisposition = response.headers['content-disposition'] || ''
  const encodedName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const filename = encodedName ? decodeURIComponent(encodedName) : `pedido_${id}.xlsx`
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default api
