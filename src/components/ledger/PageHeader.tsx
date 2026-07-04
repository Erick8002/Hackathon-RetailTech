import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <header className="animate-entry mb-6 flex items-center justify-between gap-3 border-b-2 border-ink/10 pb-4 pt-2">
      <div className="flex min-w-0 items-center gap-3">
        {back ? (
          <Link
            to={back as never}
            className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink/10 bg-white"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-5" strokeWidth={2.5} />
          </Link>
        ) : null}
        <div className="min-w-0">
          {subtitle ? (
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40">
              {subtitle}
            </p>
          ) : null}
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{title}</h1>
        </div>
      </div>
      {right}
    </header>
  );
}
