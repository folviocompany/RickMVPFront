import { useEffect, useRef, useState } from 'react'
import { exportarExcel, getErrorMessage, processarPdf } from '../services/api'

export function usePedido() {
  const [etapa, setEtapa] = useState('upload')
  const [pedidos, setPedidos] = useState([])
  const [pedidoAtual, setPedidoAtual] = useState(0)
  const [erro, setErro] = useState(null)
  const [processamento, setProcessamento] = useState(null)
  const [arquivo, setArquivo] = useState(null)
  const [arquivoUrl, setArquivoUrl] = useState(null)
  const [notificacao, setNotificacao] = useState(null)
  const controllerRef = useRef(null)
  const arquivoUrlRef = useRef(null)

  useEffect(() => () => {
    controllerRef.current?.abort()
    if (arquivoUrlRef.current) URL.revokeObjectURL(arquivoUrlRef.current)
  }, [])

  const definirArquivo = (novoArquivo) => {
    if (arquivoUrlRef.current) URL.revokeObjectURL(arquivoUrlRef.current)
    const novaUrl = URL.createObjectURL(novoArquivo)
    arquivoUrlRef.current = novaUrl
    setArquivo(novoArquivo)
    setArquivoUrl(novaUrl)
  }

  const processar = async (novoArquivo) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    definirArquivo(novoArquivo)
    setEtapa('processando')
    setErro(null)
    setProcessamento({ status: 'ENVIANDO', progresso: 0, mensagem: 'Enviando o PDF' })

    try {
      const resultado = await processarPdf(novoArquivo, setProcessamento, controller.signal)
      const lista = (Array.isArray(resultado) ? resultado : [resultado])
        .filter((pedido) => pedido.itens?.length > 0)
      if (lista.length === 0) throw new Error('Nenhum pedido válido encontrado no PDF')
      setPedidos((atuais) => {
        const ids = new Set(atuais.map((pedido) => pedido.id))
        return [...atuais, ...lista.filter((pedido) => !ids.has(pedido.id))]
      })
      setPedidoAtual(0)
      setEtapa('revisao')
      setNotificacao({ type: 'success', message: `${lista.length} pedido(s) processado(s).` })
    } catch (error) {
      if (controller.signal.aborted) {
        setEtapa('upload')
        return
      }
      setErro(getErrorMessage(error))
      setEtapa('erro')
    }
  }

  const exportar = async (id) => {
    if (!id) return
    try {
      await exportarExcel(id)
      setPedidos((atuais) => atuais.map((pedido) => (
        pedido.id === id ? { ...pedido, status: 'EXPORTADO' } : pedido
      )))
      setNotificacao({ type: 'success', message: 'Planilha exportada com sucesso.' })
    } catch (error) {
      setNotificacao({ type: 'error', message: getErrorMessage(error) })
    }
  }

  const reiniciar = () => {
    controllerRef.current?.abort()
    setErro(null)
    setProcessamento(null)
    setEtapa('upload')
  }

  const cancelar = () => {
    controllerRef.current?.abort()
    setEtapa('upload')
    setProcessamento(null)
  }

  return {
    etapa,
    pedidos,
    pedidoAtual,
    setPedidoAtual,
    erro,
    processamento,
    arquivo,
    arquivoUrl,
    notificacao,
    setNotificacao,
    processar,
    exportar,
    reiniciar,
    cancelar,
  }
}
