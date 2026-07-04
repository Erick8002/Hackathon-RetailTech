import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, LogOut, Package, ShoppingBag, Users } from "lucide-react";
import { useApp, overdueClients, receivableTotal } from "@/store/app-store";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  const clients = useApp((s) => s.clients);
  const cash = useApp((s) => s.cashToday);
  const salesCount = useApp((s) => s.salesCount);
  const logout = useApp((s) => s.logout);
  const navigate = useNavigate();

  const receivable = receivableTotal(clients);
  const overdue = overdueClients(clients);

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <header className="animate-entry flex items-end justify-between border-b-2 border-ink/10 pb-4">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40">
            Caderneta Digital
          </p>
          <h1 className="text-3xl font-extrabold tracking-tighter">
            AESGP<span className="text-ledger-blue">Tech</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase text-ink/60">{today}</p>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-ink/60 hover:text-ink transition-colors"
          >
            <LogOut className="size-3" /> Sair
          </button>
        </div>
      </header>

      <section className="animate-entry grid grid-cols-1 gap-3 [animation-delay:100ms]">
        <div className="rounded-2xl border-2 border-ledger-green/25 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ledger-green">
              Vendas Hoje
            </p>
            <span className="font-mono text-[10px] font-bold uppercase text-ink/40">
              {salesCount} vendas
            </span>
          </div>
          <p className="mt-1 text-4xl font-black tracking-tighter text-ledger-green">
            {brl(cash)}
          </p>
          <p className="mt-1 text-xs text-ink/50">Dinheiro · PIX · Cartão</p>
        </div>
        <div className="rounded-2xl border-2 border-ledger-blue/25 bg-white p-5 shadow-sm">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ledger-blue">
            A Receber na Caderneta
          </p>
          <p className="mt-1 text-4xl font-black tracking-tighter text-ledger-blue">
            {brl(receivable)}
          </p>
          <p className="mt-1 text-xs text-ink/50">
            {clients.filter((c) => c.debt > 0).length} clientes com saldo em aberto
          </p>
        </div>
      </section>

      {overdue.length > 0 && (
        <Link
          to="/clientes"
          search={{ filtro: "devedores" }}
          className="animate-entry flex items-center justify-between rounded-2xl bg-ledger-red p-4 text-white shadow-lg shadow-ledger-red/20 [animation-delay:150ms] transition-all hover:bg-ledger-red/90 hover:shadow-xl active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 ">
            <AlertTriangle className="size-6 shrink-0 " strokeWidth={2.5} />
            <div className="min-w-0">
              <p className="font-black uppercase leading-tight">
                {overdue.length} clientes com pendências atrasadas
              </p>
              <p className="text-xs text-white/80">Toque para ver quem precisa pagar</p>
            </div>
          </div>
          <ArrowRight className="size-5 shrink-0" />
        </Link>
      )}

      {/* --- SEÇÃO DE BOTÕES COM HOVER ADICIONADO --- */}
      <nav className="animate-entry space-y-3 [animation-delay:200ms]">
        <Link
          to="/vendas/nova"
          className="flex h-24 items-center justify-between rounded-2xl bg-ink px-6 text-white shadow-lg shadow-ink/20 transition-all hover:bg-ink/90 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            <ShoppingBag className="size-7" strokeWidth={2.5} />
            <span className="text-2xl font-black uppercase tracking-tight">Realizar Venda</span>
          </span>
          <ArrowRight className="size-6 opacity-70 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <Link
          to="/estoque"
          className="flex h-20 items-center justify-between rounded-2xl border-4 border-ink bg-white px-6 transition-all hover:bg-ink/5 hover:scale-[1.01] active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            <Package className="size-6" strokeWidth={2.5} />
            <span className="text-xl font-black uppercase tracking-tight">Estoque</span>
          </span>
          <ArrowRight className="size-5 text-ink/30" />
        </Link>
        
        <Link
          to="/clientes"
          className="flex h-20 items-center justify-between rounded-2xl border-4 border-ink bg-white px-6 transition-all hover:bg-ink/5 hover:scale-[1.01] active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            <Users className="size-6" strokeWidth={2.5} />
            <span className="text-xl font-black uppercase tracking-tight">Clientes</span>
          </span>
          <ArrowRight className="size-5 text-ink/30" />
        </Link>
      </nav>
    </div>
  );
}