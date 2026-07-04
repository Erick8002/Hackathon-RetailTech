import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, LogOut, Package, ShoppingBag, Users, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useApp, overdueClients, receivableTotal, type PaymentBreakdown } from "@/store/app-store";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  const clients = useApp((s) => s.clients);
  const cash = useApp((s) => s.cashToday);
  const salesCount = useApp((s) => s.salesCount);
  const paymentBreakdown = useApp((s) => s.paymentBreakdown);
  const logout = useApp((s) => s.logout);
  const navigate = useNavigate();
  
  // State para controlar abertura/fechamento do dropdown
  const [showBreakdown, setShowBreakdown] = useState(false);

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
        {/* CARD INTERATIVO - VENDAS HOJE */}
        <div>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full rounded-2xl border-2 border-ledger-green/25 bg-white p-5 shadow-sm transition-all duration-200 cursor-pointer hover:border-ledger-green/50 hover:shadow-md hover:bg-ledger-green/2"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ledger-green">
                Vendas Hoje
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase text-ink/40">
                  {salesCount} vendas
                </span>
                <ChevronDown 
                  className={`size-4 text-ledger-green transition-transform duration-200 ${showBreakdown ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
            <p className="mt-1 text-4xl font-black tracking-tighter text-ledger-green">
              {brl(cash)}
            </p>
            <p className="mt-1 text-xs text-ink/50">Dinheiro · PIX · Cartão</p>
          </button>

          {/* DROPDOWN COM DETALHAMENTO */}
          {showBreakdown && (
            <div className="mt-2 rounded-2xl border-2 border-ledger-green/25 bg-ledger-green/5 p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ledger-green mb-4">
                Detalhamento do Caixa
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-ledger-green/20">
                  <span className="text-sm font-semibold text-ink/70">Dinheiro</span>
                  <span className="font-mono font-bold text-ledger-green">{brl(paymentBreakdown.dinheiro)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-ledger-green/20">
                  <span className="text-sm font-semibold text-ink/70">PIX</span>
                  <span className="font-mono font-bold text-ledger-green">{brl(paymentBreakdown.pix)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-ledger-green/20">
                  <span className="text-sm font-semibold text-ink/70">Cartão de Crédito</span>
                  <span className="font-mono font-bold text-ledger-green">{brl(paymentBreakdown.cartao_credito)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-semibold text-ink/70">Cartão de Débito</span>
                  <span className="font-mono font-bold text-ledger-green">{brl(paymentBreakdown.cartao_debito)}</span>
                </div>
              </div>
            </div>
          )}
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
                {overdue.length} clientes com dívida ativa
              </p>
              <p className="text-xs text-white/80">Toque para ver detalhes</p>
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