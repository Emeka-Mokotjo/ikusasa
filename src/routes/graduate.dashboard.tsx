import { createFileRoute } from "@tanstack/react-router";
import { TalentDashboard } from "./student.dashboard";

export const Route = createFileRoute("/graduate/dashboard")({
  head: () => ({ meta: [{ title: "Graduate dashboard — Ikusasa" }] }),
  component: () => <TalentDashboard role="Graduate" />,
});
