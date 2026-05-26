import type { JsonValue } from "@/db/schema";

const FORBIDDEN_FIELD_NAMES = new Set([
  "accessToken",
  "createdAt",
  "createdBy",
  "createdTimestamp",
  "htmlText",
  "jiraIssue",
  "lastContentEditedBy",
  "lastUpdateBy",
  "locked",
  "lockedBy",
  "owner",
  "rawHtml",
  "sessionToken",
  "thumbUrl",
  "token",
  "tokens",
  "updatedAt",
  "updatedBy",
  "updatedTimestamp",
]);

const WIDGET_TYPES = ["shape", "table", "table-cell", "text"] as const;

export type ImportWidgetType = (typeof WIDGET_TYPES)[number];

export type TableAxisEntry = {
  id: string;
  index: number;
  label?: string | null;
};

export type ImportWidgetMetadata = {
  tableColumns?: TableAxisEntry[];
  tableRows?: TableAxisEntry[];
};

export type ProjectImportWidget = {
  muralWidgetId: string;
  widgetType: ImportWidgetType;
  parentMuralWidgetId?: string | null;
  rowId?: string | null;
  columnId?: string | null;
  rowIndex?: number | null;
  columnIndex?: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
  stackingOrder?: number | null;
  textContent: string;
  backgroundColor?: string | null;
  metadata: ImportWidgetMetadata;
};

export type ProjectImportReport = {
  totalWidgets: number;
  includedWidgets: number;
  droppedWidgets: number;
  unknownTypeCount: number;
  missingTextCount: number;
  geometryWarningCount: number;
};

export type ProjectImportRequest = {
  projectName: string;
  projectDescription?: string | null;
  sourceId: string;
  sourceDescription: string;
  widgets: ProjectImportWidget[];
  report: ProjectImportReport;
};

export class ProjectImportValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super("Invalid import payload");
    this.issues = issues;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ensureObject(
  value: unknown,
  path: string,
  issues: string[],
): Record<string, unknown> | null {
  if (!isRecord(value)) {
    issues.push(`${path}: må være et objekt`);
    return null;
  }

  return value;
}

function rejectUnexpectedKeys(
  value: Record<string, unknown>,
  path: string,
  allowedKeys: readonly string[],
  issues: string[],
) {
  const allowedKeySet = new Set(allowedKeys);

  for (const key of Object.keys(value)) {
    if (FORBIDDEN_FIELD_NAMES.has(key)) {
      issues.push(`${path}.${key}: feltet er forbudt i importkontrakten`);
      continue;
    }

    if (!allowedKeySet.has(key)) {
      issues.push(`${path}.${key}: feltet er ikke tillatt`);
    }
  }
}

function containsHtmlMarkup(value: string) {
  return /<\s*\/?\s*[a-z][^>]*>/i.test(value);
}

function ensurePlainText(value: string, path: string, issues: string[]) {
  if (containsHtmlMarkup(value)) {
    issues.push(`${path}: må være ren tekst uten HTML`);
  }
}

function validateRequiredString(
  value: unknown,
  path: string,
  issues: string[],
): string {
  if (typeof value !== "string") {
    issues.push(`${path}: må være en tekststreng`);
    return "";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    issues.push(`${path}: kan ikke være tom`);
    return "";
  }

  ensurePlainText(trimmedValue, path, issues);
  return trimmedValue;
}

function validatePlainTextString(
  value: unknown,
  path: string,
  issues: string[],
): string {
  if (typeof value !== "string") {
    issues.push(`${path}: må være en tekststreng`);
    return "";
  }

  ensurePlainText(value, path, issues);
  return value.trim();
}

function validateOptionalString(
  value: unknown,
  path: string,
  issues: string[],
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    issues.push(`${path}: må være tekst, null eller utelatt`);
    return undefined;
  }

  const trimmedValue = value.trim();
  ensurePlainText(trimmedValue, path, issues);
  return trimmedValue;
}

function validateInteger(
  value: unknown,
  path: string,
  issues: string[],
): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    issues.push(`${path}: må være et heltall`);
    return 0;
  }

  if (value < 0) {
    issues.push(`${path}: kan ikke være negativ`);
  }

  return value;
}

function validateFiniteNumber(
  value: unknown,
  path: string,
  issues: string[],
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    issues.push(`${path}: må være et endelig tall`);
    return 0;
  }

  return value;
}

