import { logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";

export function GET() {
  logInfo("Readiness probe OK", { route: "/api/isReady" });
  return Response.json({ message: "I am ready :)" });
}
