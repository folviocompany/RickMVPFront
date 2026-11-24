export function calcularTotalItem(item) {
  if (item?.valorTotal !== null && item?.valorTotal !== undefined && item?.valorTotal !== '') {
    return Number(item.valorTotal) || 0
  }
  return (Number(item?.quantidade) || 0) * (Number(item?.valorUnitario) || 0)
}

export function calcularTotalPedido(pedido) {
  if (pedido?.totalValor !== null && pedido?.totalValor !== undefined) {
    return Number(pedido.totalValor) || 0
  }
  return (pedido?.itens || []).reduce((total, item) => total + calcularTotalItem(item), 0)
}

export function calcularTotalPedidos(pedidos) {
  return pedidos.reduce((total, pedido) => total + calcularTotalPedido(pedido), 0)
}

export function formatarMoeda(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