function validateTableAxisEntries(
  value: unknown,
  path: string,
  issues: string[],
): TableAxisEntry[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    issues.push(`${path}: må være en liste`);
    return undefined;
  }

  return value.map((entry, index) => {
    const entryPath = `${path}[${index}]`;
    const objectValue = ensureObject(entry, entryPath, issues) ?? {};

    rejectUnexpectedKeys(
      objectValue,
      entryPath,
      ["id", "index", "label"],
      issues,
    );

    return {
      id: validateRequiredString(objectValue.id, `${entryPath}.id`, issues),
      index: validateInteger(objectValue.index, `${entryPath}.index`, issues),
      label: validateOptionalString(
        objectValue.label,
        `${entryPath}.label`,
        issues,
      ),
    };
  });
}

function validateMetadata(
  value: unknown,
  path: string,
  issues: string[],
): ImportWidgetMetadata {
  const objectValue = ensureObject(value, path, issues) ?? {};

  rejectUnexpectedKeys(
    objectValue,
    path,
    ["tableColumns", "tableRows"],
    issues,
  );

  return {
    tableColumns: validateTableAxisEntries(
      objectValue.tableColumns,
      `${path}.tableColumns`,
      issues,
    ),
    tableRows: validateTableAxisEntries(
      objectValue.tableRows,
      `${path}.tableRows`,
      issues,
    ),
  };
}

function validateWidgetType(
  value: unknown,
  path: string,
  issues: string[],
): ImportWidgetType {
  if (
    typeof value !== "string" ||
    !WIDGET_TYPES.includes(value as ImportWidgetType)
  ) {
    issues.push(
      `${path}: må være en støttet widgetType (${WIDGET_TYPES.join(", ")})`,
    );
    return "text";
  }

  return value as ImportWidgetType;
}

function validateWidget(
  value: unknown,
  path: string,
  issues: string[],
): ProjectImportWidget {
  const objectValue = ensureObject(value, path, issues) ?? {};

  rejectUnexpectedKeys(
    objectValue,
    path,
    [
      "backgroundColor",
      "columnId",
      "columnIndex",
      "height",
      "metadata",
      "muralWidgetId",
      "parentMuralWidgetId",
      "rowId",
      "rowIndex",
      "stackingOrder",
      "textContent",
      "widgetType",
      "width",
      "x",
      "y",
    ],
    issues,
  );

  return {
    muralWidgetId: validateRequiredString(
      objectValue.muralWidgetId,
      `${path}.muralWidgetId`,
      issues,
    ),
    widgetType: validateWidgetType(
      objectValue.widgetType,
      `${path}.widgetType`,
      issues,
    ),
    parentMuralWidgetId: validateOptionalString(
      objectValue.parentMuralWidgetId,
      `${path}.parentMuralWidgetId`,
      issues,
    ),
    rowId: validateOptionalString(objectValue.rowId, `${path}.rowId`, issues),
    columnId: validateOptionalString(
      objectValue.columnId,
      `${path}.columnId`,
      issues,
    ),
    rowIndex:
      objectValue.rowIndex === undefined || objectValue.rowIndex === null
        ? (objectValue.rowIndex ?? undefined)
        : validateInteger(objectValue.rowIndex, `${path}.rowIndex`, issues),
    columnIndex:
      objectValue.columnIndex === undefined || objectValue.columnIndex === null
        ? (objectValue.columnIndex ?? undefined)
        : validateInteger(
            objectValue.columnIndex,
            `${path}.columnIndex`,
            issues,
          ),
    x: validateFiniteNumber(objectValue.x, `${path}.x`, issues),
    y: validateFiniteNumber(objectValue.y, `${path}.y`, issues),
    width: validateFiniteNumber(objectValue.width, `${path}.width`, issues),
    height: validateFiniteNumber(objectValue.height, `${path}.height`, issues),
    stackingOrder:
      objectValue.stackingOrder === undefined ||
      objectValue.stackingOrder === null
        ? (objectValue.stackingOrder ?? undefined)
        : validateInteger(
            objectValue.stackingOrder,
            `${path}.stackingOrder`,
            issues,
          ),
    textContent: validatePlainTextString(
      objectValue.textContent,
      `${path}.textContent`,
      issues,
    ),
    backgroundColor: validateOptionalString(
      objectValue.backgroundColor,
      `${path}.backgroundColor`,
      issues,
    ),
    metadata: validateMetadata(
      objectValue.metadata,
      `${path}.metadata`,
      issues,
    ),
  };
}

