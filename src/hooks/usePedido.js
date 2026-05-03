import { useState } from 'react'
import { processarPdf, exportarExcel } from '../services/api'

export function usePedido() {
  const [etapa, setEtapa] = useState('upload') // upload | processando | revisao | erro
  const [pedido, setPedido] = useState(null)
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

      setPedido(resultado)
      setEtapa('revisao')
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao processar o PDF. Tente novamente.'
      setErro(msg)
      setEtapa('erro')
    }
  }

  const exportar = () => {
    if (pedido?.id) exportarExcel(pedido.id)
  }

  const reiniciar = () => {
    setPedido(null)
    setErro(null)
    setProgresso('')
    setEtapa('upload')
  }

  return { etapa, pedido, erro, progresso, processar, exportar, reiniciar }
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
