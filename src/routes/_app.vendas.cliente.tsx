import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Shield, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ledger/PageHeader";
import { useApp } from "@/store/app-store";
import { brl } from "@/lib/format";
import type { Client } from "@/lib/seed-data";

export const Route = createFileRoute("/_app/vendas/cliente")({
  component: VendaCliente,
});

type Score = "confiavel" | "recente" | "divida";
function scoreFor(c: Client): Score {
  if (c.debt > 0) return "divida";
  if (c.purchases < 5) return "recente";
  return "confiavel";
}

function VendaCliente() {
  const clients = useApp((s) => s.clients);
  const cartTotal = useApp((s) => s.cartTotal)();
  const selectedId = useApp((s) => s.selectedClientId);
  const selectClient = useApp((s) => s.selectClient);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [override, setOverride] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? clients.filter((c) => c.name.toLowerCase().includes(q)) : clients;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [clients, query]);

  const selected = clients.find((c) => c.id === selectedId) ?? null;
  const score = selected ? scoreFor(selected) : null;

  const goPayment = () => navigate({ to: "/vendas/pagamento" });

  return (
    <div className="pb-40">
      <PageHeader
        title="Vincular Cliente"
        subtitle={`Total: ${brl(cartTotal)}`}
        back="/vendas/nova"
      />

      {!selected && (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente..."
            className="animate-entry mb-4 h-14 w-full rounded-xl border-2 border-ink/10 bg-white px-4 text-base font-medium outline-none focus:border-ink"
          />
          <div className="animate-entry space-y-2 [animation-delay:80ms]">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  selectClient(c.id);
                  setOverride(false);
                }}
                className="flex w-full items-center justify-between rounded-xl border-2 border-ink/10 bg-white p-4 text-left active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">{c.name}</p>
                  <p className="font-mono text-xs text-ink/50">
                    {c.purchases} compras
                    {c.debt > 0 ? ` · Deve ${brl(c.debt)}` : ""}
                  </p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-ink/30" />
              </button>
            ))}
          </div>
        </>
      )}

      {selected && score && (
        <div className="animate-entry space-y-4">
          <div className="rounded-2xl border-2 border-ink bg-white p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-bold uppercase text-ink/40">
                  Cliente selecionado
                </p>
                <p className="truncate text-2xl font-black leading-tight">{selected.name}</p>
                <p className="font-mono text-xs text-ink/50">ID #{selected.id.toUpperCase()}</p>
              </div>
              <button
                onClick={() => selectClient(null)}
                className="rounded-lg border-2 border-ink/10 px-2 py-1 font-mono text-[10px] font-bold uppercase"
              >
                Trocar
              </button>
            </div>

            {score === "divida" && (
              <div className="rounded-lg border-2 border-ledger-red bg-ledger-red/5 p-4">
                <p className="flex items-center gap-2 font-black uppercase text-ledger-red">
                  <ShieldAlert className="size-5" /> 🚨 Dívida Ativa
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  Este cliente já deve {brl(selected.debt)}. Fiado não recomendado.
                </p>
              </div>
            )}
            {score === "recente" && (
              <div className="rounded-lg border-2 border-ledger-yellow bg-ledger-yellow/10 p-4">
                <p className="flex items-center gap-2 font-black uppercase text-ledger-yellow">
                  <AlertTriangle className="size-5" /> ⚠️ Cliente Recente
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  Fiado não recomendado até completar 5 compras. Atual: {selected.purchases}.
                </p>
              </div>
            )}
            {score === "confiavel" && (
              <div className="rounded-lg border-2 border-ledger-green bg-ledger-green/10 p-4">
                <p className="flex items-center gap-2 font-black uppercase text-ledger-green">
                  <Shield className="size-5" /> 🛡️ Cliente Confiável
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  {selected.purchases} compras pagas em dia. Liberado para caderneta.
                </p>
              </div>
            )}
          </div>

          {score === "confiavel" || override ? (
            <button
              onClick={goPayment}
              className="flex h-16 w-full items-center justify-center rounded-2xl bg-ink font-black uppercase tracking-tight text-white active:scale-[0.98]"
            >
              Prosseguir para Pagamento
            </button>
          ) : (
            <>
              <button
                disabled
                className="flex h-16 w-full cursor-not-allowed items-center justify-center rounded-2xl bg-ink/10 font-black uppercase tracking-tight text-ink/40"
              >
                Caderneta Bloqueada
              </button>
              {score === "recente" && (
                <button
                  onClick={() => setOverride(true)}
                  className="w-full text-center text-xs font-bold text-ledger-blue underline"
                >
                  Desbloquear sob minha responsabilidade
                </button>
              )}
              <button
                onClick={goPayment}
                className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-ink font-bold uppercase text-ink active:scale-[0.98]"
              >
                Pagar à vista
              </button>
            </>
          )}

          <Link
            to="/vendas/pagamento"
            search={{ semCliente: true } as never}
            className="block text-center font-mono text-[11px] font-bold uppercase tracking-widest text-ink/40 underline"
          >
            Continuar sem vincular cliente
          </Link>
        </div>
      )}
    </div>
  );
}
