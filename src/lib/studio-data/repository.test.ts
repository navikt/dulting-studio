import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadStudioCaseBundle } from "./repository";
import {
  validateStudioCase,
  validateStudioCaseBundle,
  validateTiltak,
  validateTiltakspakke,
} from "./validation";

async function readJsonFixture<TValue>(
  ...relativeParts: string[]
): Promise<TValue> {
  const filePath = path.join(
    process.cwd(),
    "data",
    "test-fixtures",
    ...relativeParts,
  );
  const fileContent = await readFile(filePath, "utf-8");
  return JSON.parse(fileContent) as TValue;
}

describe("loadStudioCaseBundle", () => {
  it("loads validated oppfolgingsplan data", async () => {
    const studioCase = await loadStudioCaseBundle("oppfolgingsplan");

    expect(studioCase.case.id).toBe("oppfolgingsplan");
    expect(studioCase.case.boundariesConfirmed).toBe(true);
    expect(studioCase.tiltak).toHaveLength(2);
    expect(studioCase.tiltakspakker).toHaveLength(1);
    expect(studioCase.tiltakspakker[0]?.tiltakIds).toEqual([
      "illustrativ-startoppfordring",
      "illustrativ-framdriftspaminnelse",
    ]);
  });

  it("fails with clear errors for invalid case content", async () => {
    const invalidCase = await readJsonFixture("invalid-case", "case.json");

    expect(() =>
      validateStudioCase(
        invalidCase,
        "data/test-fixtures/invalid-case/case.json",
      ),
    ).toThrow(
      [
        "data/test-fixtures/invalid-case/case.json.id: må være kebab-case med små bokstaver, tall og bindestrek",
        "data/test-fixtures/invalid-case/case.json.problemStatement: kan ikke inneholde diagnose- eller helsereferanser",
      ].join("\n"),
    );
  });

  it("fails with clear errors for invalid tiltak content", async () => {
    const invalidTiltak = await readJsonFixture(
      "invalid-case",
      "tiltak",
      "broken-tiltak.json",
    );

    expect(() =>
      validateTiltak(
        invalidTiltak,
        "data/test-fixtures/invalid-case/tiltak/broken-tiltak.json",
      ),
    ).toThrow("broken-tiltak.json.summary: kan ikke inneholde e-postadresse");
  });

  it("fails when a tiltakspakke refers to an unknown tiltak", async () => {
    const studioCase = await loadStudioCaseBundle("oppfolgingsplan");
    const invalidPackage = validateTiltakspakke(
      await readJsonFixture(
        "invalid-case",
        "tiltakspakker",
        "broken-package.json",
      ),
      "data/test-fixtures/invalid-case/tiltakspakker/broken-package.json",
    );

    expect(() =>
      validateStudioCaseBundle({
        case: studioCase.case,
        tiltak: studioCase.tiltak,
        tiltakspakker: [invalidPackage],
      }),
    ).toThrow(
      'tiltakspakker.broken-package.tiltakIds: refererer til ukjent tiltak "ukjent-tiltak"',
    );
  });
});
