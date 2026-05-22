import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { StudioCaseBundle, Tiltak, Tiltakspakke } from "./model";
import {
  validateStudioCase,
  validateStudioCaseBundle,
  validateTiltak,
  validateTiltakspakke,
} from "./validation";

async function readJsonFile(filePath: string): Promise<unknown> {
  try {
    const fileContent = await readFile(filePath, "utf-8");
    return JSON.parse(fileContent) as unknown;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ukjent feil under lesing";

    throw new Error(`${filePath}: kunne ikke lese JSON (${message})`);
  }
}

async function readJsonDirectory<TValue>(
  directoryPath: string,
  parser: (value: unknown, path: string) => TValue,
): Promise<TValue[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();

  return Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(directoryPath, fileName);
      const jsonValue = await readJsonFile(filePath);
      return parser(jsonValue, filePath);
    }),
  );
}

export function getCaseDirectory(caseId: string): string {
  return path.join(process.cwd(), "data", "cases", caseId);
}

export async function loadStudioCaseBundle(
  caseId: string,
): Promise<StudioCaseBundle> {
  return loadStudioCaseBundleFromDirectory(getCaseDirectory(caseId));
}

export async function loadStudioCaseBundleFromDirectory(
  caseDirectory: string,
): Promise<StudioCaseBundle> {
  const caseValue = await readJsonFile(path.join(caseDirectory, "case.json"));
  const tiltak = await readJsonDirectory<Tiltak>(
    path.join(caseDirectory, "tiltak"),
    validateTiltak,
  );
  const tiltakspakker = await readJsonDirectory<Tiltakspakke>(
    path.join(caseDirectory, "tiltakspakker"),
    validateTiltakspakke,
  );

  return validateStudioCaseBundle({
    case: validateStudioCase(caseValue, path.join(caseDirectory, "case.json")),
    tiltak,
    tiltakspakker,
  });
}
