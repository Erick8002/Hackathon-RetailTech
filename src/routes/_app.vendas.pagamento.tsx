import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Banknote, BookOpen, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/ledger/PageHeader";
import { useApp, type PaymentMethod } from "@/store/app-store";
import { brl } from "@/lib/format";

const searchSchema = z.object({
  semCliente: z.boolean().optional(),
});

export const Route = createFileRoute("/_app/vendas/pagamento")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Pagamento,
});

function Pagamento() {
  const { semCliente } = Route.useSearch();
  const products = useApp((s) => s.products);
  const cart = useApp((s) => s.cart);
  const cartTotal = useApp((s) => s.cartTotal)();
  const selectedId = useApp((s) => s.selectedClientId);
  const clients = useApp((s) => s.clients);
  const finalizeSale = useApp((s) => s.finalizeSale);
  const navigate = useNavigate();

  const client = clients.find((c) => c.id === selectedId);
  // Só permite caderneta se tiver cliente E não for venda sem cliente
  const canCaderneta = !!client && !semCliente;

  const pay = (method: PaymentMethod) => {
    finalizeSale(method);
    toast.success(
      method === "caderneta"
        ? `Venda de ${brl(cartTotal)} adicionada à caderneta de ${client?.name}.`
        : `Venda de ${brl(cartTotal)} concluída em ${labelFor(method)}.`,
    );
    navigate({ to: "/" });
  };

  const buttons: {
    method: PaymentMethod;
    label: string;
    icon: typeof Banknote;
    color: string;
    disabled?: boolean;
  }[] = [
    { method: "dinheiro", label: "Dinheiro", icon: Banknote, color: "bg-ledger-green" },
    { method: "pix", label: "PIX", icon: Smartphone, color: "bg-ledger-blue" },
    { method: "cartao", label: "Cartão", icon: CreditCard, color: "bg-ink" },
    {
      method: "caderneta",
      label: "Adicionar à Caderneta",
      icon: BookOpen,
      color: "bg-ledger-yellow",
      disabled: !canCaderneta,
    },
  ];

  return (
    <div>
      <PageHeader title="Fechamento" subtitle="Escolha o pagamento" back="/vendas/cliente" />

      <div className="animate-entry mb-6 rounded-2xl border-2 border-ink bg-white p-6 text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/40">
          Total da Venda
        </p>
        <p className="mt-1 text-6xl font-black tracking-tighter">{brl(cartTotal)}</p>
        {client && (
          <p className="mt-3 font-mono text-xs text-ink/60">
            Cliente: <span className="font-bold text-ink">{client.name}</span>
          </p>
        )}
        {semCliente && (
          <p className="mt-3 font-mono text-xs text-ink/60">
            <span className="font-bold text-ledger-blue">Venda sem cliente vinculado</span>
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

      <div className="animate-entry space-y-3 [animation-delay:160ms]">
        {buttons.map(({ method, label, icon: Icon, color, disabled }) => (
          <button
            key={method}
            onClick={() => pay(method)}
            disabled={disabled}
            className={`flex h-16 w-full items-center justify-between rounded-2xl px-6 font-black uppercase tracking-tight text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/40 ${color}`}
          >
            <span className="flex items-center gap-3">
              <Icon className="size-6" strokeWidth={2.5} />
              <span>{label}</span>
            </span>
            {method === "caderneta" && !canCaderneta && (
              <span className="font-mono text-[10px] normal-case tracking-normal">
                {semCliente ? "Sem cliente vinculado" : "Selecione um cliente"}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function labelFor(m: PaymentMethod) {
  return m === "dinheiro" ? "dinheiro" : m === "pix" ? "PIX" : m === "cartao" ? "cartão" : "caderneta";
}