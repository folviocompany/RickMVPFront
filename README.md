# ADI Frontend

Interface React + Vite do ADI (Automação de Digitação de Pedidos), integrada ao backend Python/FastAPI.

## Funcionalidades disponíveis

- Dashboard com métricas reais da sessão atual.
- Status do serviço por meio de `GET /health`.
- Upload individual de PDF com validação de tipo e limite de 20 MB.
- Acompanhamento assíncrono do processamento.
- Conferência lado a lado do PDF original e dos dados extraídos.
- Listagem de itens e indicação de produtos sem mapeamento.
- Exportação do pedido em Excel.

Telas de histórico, catálogo, edição e configurações exibem explicitamente as dependências de backend ainda ausentes; não são preenchidas com dados fictícios.

## Rodar localmente

```bash
npm install
copy .env.example .env
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.

## Variável de ambiente

```env
VITE_API_URL=http://localhost:8080
```

## Qualidade

```bash
npm run lint
npm test
npm run build
```

## Contratos usados

- `GET /health`
- `POST /api/processamentos`
- `GET /api/processamentos/{id}`
- `GET /api/processamentos/{id}/pedidos`
- `GET /api/pedidos/{id}`
- `GET /api/pedidos/{id}/exportar`
