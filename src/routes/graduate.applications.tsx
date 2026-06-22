import { createFileRoute } from "@tanstack/react-router";
import { Route as StudentApplicationsRoute } from "./student.applications";

export const Route = createFileRoute("/graduate/applications")({
  head: () => ({ meta: [{ title: "My applications — Ikusasa" }] }),
  component: StudentApplicationsRoute.options.component!,
});
