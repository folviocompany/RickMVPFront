import { useState } from 'react'
import { processarPdf, exportarExcel } from '../services/api'

export function usePedido() {
  const [etapa, setEtapa] = useState('upload') // upload | processando | revisao | erro
  const [pedidos, setPedidos] = useState([])
  const [pedidoAtual, setPedidoAtual] = useState(0)
  const [erro, setErro] = useState(null)
  const [progresso, setProgresso] = useState('')

  const processar = async (arquivo) => {
    try {
      setEtapa('processando')
      setErro(null)

      setProgresso('Lendo o PDF...')
      await delay(600)

      setProgresso('Enviando para a IA...')
      const resultado = await processarPdf(arquivo)

      setProgresso('Convertendo códigos...')
      await delay(400)

      const lista = Array.isArray(resultado) ? resultado : [resultado]
      const validos = lista.filter(p => p.itens && p.itens.length > 0)

      if (validos.length === 0) {
        throw new Error('Nenhum pedido válido encontrado no PDF')
      }

      setPedidos(validos)
      setPedidoAtual(0)
      setEtapa('revisao')
    } catch (err) {
      const msg = err.response?.data?.erro || err.message || 'Erro ao processar o PDF. Tente novamente.'
      setErro(msg)
      setEtapa('erro')
    }
  }

  const exportar = (id) => {
    if (id) exportarExcel(id)
  }

  const reiniciar = () => {
    setPedidos([])
    setPedidoAtual(0)
    setErro(null)
    setProgresso('')
    setEtapa('upload')
  }

  return { etapa, pedidos, pedidoAtual, setPedidoAtual, erro, progresso, processar, exportar, reiniciar }
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
