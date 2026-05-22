export const metricsContentType = "text/plain; version=0.0.4; charset=utf-8";

export const metricsRoute = "/api/metrics";

export function buildMetricsPayload(route: string) {
  const lines = [
    "# HELP dulting_studio_uptime_seconds Application uptime in seconds",
    "# TYPE dulting_studio_uptime_seconds gauge",
    `dulting_studio_uptime_seconds ${Math.round(process.uptime())}`,
    "# HELP dulting_studio_probe_route_info Probe route metadata",
    "# TYPE dulting_studio_probe_route_info gauge",
    `dulting_studio_probe_route_info{route="${route}"} 1`,
  ];

  return `${lines.join("\n")}\n`;
}