function validateReport(
  value: unknown,
  widgetCount: number,
  path: string,
  issues: string[],
): ProjectImportReport {
  const objectValue = ensureObject(value, path, issues) ?? {};

  rejectUnexpectedKeys(
    objectValue,
    path,
    [
      "droppedWidgets",
      "geometryWarningCount",
      "includedWidgets",
      "missingTextCount",
      "totalWidgets",
      "unknownTypeCount",
    ],
    issues,
  );

  const report = {
    totalWidgets: validateInteger(
      objectValue.totalWidgets,
      `${path}.totalWidgets`,
      issues,
    ),
    includedWidgets: validateInteger(
      objectValue.includedWidgets,
      `${path}.includedWidgets`,
      issues,
    ),
    droppedWidgets: validateInteger(
      objectValue.droppedWidgets,
      `${path}.droppedWidgets`,
      issues,
    ),
    unknownTypeCount: validateInteger(
      objectValue.unknownTypeCount,
      `${path}.unknownTypeCount`,
      issues,
    ),
    missingTextCount: validateInteger(
      objectValue.missingTextCount,
      `${path}.missingTextCount`,
      issues,
    ),
    geometryWarningCount: validateInteger(
      objectValue.geometryWarningCount,
      `${path}.geometryWarningCount`,
      issues,
    ),
  } satisfies ProjectImportReport;

  if (report.includedWidgets !== widgetCount) {
    issues.push(
      `${path}.includedWidgets: må være lik antall widgets i payloaden (${widgetCount})`,
    );
  }

  if (report.includedWidgets + report.droppedWidgets !== report.totalWidgets) {
    issues.push(
      `${path}: includedWidgets + droppedWidgets må være lik totalWidgets`,
    );
  }

  return report;
}

function findForbiddenKeys(
  value: unknown,
  path: string,
  issues: string[],
): void {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      findForbiddenKeys(item, `${path}[${index}]`, issues);
    }
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (FORBIDDEN_FIELD_NAMES.has(key)) {
      issues.push(`${path}.${key}: feltet er forbudt i importkontrakten`);
    }

    findForbiddenKeys(nestedValue, `${path}.${key}`, issues);
  }
}

export function serializeWidgetMetadata(
  metadata: ImportWidgetMetadata,
): Record<string, JsonValue> {
  return JSON.parse(JSON.stringify(metadata)) as Record<string, JsonValue>;
}

export function validateProjectImportRequest(
  value: unknown,
): ProjectImportRequest {
  const issues: string[] = [];
  findForbiddenKeys(value, "payload", issues);

  const objectValue = ensureObject(value, "payload", issues) ?? {};

  rejectUnexpectedKeys(
    objectValue,
    "payload",
    [
      "projectDescription",
      "projectName",
      "report",
      "sourceDescription",
      "sourceId",
      "widgets",
    ],
    issues,
  );

  const widgetsValue = objectValue.widgets;

  if (!Array.isArray(widgetsValue)) {
    issues.push("payload.widgets: må være en liste");
  }

  const widgets = Array.isArray(widgetsValue)
    ? widgetsValue.map((widget, index) =>
        validateWidget(widget, `payload.widgets[${index}]`, issues),
      )
    : [];

  const request = {
    projectName: validateRequiredString(
      objectValue.projectName,
      "payload.projectName",
      issues,
    ),
    projectDescription: validateOptionalString(
      objectValue.projectDescription,
      "payload.projectDescription",
      issues,
    ),
    sourceId: validateRequiredString(
      objectValue.sourceId,
      "payload.sourceId",
      issues,
    ),
    sourceDescription: validateRequiredString(
      objectValue.sourceDescription,
      "payload.sourceDescription",
      issues,
    ),
    widgets,
    report: validateReport(
      objectValue.report,
      widgets.length,
      "payload.report",
      issues,
    ),
  } satisfies ProjectImportRequest;

  if (issues.length > 0) {
    throw new ProjectImportValidationError([...new Set(issues)].sort());
  }

  return request;
}
