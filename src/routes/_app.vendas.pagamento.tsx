import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Banknote, BookOpen, CreditCard, Lock, Smartphone, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/ledger/PageHeader";
import { useApp, type PaymentMethod } from "@/store/app-store";
import { brl } from "@/lib/format";
import type { Client } from "@/lib/seed-data";

const searchSchema = z.object({
  semCliente: z.boolean().optional(),
  aVista: z.boolean().optional(),
});

export const Route = createFileRoute("/_app/vendas/pagamento")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Pagamento,
});

// ✅ FUNÇÃO: Determina o score (status) do cliente
type Score = "confiavel" | "recente" | "divida";
function scoreFor(c: Client): Score {
  if (c.debt > 0) return "divida";
  if (c.purchases < 5) return "recente";
  return "confiavel";
}

// ✅ FUNÇÃO: Verifica se caderneta está bloqueada naturalmente
function isCadernettaBlocked(score: Score): boolean {
  return score === "divida" || score === "recente";
}

function Pagamento() {
  const { semCliente, aVista } = Route.useSearch();
  const products = useApp((s) => s.products);
  const cart = useApp((s) => s.cart);
  const cartTotal = useApp((s) => s.cartTotal)();
  const selectedId = useApp((s) => s.selectedClientId);
  const clients = useApp((s) => s.clients);
  const finalizeSale = useApp((s) => s.finalizeSale);
  const cadernetaUnlocked = useApp((s) => s.cadernetaUnlocked);
  const navigate = useNavigate();

  // Estado para controlar seleção de tipo de cartão
  const [showCardTypeSelector, setShowCardTypeSelector] = useState(false);

  const client = clients.find((c) => c.id === selectedId);
  const clientScore = client ? scoreFor(client) : null;

  // ✅ LÓGICA COMPLETA: Caderneta só é permitida se:
  // 1. Existe cliente vinculado
  // 2. Não é venda sem cliente
  // 3. OU cliente é confiável OU caderneta foi desbloqueada manualmente
  const canCaderneta = 
    !!client && 
    !semCliente && 
    (
      !clientScore || 
      !isCadernettaBlocked(clientScore) || 
      cadernetaUnlocked
    );

  const pay = (method: PaymentMethod) => {
    // ✅ VALIDAÇÃO: Impedir caderneta se estiver bloqueada
    if (method === "caderneta" && !canCaderneta) {
      toast.error(
        "Caderneta está bloqueada para este cliente. Desbloqueie na tela anterior ou escolha outra forma de pagamento.",
      );
      return;
    }

    finalizeSale(method);
    toast.success(
      method === "caderneta"
        ? `Venda de ${brl(cartTotal)} adicionada à caderneta de ${client?.name}.`
        : `Venda de ${brl(cartTotal)} concluída em ${labelFor(method)}.`,
    );
    navigate({ to: "/" });
  };

  // ✅ FUNÇÃO PARA PROCESSAMENTO DE CARTÃO
  const handleCardClick = () => {
    setShowCardTypeSelector(true);
  };

  // ✅ BOTÕES: Com informações sobre bloqueio
  const buttons: {
    method: PaymentMethod;
    label: string;
    icon: typeof Banknote;
    color: string;
    disabled?: boolean;
    blockedReason?: string;
    isCard?: boolean; // Novo: identifica botão de cartão
  }[] = [
    { 
      method: "dinheiro", 
      label: "Dinheiro", 
      icon: Banknote, 
      color: "bg-ledger-green" 
    },
    { 
      method: "pix", 
      label: "PIX", 
      icon: Smartphone, 
      color: "bg-ledger-blue" 
    },
    { 
      method: "cartao_credito", // Temporário - será substituído pelo seletor
      label: "Cartão", 
      icon: CreditCard, 
      color: "bg-ink",
      isCard: true, // Novo: marca como botão de cartão
    },
    {
      method: "caderneta",
      label: "Adicionar à Caderneta",
      icon: BookOpen,
      color: "bg-ledger-yellow",
      disabled: !canCaderneta,
      // ✅ MENSAGEM: Motivo do bloqueio
      blockedReason: 
        semCliente 
          ? "Sem cliente vinculado"
          : !client 
          ? "Selecione um cliente"
          : clientScore && isCadernettaBlocked(clientScore) && !cadernetaUnlocked
          ? clientScore === "recente" 
            ? "Cliente recente (< 5 compras)"
            : "Cliente com dívida ativa"
          : undefined,
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Fechamento" 
        subtitle="Escolha o pagamento" 
        back={aVista ? "/vendas/cliente" : "/vendas/cliente"} 
      />

      <div className="animate-entry mb-6 rounded-2xl border-2 border-ink bg-white p-6 text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/40">
          Total da Venda
        </p>
        <p className="mt-1 text-6xl font-black tracking-tighter">{brl(cartTotal)}</p>
        {client && (
          <p className="mt-3 font-mono text-xs text-ink/60">
            Cliente: <span className="font-bold text-ink">{client.name}</span>
            {/* ✅ STATUS DO CLIENTE */}
            {clientScore && (
              <span className={`ml-2 inline-block rounded px-2 py-1 text-[10px] font-bold uppercase ${
                clientScore === "confiavel" 
                  ? "bg-ledger-green/20 text-ledger-green"
                  : clientScore === "recente"
                  ? "bg-ledger-yellow/20 text-ledger-yellow"
                  : "bg-ledger-red/20 text-ledger-red"
              }`}>
                {clientScore === "confiavel" ? "✓ Confiável" : 
                 clientScore === "recente" ? "⚠️ Recente" : 
                 "🚨 Com Dívida"}
              </span>
            )}
          </p>
        )}
        {semCliente && (
          <p className="mt-3 font-mono text-xs text-ink/60">
            <span className="font-bold text-ledger-blue">Venda sem cliente vinculado</span>
          </p>
        )}
        {aVista && (
          <p className="mt-3 font-mono text-xs text-ink/60">
            <span className="font-bold text-ledger-green">Pagamento à vista</span>
          </p>
        )}
      </div>

      <div className="animate-entry mb-6 space-y-2 [animation-delay:80ms]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40">
          Itens ({cart.length})
        </p>
        {cart.map((item) => {
          const p = products.find((x) => x.id === item.productId)!;
          return (
            <div
              key={item.productId}
              className="flex items-center justify-between border-b border-ink/5 py-2 text-sm"
            >
              <span className="truncate">
                <span className="font-mono font-bold">{item.qty}×</span> {p.name}
              </span>
              <span className="font-mono font-bold">{brl(p.price * item.qty)}</span>
            </div>
          );
        })}
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL: Mostrar seletor de tipo de cartão ou botões normais */}
      {!showCardTypeSelector ? (
        <div className="animate-entry space-y-3 [animation-delay:160ms]">
          {buttons.map(({ method, label, icon: Icon, color, disabled, blockedReason, isCard }) => (
            <div key={method}>
              <button
                onClick={() => isCard ? handleCardClick() : pay(method)}
                disabled={disabled}
                className={`flex h-16 w-full items-center justify-between rounded-2xl px-6 font-black uppercase tracking-tight text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/40 ${color}`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-6" strokeWidth={2.5} />
                  <span>{label}</span>
                </span>
                {disabled && method === "caderneta" && (
                  <Lock className="size-5" />
                )}
              </button>
              {/* ✅ MOTIVO DO BLOQUEIO */}
              {disabled && blockedReason && (
                <p className="mt-1 text-center font-mono text-[11px] font-bold text-ink/50">
                  {blockedReason}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        // ✅ NOVO: Seletor secundário de tipo de cartão
        <div className="animate-entry space-y-3 [animation-delay:160ms]">
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => setShowCardTypeSelector(false)}
              className="flex items-center gap-1 text-xs font-bold text-ink/60 hover:text-ink transition-colors"
            >
              <ChevronLeft className="size-4" /> Voltar
            </button>
            <p className="text-xs font-bold text-ink/60">Escolha o tipo de cartão</p>
          </div>

          <button
            onClick={() => pay("cartao_credito")}
            className="flex h-16 w-full items-center justify-between rounded-2xl bg-ink px-6 font-black uppercase tracking-tight text-white shadow-lg shadow-ink/20 transition-all hover:bg-ink/90 hover:shadow-xl active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <CreditCard className="size-6" strokeWidth={2.5} />
              <span>Cartão de Crédito</span>
            </span>
          </button>

          <button
            onClick={() => pay("cartao_debito")}
            className="flex h-16 w-full items-center justify-between rounded-2xl bg-ink px-6 font-black uppercase tracking-tight text-white shadow-lg shadow-ink/20 transition-all hover:bg-ink/90 hover:shadow-xl active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <CreditCard className="size-6" strokeWidth={2.5} />
              <span>Cartão de Débito</span>
            </span>
          </button>
        </div>
      )}

      {/* ✅ AVISO: Se caderneta está desbloqueada manualmente */}
      {cadernetaUnlocked && client && clientScore && isCadernettaBlocked(clientScore) && (
        <div className="mt-6 rounded-2xl border-2 border-ledger-blue bg-ledger-blue/5 p-4">
          <p className="flex items-center gap-2 font-black uppercase text-ledger-blue">
            <BookOpen className="size-5" /> Caderneta Desbloqueada Manualmente
          </p>
          <p className="mt-2 text-sm text-ink/70">
            Você desbloqueou a caderneta para este cliente sob sua responsabilidade. 
            Esta venda será registrada como crédito.
          </p>
        </div>
      )}
    </div>
  );
}

function labelFor(m: PaymentMethod) {
  if (m === "dinheiro") return "dinheiro";
  if (m === "pix") return "PIX";
  if (m === "cartao_credito") return "cartão de crédito";
  if (m === "cartao_debito") return "cartão de débito";
  return "caderneta";
}