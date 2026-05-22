import {
  buildMetricsPayload,
  metricsContentType,
  metricsRoute,
} from "@/lib/metrics";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(buildMetricsPayload(metricsRoute), {
    headers: {
      "Content-Type": metricsContentType,
    },
  });
}
