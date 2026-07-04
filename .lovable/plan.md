# AESGPTech — MVP PWA (Caderneta Digital Inteligente)

Vou construir o protótipo completo, mobile-first, seguindo a direção **Ledger Analógico** (fundo creme, tipografia Inter + JetBrains Mono, azul/verde/vermelho/amarelo semafóricos, botões largos e cards com bordas marcadas).

## Escopo (frontend puro, dados fictícios em memória)

Sem backend nesta fase — todo estado vive num store client-side (Zustand) já populado com dados de exemplo, para que todos os fluxos funcionem imediatamente.

## Design system

- Tokens em `src/styles.css`: `--paper (#fcfaf7)`, `--ink (#0f172a)`, `--ledger-blue (#1e40af)`, `--ledger-green (#15803d)`, `--ledger-red (#b91c1c)`, `--ledger-yellow (#a16207)`, radius maiores, sombra suave "papel".
- Fontes Inter + JetBrains Mono via `<link>` no `__root.tsx`.
- Animação `slide-up` de entrada em seções.

## Rotas (TanStack Router, file-based)

```
/login              → tela de autenticação simulada
/                   → Home (dashboard do lojista)
/vendas/nova        → Catálogo + carrinho
/vendas/cliente     → Vinculação de cliente com score
/vendas/pagamento   → Fechamento (Dinheiro/PIX/Cartão/Caderneta)
/estoque            → Lista com semáforo + botão flutuante
/estoque/novo       → Formulário simples de cadastro
/clientes           → Lista alfabética + filtro devedores
/clientes/$id       → Perfil com saldo, extrato, receber, WhatsApp
```

Barra de navegação inferior fixa (Home, Estoque, Clientes) presente em todas as rotas autenticadas via layout `_app`.

## Dados fictícios (Zustand store)

- **Produtos** (~8 itens): café, arroz, feijão, óleo, detergente, açúcar, farinha, refrigerante — com foto placeholder, preço, quantidade (variando para semáforo).
- **Clientes** (~6): mix de casos — Seu Manoel (14 compras, em dia), Dona Maria (dívida R$120 há 30 dias), Tiago (2 compras, novo), Sebastião (dívida ativa R$180), etc.
- **Vendas** do dia somando R$450 em caixa e R$180 a receber, para bater com o dashboard.
- **Alerta**: 3 clientes com atraso — clicando, navega para `/clientes?filtro=devedores`.

## Regras de negócio implementadas

**Score de confiança (tela de vínculo do cliente):**
- `compras < 5` → tag amarela + botão desabilitado + link "Desbloquear sob minha responsabilidade" (habilita botão).
- `compras >= 5 && sem dívida ativa` → tag verde + botão liberado.
- `dividaAtiva > 0` → tag vermelha "🚨 Dívida Ativa" (sobrepõe as demais).

**Semáforo estoque:** `qty > 5` verde, `qty <= 5` vermelho.

**Nova venda:**
- Catálogo com stepper `- N +`, busca no topo.
- Botão inferior sticky "Avançar para Cliente (R$ Total)" com total reativo.
- Pagamento: 4 botões grandes; ao concluir, subtrai quantidades do estoque, registra venda, atualiza caixa/caderneta, retorna à Home com toast de sucesso.

**Receber pagamento:** modal com input R$, atualiza saldo do cliente + soma ao caixa do dia.

**WhatsApp:** gera link `https://wa.me/55<telefone>?text=<mensagem>` com nome e saldo, abre em nova aba.

## Autenticação simulada

Login aceita qualquer email/senha (validação básica de formato); grava flag `isAuthed` no store; layout `_app` redireciona para `/login` se não autenticado. Botão "Sair" no header.

## Arquivos principais a criar

- `src/styles.css` — tokens do design system atualizados.
- `src/routes/__root.tsx` — fontes, meta pt-BR, título "AESGPTech".
- `src/routes/login.tsx`
- `src/routes/_app.tsx` — layout autenticado + bottom nav.
- `src/routes/_app/index.tsx` — Home.
- `src/routes/_app/vendas.nova.tsx`, `vendas.cliente.tsx`, `vendas.pagamento.tsx`
- `src/routes/_app/estoque.index.tsx`, `estoque.novo.tsx`
- `src/routes/_app/clientes.index.tsx`, `clientes.$id.tsx`
- `src/store/app-store.ts` — Zustand com produtos/clientes/vendas/caixa/auth.
- `src/lib/seed-data.ts` — dados fictícios iniciais.
- `src/components/` — `BottomNav`, `LedgerCard`, `MoneyDisplay`, `TrustBadge`, `StockBadge`, `BigButton`, `QuantityStepper`, `ProductRow`, `ClientRow`.
- Placeholders de fotos de produto geradas via `data-lov-image-placeholder` (café, arroz, óleo etc.) processadas para `src/assets/`.

## Detalhes técnicos

- PWA: apenas manifesto + ícones (instalável) — sem service worker offline nesta fase, conforme diretriz.
- Formatação R$ via `Intl.NumberFormat('pt-BR')`.
- Sem backend: mudanças de estado são in-memory (perdidas ao recarregar) — adequado para MVP de demonstração.

Ao final, todos os fluxos descritos serão navegáveis com dados populados.
