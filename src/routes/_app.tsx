import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BottomNav } from "@/components/ledger/BottomNav";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/_app")(
  {
    beforeLoad: async () => {
      if (typeof window === "undefined") return;

      await new Promise(resolve => {
        const checkAuth = () => {
          const state = useApp.getState();
          if (state.isAuthed || localStorage.getItem("aesgp_auth")) {
            resolve(null);
          } else {
            setTimeout(checkAuth, 10);
          }
        };
        checkAuth();
      });

      if (!useApp.getState().isAuthed) {
        throw redirect({ to: "/login" });
      }
    },
    component: AppLayout,
  }
);

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