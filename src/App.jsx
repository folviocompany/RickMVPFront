import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import { usePedido } from './hooks/usePedido'
import Dashboard from './pages/Dashboard'
import Extracta from './pages/Extracta'
import PedidosSessao from './pages/PedidosSessao'
import PlaceholderPage from './pages/PlaceholderPage'
import ProcessarPedido from './pages/ProcessarPedido'

export default function App() {
  const pedidoState = usePedido()

  return (
    <Routes>
      <Route element={<AppShell pedidoState={pedidoState} />}>
        <Route index element={<Dashboard />} />
        <Route path="extracta" element={<Extracta />} />
        <Route path="novo-pedido" element={<ProcessarPedido />} />
        <Route path="pedidos" element={<PedidosSessao mode="todos" />} />
        <Route path="revisoes" element={<PedidosSessao mode="revisoes" />} />
        <Route
          path="produtos"
          element={(
            <PlaceholderPage
              title="Produtos e correspondências"
              description="Consulte códigos BIC, códigos externos e confirme associações de produtos."
              dependency="O backend ainda não expõe endpoints de catálogo, busca ou confirmação de mapeamentos."
            />
          )}
        />
        <Route path="historico" element={<PedidosSessao mode="historico" />} />
        <Route
          path="configuracoes"
          element={(
            <PlaceholderPage
              title="Configurações"
              description="Visualize o ambiente e o estado das integrações do Extracta."
              dependency="O backend disponibiliza saúde do serviço, mas não expõe modelo, provedor ou configurações — e nenhuma chave será enviada ao navegador."
            />
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
