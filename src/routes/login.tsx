import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")(
  {
    head: () => (
      {
        meta: [
          { title: "Entrar — AESGPTech" },
          { name: "description", content: "Acesse sua caderneta digital AESGPTech." },
        ],
      }
    ),
    component: LoginPage,
  }
);

function LoginPage() {
  const login = useApp((s) => s.login);
  const register = useApp((s) => s.register);
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha email e senha");
      return;
    }

    const result = login(email, password);
    if (result.success) {
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/" });
    } else {
      toast.error(result.error);
    }
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();

    const result = register(email, password, confirmPassword);
    if (result.success) {
      toast.success("Conta criada com sucesso!");
      navigate({ to: "/" });
    } else {
      toast.error(result.error);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    if (isSignUp) {
      handleRegister(e);
    } else {
      handleLogin(e);
    }
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

        <form onSubmit={handleSubmit} className="animate-entry space-y-5 [animation-delay:80ms]">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com.br"
              className="h-14 w-full rounded-xl border-2 border-ink/10 bg-white px-4 text-lg font-medium outline-none focus:border-ink"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
              Senha
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-14 w-full rounded-xl border-2 border-ink/10 bg-white px-4 pr-12 text-lg font-medium outline-none focus:border-ink"
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </label>

          {isSignUp && (
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
                Confirmar Senha
              </span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 w-full rounded-xl border-2 border-ink/10 bg-white px-4 pr-12 text-lg font-medium outline-none focus:border-ink"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </label>
          )}

          <button
            type="submit"
            className="flex h-16 w-full items-center justify-center rounded-2xl bg-ink text-lg font-black uppercase tracking-tight text-white active:scale-[0.98]"
          >
            {isSignUp ? "Criar Conta" : "Entrar"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-ink bg-white font-bold uppercase tracking-tight active:scale-[0.98]"
          >
            {isSignUp ? "Já tenho conta" : "Criar Conta"}
          </button>
        </form>
      </div>
    </div>
  );
}