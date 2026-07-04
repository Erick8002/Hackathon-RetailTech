import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Filter, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { PageHeader } from "@/components/ledger/PageHeader";
import { useApp } from "@/store/app-store";
import { brl } from "@/lib/format";

const searchSchema = z.object({
  filtro: z.enum(["devedores"]).optional(),
});

export const Route = createFileRoute("/_app/clientes/")(
  {
    validateSearch: (s) => searchSchema.parse(s),
    component: Clientes,
  }
);

function Clientes() {
  const { filtro } = Route.useSearch();
  const navigate = Route.useNavigate();
  const clients = useApp((s) => s.clients);
  const addClient = useApp((s) => s.addClient);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientCpf, setNewClientCpf] = useState("");

  const filtered = useMemo(() => {
    let list = [...clients].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (filtro === "devedores") list = list.filter((c) => c.debt > 0);
    if (q.trim())
      list = list.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));
    return list;
  }, [clients, filtro, q]);

  const handleAddClient = () => {
    if (!newClientName.trim() || !newClientCpf.trim()) return;
    addClient(newClientName.trim(), newClientPhone.trim(), newClientCpf.trim());
    setNewClientName("");
    setNewClientPhone("");
    setNewClientCpf("");
    setShowForm(false);
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Meus Clientes"
        subtitle={`${clients.length} cadastrados`}
        back="/"
      />

      <div className="animate-entry mb-3 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar cliente..."
            className="h-12 w-full rounded-xl border-2 border-ink/10 bg-white pl-11 pr-4 text-base font-medium outline-none focus:border-ink"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() =>
              navigate({ search: filtro === "devedores" ? {} : { filtro: "devedores" } })
            }
            className={`flex flex-1 h-11 items-center justify-center gap-2 rounded-xl border-2 font-black uppercase tracking-tight ${
              filtro === "devedores"
                ? "border-ledger-red bg-ledger-red text-white"
                : "border-ink/20 bg-white text-ink"
            }`}
          >
            {filtro === "devedores" ? (
              <>
                <X className="size-4" /> Remover filtro
              </>
            ) : (
              <>
                <Filter className="size-4" /> Devedores
              </>
            )}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ledger-green bg-ledger-green/10 text-ledger-green active:scale-[0.98]"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>

      {/* Formulário de novo cliente */}
      {showForm && (
        <div className="animate-entry mb-4 space-y-3 rounded-2xl border-2 border-ledger-green bg-ledger-green/5 p-4 [animation-delay:80ms]">
          <div className="flex items-center justify-between">
            <p className="font-bold uppercase">Novo Cliente</p>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1 hover:bg-black/10"
            >
              <X className="size-4" />
            </button>
          </div>

          <input
            type="text"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="Nome completo"
            className="h-11 w-full rounded-lg border-2 border-ink/10 bg-white px-3 text-sm font-medium outline-none focus:border-ink"
          />

          <input
            type="text"
            value={newClientCpf}
            onChange={(e) => setNewClientCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="CPF (11 dígitos)"
            className="h-11 w-full rounded-lg border-2 border-ink/10 bg-white px-3 text-sm font-medium outline-none focus:border-ink"
            inputMode="numeric"
          />

          <input
            type="tel"
            value={newClientPhone}
            onChange={(e) => setNewClientPhone(e.target.value)}
            placeholder="Telefone (opcional)"
            className="h-11 w-full rounded-lg border-2 border-ink/10 bg-white px-3 text-sm font-medium outline-none focus:border-ink"
          />

          <button
            onClick={handleAddClient}
            disabled={!newClientName.trim() || !newClientCpf.trim()}
            className="h-11 w-full rounded-lg bg-ledger-green font-bold uppercase text-white disabled:bg-ink/20 disabled:text-ink/40"
          >
            Salvar Cliente
          </button>
        </div>
      )}

      <div className="animate-entry space-y-2 [animation-delay:80ms]">
        {filtered.map((c) => (
          <Link
            key={c.id}
            to="/clientes/$id"
            params={{ id: c.id }}
            className="flex items-center justify-between rounded-xl border-2 border-ink/10 bg-white p-4 active:scale-[0.99]"
          >
            <div className="min-w-0">
              <p className="truncate font-bold">{c.name}</p>
              <p className="font-mono text-xs text-ink/50">
                {formatPhone(c.phone)} · {c.purchases} compras
              </p>
            </div>
            <div className="text-right">
              {c.debt > 0 ? (
                <>
                  <p className="font-mono text-sm font-black text-ledger-red">
                    Deve {brl(c.debt)}
                  </p>
                  {c.overdueDays > 15 && (
                    <p className="font-mono text-[10px] font-bold uppercase text-ledger-red/70">
                      {c.overdueDays}d atraso
                    </p>
                  )}
                </>
              ) : (
                <p className="font-mono text-sm font-bold text-ledger-green">Em dia</p>
              )}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl border-2 border-dashed border-ink/15 p-8 text-center text-sm text-ink/50">
            Nenhum cliente encontrado.
          </p>
        )}
      </div>
    </div>
  );
}

function formatPhone(digits: string) {
  const n = digits.slice(-11);
  if (n.length !== 11) return digits;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}