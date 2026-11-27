# Extracta

Falhas e interrupções podem ser reprocessadas pelo botão `Reprocessar este documento`, preservando o mesmo registro. Quando a recuperação NVIDIA estiver explicitamente habilitada no backend, sugestões aparecem com a página e o texto de origem. A opção `Usar sugestão na edição` preenche apenas o rascunho; salvar e aprovar continuam sendo ações separadas.

A opção `Processar lote`, em `http://localhost:5173/extracta`, permite selecionar vários PDFs e acompanhar o resultado individual de cada documento. Os dados mostram a página de origem, código e embalagem originais, pendências e os totais dos produtos e do pedido separadamente.

O novo agente trabalha com OCR local e exige o Tesseract instalado no backend. Seus lotes ficam no PostgreSQL e podem ser reabertos na opção `Histórico`. A conferência permite corrigir os dados, registrar responsável e justificativa, aprovar e exportar um documento ou todo o lote.

Editar um documento aprovado exige nova aprovação. As evidências e os valores extraídos continuam preservados. O Excel tem abas de pedidos, itens, pendências, auditoria e evidências. Seu formato é provisório e ainda não foi validado para importação no Salesforce.

Este repositório contém a interface do sistema de automação e conferência de pedidos. O frontend foi desenvolvido em React e oferece uma experiência simples para enviar documentos, acompanhar o processamento, revisar os dados extraídos e gerar a planilha final.

## Tecnologias utilizadas

1. React
2. Vite
3. React Router
4. Axios
5. Lucide React
6. Vitest e Testing Library

## Preparação do ambiente

Abra um terminal nesta pasta e instale as dependências.

```powershell
npm install
```

Se desejar informar o endereço do backend manualmente, crie o arquivo `.env` a partir do exemplo.

```powershell
Copy-Item .env.example .env
```

Para o funcionamento local, utilize a configuração abaixo.

```env
VITE_API_URL=http://localhost:8080
```

Quando essa variável não é informada, a aplicação também utiliza `http://localhost:8080` como endereço padrão.

## Execução local

Inicie o frontend com o comando abaixo.

```powershell
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.

O backend deve estar em execução na porta `8080` para que o processamento e o histórico funcionem.

## Funcionalidades disponíveis

1. Painel com quantidade de pedidos, itens, revisões e valores financeiros
2. Envio individual de arquivos PDF
3. Acompanhamento do progresso do processamento
4. Visualização do documento ao lado dos dados extraídos
5. Separação dos pedidos pelo arquivo que originou o processamento
6. Navegação apenas entre pedidos pertencentes ao mesmo PDF
7. Histórico persistente
8. Edição dos dados gerais e dos itens
9. Recálculo automático dos valores durante a edição
10. Aprovação dos pedidos conferidos
11. Exportação em Excel
12. Layout adaptado para computadores, notebooks, tablets e celulares

## Fluxo de utilização

1. Acesse a opção `Novo pedido`.
2. Escolha um arquivo PDF.
3. Aguarde a leitura e a extração dos dados.
4. Compare as informações apresentadas com o documento original.
5. Use a opção `Editar dados` quando alguma informação precisar de correção.
6. Salve as alterações antes de aprovar ou exportar.
7. Aprove o pedido depois da conferência.
8. Exporte a planilha Excel.

O histórico organiza os registros pelo nome do arquivo. Quando um PDF possui mais de um pedido, as setas de navegação percorrem apenas os pedidos encontrados naquele documento.

## Cálculos financeiros

O valor total de cada item utiliza o campo extraído do documento. Quando esse campo não está disponível, a aplicação calcula a quantidade multiplicada pelo valor unitário.

O sistema apresenta o total de cada pedido, o subtotal de cada documento e a soma de todos os pedidos carregados do histórico.

## Testes e qualidade

Use os comandos abaixo para validar o projeto.

```powershell
npm test
npm run lint
npm run build
```

Os testes verificam os componentes principais, os cálculos financeiros, a edição e o agrupamento dos pedidos por documento.

## Demonstração local

Para uma apresentação, mantenha dois terminais abertos. Em um deles execute o backend com `python run.py`. No outro execute o frontend com `npm run dev`.

Antes de iniciar a demonstração, confirme que o indicador de serviço disponível aparece no topo da aplicação. Em seguida, processe um PDF, revise os dados, mostre o cálculo dos valores e exporte a planilha.
