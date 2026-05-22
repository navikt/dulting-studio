import { logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";

export function GET() {
  logInfo("Liveness probe OK", { route: "/api/isAlive" });
  return Response.json({ message: "I am alive :)" });
}
