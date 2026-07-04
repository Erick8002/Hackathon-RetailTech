import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BottomNav } from "@/components/ledger/BottomNav";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !useApp.getState().isAuthed) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-lg px-4 pb-28 pt-4">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
