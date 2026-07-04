import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { PageHeader } from "@/components/ledger/PageHeader";
import { useApp } from "@/store/app-store";
import { brl } from "@/lib/format";

const searchSchema = z.object({
  filtro: z.enum(["devedores"]).optional(),
});

export const Route = createFileRoute("/_app/clientes/")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Clientes,
});

function Clientes() {
  const { filtro } = Route.useSearch();
  const navigate = Route.useNavigate();
  const clients = useApp((s) => s.clients);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = [...clients].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (filtro === "devedores") list = list.filter((c) => c.debt > 0);
    if (q.trim())
      list = list.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));
    return list;
  }, [clients, filtro, q]);

  return (
    <div>
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
        <button
          onClick={() =>
            navigate({ search: filtro === "devedores" ? {} : { filtro: "devedores" } })
          }
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 font-black uppercase tracking-tight ${
            filtro === "devedores"
              ? "border-ledger-red bg-ledger-red text-white"
              : "border-ink/20 bg-white text-ink"
          }`}
        >
          {filtro === "devedores" ? (
            <>
              <X className="size-4" /> Remover filtro de devedores
            </>
          ) : (
            <>
              <Filter className="size-4" /> Filtrar clientes com dívida
            </>
          )}
        </button>
      </div>

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
