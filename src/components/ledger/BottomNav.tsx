import { Link } from "@tanstack/react-router";
import { Home, Package, Users } from "lucide-react";

const items = [
  { to: "/" as const, label: "Início", icon: Home },
  { to: "/estoque" as const, label: "Estoque", icon: Package },
  { to: "/clientes" as const, label: "Clientes", icon: Users },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-ink/10 bg-white shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="group flex flex-1 flex-col items-center gap-1 py-3 text-ink/40 data-[status=active]:text-ink"
          >
            <Icon className="size-6" strokeWidth={2.5} />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
