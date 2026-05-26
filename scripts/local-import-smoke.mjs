import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMuralExport } from "../src/lib/mural-parser.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const baseUrl = process.env.LOCAL_IMPORT_BASE_URL ?? "http://localhost:3000";
const fixturePath =
  process.env.LOCAL_IMPORT_FIXTURE ??
  path.join(repoRoot, "fixtures", "sanitized-mural-export.json");

function fail(message, details) {
  console.error(`❌ ${message}`);
  if (details) {
    console.error(details);
  }
  process.exit(1);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  const json =
    body && contentType.includes("application/json") ? JSON.parse(body) : null;
  return { response, json, body };
}

async function main() {
  const rootResponse = await fetch(baseUrl).catch((error) =>
    fail(`Kunne ikke nå ${baseUrl}. Start dev-serveren først.`, error.message),
  );

  if (!rootResponse.ok) {
    fail(`${baseUrl} svarte ${rootResponse.status}.`);
  }

  const rawFixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const parsed = parseMuralExport(rawFixture);
  const sourceId = `local-smoke-${Date.now()}`;
  const payload = {
    projectName: `Lokal smoke-import ${new Date().toISOString()}`,
    sourceId,
    sourceDescription: "Sanitert fixture importert av lokal smoke-test",
    widgets: parsed.widgets,
    report: {
      totalWidgets: parsed.report.totalWidgets,
      includedWidgets: parsed.report.includedWidgets,
      droppedWidgets: parsed.report.droppedWidgets,
      unknownTypeCount: parsed.report.unknownTypeCount,
      missingTextCount: parsed.report.missingTextCount,
      geometryWarningCount: parsed.report.geometryWarningCount,
    },
  };

  const importResult = await fetchJson(`${baseUrl}/api/projects/import`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: baseUrl,
    },
    body: JSON.stringify(payload),
  });

  if (importResult.response.status === 401) {
    fail(
      "Import-API-et svarte 401.",
      "Start dev-serveren med LOCAL_AUTH_MOCK_ENABLED=true for lokal smoke-test.",
    );
  }

  if (!importResult.response.ok) {
    fail(
      `Import-API-et svarte ${importResult.response.status}.`,
      importResult.body,
    );
  }

  const projectId = importResult.json?.projectId;
  if (!projectId) {
    fail("Importrespons mangler projectId.", importResult.body);
  }

  const widgetsResult = await fetchJson(
    `${baseUrl}/api/projects/${projectId}/widgets?page=1&pageSize=10`,
  );

  if (!widgetsResult.response.ok) {
    fail(
      `Widget-API-et svarte ${widgetsResult.response.status}.`,
      widgetsResult.body,
    );
  }

  const total = widgetsResult.json?.total;
  if (total !== parsed.widgets.length) {
    fail(
      `Forventet ${parsed.widgets.length} widgets, men API-et returnerte ${total}.`,
      widgetsResult.body,
    );
  }

  console.log("✅ Lokal import-smoke OK");
  console.log(`Project: ${baseUrl}/projects/${projectId}`);
  console.log(`Matrix:  ${baseUrl}/projects/${projectId}/matrix`);
  console.log(`Widgets: ${total}`);
}

main();
