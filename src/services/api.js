import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 60000,
})

export const processarPdf = async (arquivo) => {
  const formData = new FormData()
  formData.append('arquivo', arquivo)
  const { data } = await api.post('/api/pedidos/processar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const buscarPedido = async (id) => {
  const { data } = await api.get(`/api/pedidos/${id}`)
  return data
}

export const exportarExcel = (id) => {
  window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/pedidos/${id}/exportar`, '_blank')
}

export default api
