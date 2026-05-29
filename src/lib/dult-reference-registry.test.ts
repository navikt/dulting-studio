import { describe, expect, it } from "vitest";
import {
  employerClusters,
  employerJourneyStages,
} from "./aid-user-journey-model";
import {
  getDultReference,
  isDultId,
  isRegisteredDultId,
  listDultReferences,
} from "./dult-reference-registry";

describe("dult-reference-registry", () => {
  it("identifies DULT-IDs by prefix", () => {
    expect(isDultId("DULT-01")).toBe(true);
    expect(isDultId("DULT-99")).toBe(true);
    expect(isDultId("Målmodell H1")).toBe(false);
    expect(isDultId("Kladdehjørne")).toBe(false);
  });

  it("returns a reference for registered IDs", () => {
    const ref = getDultReference("DULT-06");
    expect(ref).toBeDefined();
    expect(ref?.id).toBe("DULT-06");
    expect(ref?.title.length).toBeGreaterThan(0);
    expect(ref?.summary.length).toBeGreaterThan(0);
  });

  it("returns undefined for unregistered IDs", () => {
    expect(getDultReference("DULT-9999")).toBeUndefined();
    expect(getDultReference("Kladdehjørne")).toBeUndefined();
    expect(isRegisteredDultId("DULT-9999")).toBe(false);
  });

  it("lists references sorted by ID", () => {
    const list = listDultReferences();
    const ids = list.map((entry) => entry.id);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
  });

  it("contains every DULT-prefixed source used in the user journey", () => {
    const allSources = [
      ...employerJourneyStages.flatMap((stage) => stage.sources),
      ...employerClusters.flatMap((cluster) => cluster.sources),
    ];
    const missing = allSources
      .filter((source) => isDultId(source))
      .filter((source) => !isRegisteredDultId(source));

    expect(missing).toEqual([]);
  });

  it("does not reference Kladdehjørne anywhere in the journey", () => {
    const allSources = [
      ...employerJourneyStages.flatMap((stage) => stage.sources),
      ...employerClusters.flatMap((cluster) => cluster.sources),
    ];
    expect(allSources).not.toContain("Kladdehjørne");
  });
});
