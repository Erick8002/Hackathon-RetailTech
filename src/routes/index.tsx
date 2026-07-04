import { createFileRoute, redirect } from "@tanstack/react-router";
import { useApp } from "@/store/app-store";

// Root "/" redireciona conforme autenticação para o dashboard sob _app.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const authed = useApp.getState().isAuthed;
    throw redirect({ to: authed ? "/" : "/login" });
  },
  component: () => null,
});
