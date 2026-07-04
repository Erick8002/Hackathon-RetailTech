import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ledger/PageHeader";
import { useApp } from "@/store/app-store";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_app/vendas/nova")({
  component: NovaVenda,
});

function NovaVenda() {
  const products = useApp((s) => s.products);
  const cart = useApp((s) => s.cart);
  const setQty = useApp((s) => s.setQty);
  const cartTotal = useApp((s) => s.cartTotal);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, query]);

  const total = cartTotal();
  const itemsCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div>
      <PageHeader title="Nova Venda" subtitle="Catálogo" back="/" />

      <div className="animate-entry relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar produto..."
          className="h-14 w-full rounded-xl border-2 border-ink/10 bg-white pl-12 pr-4 text-base font-medium outline-none focus:border-ink"
        />
      </div>

      <div className="animate-entry space-y-3 pb-32 [animation-delay:80ms]">
        {filtered.map((p) => {
          const inCart = cart.find((c) => c.productId === p.id)?.qty ?? 0;
          const low = p.qty <= 5;
          return (
            <div
              key={p.id}
              className="flex gap-3 rounded-xl border-2 border-ink/10 bg-white p-3"
            >
              <div className="grid size-16 shrink-0 place-items-center rounded-lg border border-ink/5 bg-paper text-3xl">
                {p.emoji}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="min-w-0">
                  <p className="truncate font-bold">{p.name}</p>
                  <p className="font-mono text-sm font-bold text-ledger-green">
                    {brl(p.price)}
                  </p>
                  {low && (
                    <span className="mt-1 inline-block rounded bg-ledger-red/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-ledger-red">
                      Estoque: {p.qty}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5">
                <button
                  onClick={() => setQty(p.id, inCart + 1)}
                  disabled={inCart >= p.qty}
                  className="grid size-9 place-items-center rounded-lg bg-ink text-white disabled:opacity-30"
                  aria-label="Adicionar"
                >
                  <Plus className="size-4" strokeWidth={3} />
                </button>
                <span className="min-w-6 text-center font-mono text-lg font-black">
                  {inCart}
                </span>
                <button
                  onClick={() => setQty(p.id, Math.max(0, inCart - 1))}
                  disabled={inCart === 0}
                  className="grid size-9 place-items-center rounded-lg border-2 border-ink/20 disabled:opacity-30"
                  aria-label="Remover"
                >
                  <Minus className="size-4" strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t-2 border-ink/10 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <Link
            to="/vendas/cliente"
            aria-disabled={itemsCount === 0}
            className={`flex h-16 w-full items-center justify-between rounded-2xl px-6 font-black uppercase tracking-tight text-white ${
              itemsCount === 0 ? "pointer-events-none bg-ink/20" : "bg-ink active:scale-[0.98]"
            }`}
          >
            <span className="text-base">
              Avançar para Cliente
              <span className="ml-2 font-mono text-xs opacity-70">
                ({itemsCount} {itemsCount === 1 ? "item" : "itens"})
              </span>
            </span>
            <span className="font-mono text-xl">{brl(total)}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
