import { createFileRoute, notFound } from "@tanstack/react-router";
import { MessageCircle, Wallet, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ledger/PageHeader";
import { useApp } from "@/store/app-store";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_app/clientes/$id")({
  component: ClientDetail,
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="font-bold">Cliente não encontrado.</p>
    </div>
  ),
});

function ClientDetail() {
  const { id } = Route.useParams();
  const client = useApp((s) => s.clients.find((c) => c.id === id));
  const receivePayment = useApp((s) => s.receivePayment);
  const [showPay, setShowPay] = useState(false);
  const [amount, setAmount] = useState("");

  if (!client) throw notFound();

  const openWhats = () => {
    const message = encodeURIComponent(
      `Olá, ${client.name.split(" ")[0]}! Passando pra lembrar do seu saldo na caderneta do mercadinho: ${brl(client.debt)}. Quando puder passar pra acertar, agradeço! 🙏`,
    );
    const url = `https://wa.me/${client.phone}?text=${message}`;
    window.open(url, "_blank");
    toast.success("Mensagem preparada no WhatsApp.");
  };

  const doReceive = () => {
    const parsed = parseFloat(amount.replace(",", "."));
    if (!parsed || parsed <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    receivePayment(client.id, parsed);
    toast.success(`${brl(parsed)} recebidos de ${client.name.split(" ")[0]}.`);
    setShowPay(false);
    setAmount("");
  };

  return (
    <div>
      <PageHeader title={client.name} subtitle="Perfil" back="/clientes" />

      <div
        className={`animate-entry rounded-2xl border-2 p-6 ${
          client.debt > 0 ? "border-ledger-red bg-white" : "border-ledger-green bg-white"
        }`}
      >
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/40">
          Saldo em Aberto
        </p>
        <p
          className={`mt-1 text-6xl font-black tracking-tighter ${
            client.debt > 0 ? "text-ledger-red" : "text-ledger-green"
          }`}
        >
          {brl(client.debt)}
        </p>
        {client.overdueDays > 0 && (
          <p className="mt-2 font-mono text-xs font-bold uppercase text-ledger-red">
            {client.overdueDays} dias em atraso
          </p>
        )}
        <p className="mt-3 font-mono text-xs text-ink/60">
          {client.purchases} compras · {formatPhone(client.phone)}
        </p>
      </div>

      <div className="animate-entry mt-4 grid grid-cols-1 gap-3 [animation-delay:80ms]">
        <button
          onClick={() => setShowPay(true)}
          disabled={client.debt <= 0}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-ledger-green font-black uppercase tracking-tight text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/40"
        >
          <Wallet className="size-5" strokeWidth={2.5} /> Receber Pagamento
        </button>
        <button
          onClick={openWhats}
          disabled={client.debt <= 0}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-ledger-blue bg-white font-black uppercase tracking-tight text-ledger-blue active:scale-[0.98] disabled:cursor-not-allowed disabled:border-ink/10 disabled:text-ink/40"
        >
          <MessageCircle className="size-5" strokeWidth={2.5} /> Lembrar por WhatsApp
        </button>
      </div>

      <div className="animate-entry mt-8 [animation-delay:160ms]">
        <h2 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-ink/40">
          Extrato da caderneta
        </h2>
        {client.ledger.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-ink/15 p-6 text-center text-sm text-ink/50">
            Sem movimentos ainda.
          </p>
        ) : (
          <div className="divide-y-2 divide-ink/5 rounded-xl border-2 border-ink/10 bg-white">
            {client.ledger.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{e.description}</p>
                  <p className="font-mono text-[11px] text-ink/50">
                    {new Date(e.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <p
                  className={`font-mono text-sm font-black ${
                    e.amount > 0 ? "text-ledger-red" : "text-ledger-green"
                  }`}
                >
                  {e.amount > 0 ? "+" : "−"} {brl(Math.abs(e.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPay && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4"
          onClick={() => setShowPay(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">Receber Pagamento</h3>
              <button onClick={() => setShowPay(false)} aria-label="Fechar">
                <X className="size-6" />
              </button>
            </div>
            <p className="mb-4 font-mono text-xs uppercase text-ink/50">
              Saldo atual: <span className="font-bold text-ledger-red">{brl(client.debt)}</span>
            </p>
            <input
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              className="h-20 w-full rounded-2xl border-4 border-ledger-green bg-white px-4 text-center text-4xl font-black outline-none"
            />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[10, 20, 50].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className="rounded-lg border-2 border-ink/10 py-2 font-mono font-bold"
                >
                  R${v}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAmount(String(client.debt))}
              className="mt-2 w-full rounded-lg border-2 border-ink/10 py-2 font-mono text-sm font-bold"
            >
              Quitar tudo · {brl(client.debt)}
            </button>
            <button
              onClick={doReceive}
              className="mt-4 flex h-16 w-full items-center justify-center rounded-2xl bg-ledger-green font-black uppercase tracking-tight text-white active:scale-[0.98]"
            >
              Confirmar Recebimento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatPhone(digits: string) {
  const n = digits.slice(-11);
  if (n.length !== 11) return digits;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}