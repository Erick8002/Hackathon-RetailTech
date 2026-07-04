import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — AESGPTech" },
      { name: "description", content: "Acesse sua caderneta digital AESGPTech." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const login = useApp((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 3) {
      toast.error("Preencha e-mail e senha para continuar.");
      return;
    }
    login(email);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-md">
        <div className="animate-entry mb-10 border-b-2 border-ink/10 pb-6">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/40">
            Caderneta Digital
          </p>
          <h1 className="text-4xl font-black tracking-tighter">
            AESGP<span className="text-ledger-blue">Tech</span>
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            A caderneta inteligente do varejo popular.
          </p>
        </div>

        <form onSubmit={submit} className="animate-entry space-y-5 [animation-delay:80ms]">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@mercadinho.com.br"
              className="h-14 w-full rounded-xl border-2 border-ink/10 bg-white px-4 text-lg font-medium outline-none focus:border-ink"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
              Senha
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-14 w-full rounded-xl border-2 border-ink/10 bg-white px-4 text-lg font-medium outline-none focus:border-ink"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            className="flex h-16 w-full items-center justify-center rounded-2xl bg-ink text-lg font-black uppercase tracking-tight text-white active:scale-[0.98]"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-ink bg-white font-bold uppercase tracking-tight active:scale-[0.98]"
          >
            Criar Conta
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-widest text-ink/40">
          Login simulado · qualquer e-mail funciona
        </p>
      </div>
    </div>
  );
}
