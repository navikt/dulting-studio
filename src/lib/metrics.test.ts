import { describe, expect, it } from "vitest";
import { buildMetricsPayload } from "./metrics";

describe("buildMetricsPayload", () => {
  it("returns prometheus formatted metrics", () => {
    const payload = buildMetricsPayload("/api/metrics");

    expect(payload).toContain("# HELP dulting_studio_uptime_seconds");
    expect(payload).toContain(
      'dulting_studio_probe_route_info{route="/api/metrics"} 1',
    );
    expect(payload.endsWith("\n")).toBe(true);
  });
});
