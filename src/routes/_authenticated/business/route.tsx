import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { dashboardForRole } from "@/lib/role-routing";

export const Route = createFileRoute("/_authenticated/business")({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user || user.role !== "business") {
      throw redirect({ to: dashboardForRole(user?.role) });
    }
  },
  component: () => <Outlet />,
});
