import { useEffect, useMemo, useRef, useState } from 'react'
import {
  aprovarPedido,
  atualizarPedido,
  exportarExcel,
  getErrorMessage,
  listarPedidos,
  processarPdf,
} from '../services/api'

export function usePedido() {
  const [etapa, setEtapa] = useState('upload')
  const [pedidos, setPedidos] = useState([])
  const [pedidoIdsAtivos, setPedidoIdsAtivos] = useState([])
  const [pedidoAtual, setPedidoAtual] = useState(0)
  const [erro, setErro] = useState(null)
  const [processamento, setProcessamento] = useState(null)
  const [arquivo, setArquivo] = useState(null)
  const [arquivoUrl, setArquivoUrl] = useState(null)
  const [notificacao, setNotificacao] = useState(null)
  const [carregandoHistorico, setCarregandoHistorico] = useState(true)
  const controllerRef = useRef(null)
  const arquivoUrlRef = useRef(null)
  const pedidosAtivos = useMemo(() => {
    const byId = new Map(pedidos.map((pedido) => [pedido.id, pedido]))
    return pedidoIdsAtivos.map((id) => byId.get(id)).filter(Boolean)
  }, [pedidoIdsAtivos, pedidos])

  useEffect(() => () => {
    controllerRef.current?.abort()
    if (arquivoUrlRef.current) URL.revokeObjectURL(arquivoUrlRef.current)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    listarPedidos(controller.signal)
      .then(setPedidos)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setNotificacao({ type: 'error', message: `Histórico indisponível: ${getErrorMessage(error)}` })
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregandoHistorico(false)
      })
    return () => controller.abort()
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
      setPedidoIdsAtivos(lista.map((pedido) => pedido.id))
      setPedidoAtual(0)
      setPedidos((atuais) => {
        const ids = new Set(atuais.map((pedido) => pedido.id))
        const novos = lista.filter((pedido) => !ids.has(pedido.id))
        return [...novos, ...atuais]
      })
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
    setPedidoIdsAtivos([])
    setPedidoAtual(0)
    setEtapa('upload')
  }

  const abrirPedido = (id) => {
    const selecionado = pedidos.find((pedido) => pedido.id === id)
    if (!selecionado) return
    const grupo = pedidos.filter((pedido) => (
      pedido.processamentoId === selecionado.processamentoId
    ))
    const ids = grupo.map((pedido) => pedido.id)
    setPedidoIdsAtivos(ids)
    setPedidoAtual(Math.max(0, ids.indexOf(id)))
    if (arquivoUrlRef.current) URL.revokeObjectURL(arquivoUrlRef.current)
    arquivoUrlRef.current = null
    setArquivo(null)
    setArquivoUrl(null)
    setEtapa('revisao')
  }

  const salvarPedido = async (id, payload) => {
    try {
      const atualizado = await atualizarPedido(id, payload)
      setPedidos((atuais) => atuais.map((pedido) => (pedido.id === id ? atualizado : pedido)))
      setNotificacao({ type: 'success', message: 'Alterações salvas no pedido.' })
      return atualizado
    } catch (error) {
      setNotificacao({ type: 'error', message: getErrorMessage(error) })
      throw error
    }
  }

  const aprovar = async (id) => {
    try {
      const atualizado = await aprovarPedido(id)
      setPedidos((atuais) => atuais.map((pedido) => (pedido.id === id ? atualizado : pedido)))
      setNotificacao({ type: 'success', message: 'Pedido aprovado.' })
    } catch (error) {
      setNotificacao({ type: 'error', message: getErrorMessage(error) })
      return null
    }
  }

  const cancelar = () => {
    controllerRef.current?.abort()
    setEtapa('upload')
    setProcessamento(null)
  }

  return {
    etapa,
    pedidos,
    pedidosAtivos,
    pedidoAtual,
    setPedidoAtual,
    erro,
    processamento,
    arquivo,
    arquivoUrl,
    notificacao,
    carregandoHistorico,
    setNotificacao,
    processar,
    exportar,
    abrirPedido,
    salvarPedido,
    aprovar,
    reiniciar,
    cancelar,
  }
}
