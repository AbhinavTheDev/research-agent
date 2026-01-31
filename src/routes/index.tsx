import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/pages/Landing";

export const Route = createFileRoute("/")({
  ssr: false,
  component: LandingPage,
});
