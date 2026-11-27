# DataPulse — Dashboard de Análise de Vendas

Dashboard web interativo para explorar uma base demonstrativa de vendas. O projeto foi desenvolvido como peça de portfólio para demonstrar fundamentos de análise e visualização de dados.

## Funcionalidades
- Indicadores: faturamento, quantidade de pedidos, ticket médio e unidades vendidas.
- Filtros combináveis por período, categoria e região.
- Gráficos de evolução mensal, faturamento por categoria e por região.
- Tabela com os registros filtrados.
- Exportação dos dados filtrados para CSV.
- Layout responsivo para desktop e celular.

## Tecnologias
- HTML5
- CSS3
- JavaScript (ES6)
- Chart.js
- CSV

## Como executar
**Opção 1 — GitHub Pages:** envie os arquivos para um repositório público e ative *Settings → Pages → Deploy from a branch → main / root*. Depois, abra o endereço publicado.

**Opção 2 — Execução local:** como o navegador bloqueia `fetch()` de arquivos locais em alguns cenários, execute um servidor na pasta do projeto (por exemplo, `python -m http.server 8000`) e abra `http://localhost:8000`.

## Estrutura
```text
datapulse-dashboard/
├── index.html
├── style.css
├── script.js
├── data/
│   └── vendas.csv
└── README.md
```

## Sobre os dados
`data/vendas.csv` contém 216 registros sintéticos, criados exclusivamente para demonstração. Não representam uma empresa real nem dados de clientes. O faturamento é calculado a partir de quantidade × preço unitário.

## Perguntas que o painel ajuda a investigar
1. Como o faturamento varia ao longo dos meses?
2. Qual categoria representa a maior parcela da receita?
3. Qual região apresenta maior faturamento?
4. Como os filtros alteram ticket médio e volume de pedidos?

## Próximas melhorias
- Importação de arquivos CSV pelo usuário.
- Comparação entre períodos.
- Indicadores de crescimento mês a mês.
- Testes automatizados e documentação das regras de negócio.
