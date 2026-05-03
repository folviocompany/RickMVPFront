# ADI Frontend — React + Vite

Interface de upload e revisão de pedidos do sistema ADI.

## Rodar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Acessa em `http://localhost:5173`.

## Variáveis de ambiente

```
VITE_API_URL=http://localhost:8080   # URL do backend Spring Boot
```

## Build para produção

```bash
npm run build
```

## Deploy (Vercel)

1. Importa o repositório no [vercel.com](https://vercel.com)
2. Framework: **Vite**
3. Adiciona a variável `VITE_API_URL` apontando para o Render

## Estrutura

```
src/
├── components/
│   ├── UploadZone.jsx          ← drag & drop do PDF
│   ├── LoadingProcessamento.jsx ← etapas animadas
│   ├── PedidoResumo.jsx        ← cards com info do pedido
│   └── TabelaItens.jsx         ← listagem com itens não mapeados
├── hooks/
│   └── usePedido.js            ← estado e lógica do fluxo
├── pages/
│   └── ProcessarPedido.jsx     ← página principal
├── services/
│   └── api.js                  ← chamadas ao backend
└── main.jsx
```
# ADIRickFront
