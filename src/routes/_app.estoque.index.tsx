import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ledger/PageHeader";
import { useApp } from "@/store/app-store";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_app/estoque/")({
  component: Estoque,
});

function Estoque() {
  const products = useApp((s) => s.products);
  const sorted = [...products].sort((a, b) => a.qty - b.qty);
  const critical = products.filter((p) => p.qty <= 5).length;

  return (
    <div className="pb-24">
      <PageHeader
        title="Meu Estoque"
        subtitle={`${products.length} produtos · ${critical} críticos`}
        back="/"
      />

      <div className="animate-entry space-y-2">
        {sorted.map((p) => {
          const low = p.qty <= 5;
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl border-2 border-ink/10 bg-white p-3"
            >
              <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-paper">
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl">
                    {p.emoji}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{p.name}</p>
                <p className="font-mono text-xs text-ink/50">{brl(p.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black">
                  {String(p.qty).padStart(2, "0")} un
                </span>
                <span
                  className={`size-3 rounded-full ring-4 ${
                    low
                      ? "bg-ledger-red ring-ledger-red/15"
                      : "bg-ledger-green ring-ledger-green/15"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Link
        to="/estoque/novo"
        className="fixed bottom-24 right-4 z-30 flex h-14 items-center gap-2 rounded-2xl bg-ink px-5 font-black uppercase tracking-tight text-white shadow-xl shadow-ink/30 active:scale-95"
      >
        <Plus className="size-5" strokeWidth={3} />
        Novo Produto
      </Link>
    </div>
  );
}