const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_CLUSTER_NAME_LENGTH = 200;
const MAX_CLUSTER_SUMMARY_LENGTH = 2000;
const CLUSTER_STATUSES = ["draft", "validated"] as const;
const ALLOWED_KEYS = new Set([
  "projectId",
  "name",
  "summary",
  "status",
  "widgetIds",
]);

export type ClusterStatus = (typeof CLUSTER_STATUSES)[number];

export type CreateClusterInput = {
  projectId: string;
  name: string;
  summary: string | null;
  status: ClusterStatus;
  widgetIds: string[];
};

export type ClusterValidationError = {
  field: string;
  message: string;
};

export type ClusterValidationResult =
  | { ok: true; data: CreateClusterInput }
  | { ok: false; errors: ClusterValidationError[] };

function containsHtmlMarkup(value: string) {
  return /<\s*\/?\s*[a-z][^>]*>/i.test(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export function validateCreateClusterBody(
  body: unknown,
): ClusterValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      errors: [{ field: "body", message: "Ugyldig forespørsel" }],
    };
  }

  const record = body as Record<string, unknown>;
  const errors: ClusterValidationError[] = [];

  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) {
      errors.push({ field: key, message: "Ukjent felt" });
    }
  }

  const projectId = record.projectId;
  if (!isUuid(projectId)) {
    errors.push({ field: "projectId", message: "Må være en gyldig UUID" });
  }

  const nameValue = record.name;
  let name = "";
  if (typeof nameValue !== "string" || nameValue.trim() === "") {
    errors.push({ field: "name", message: "Påkrevd felt. Maks 200 tegn." });
  } else {
    name = nameValue.trim();
    if (name.length > MAX_CLUSTER_NAME_LENGTH) {
      errors.push({
        field: "name",
        message: `Maks ${MAX_CLUSTER_NAME_LENGTH} tegn`,
      });
    }
    if (containsHtmlMarkup(name)) {
      errors.push({ field: "name", message: "Må være ren tekst uten HTML" });
    }
  }

  const summaryValue = record.summary;
  let summary: string | null = null;
  if (summaryValue !== undefined && summaryValue !== null) {
    if (typeof summaryValue !== "string") {
      errors.push({ field: "summary", message: "Må være tekst eller null" });
    } else {
      summary = summaryValue.trim() || null;
      if (summary && summary.length > MAX_CLUSTER_SUMMARY_LENGTH) {
        errors.push({
          field: "summary",
          message: `Maks ${MAX_CLUSTER_SUMMARY_LENGTH} tegn`,
        });
      }
      if (summary && containsHtmlMarkup(summary)) {
        errors.push({
          field: "summary",
          message: "Må være ren tekst uten HTML",
        });
      }
    }
  }

  const statusValue = record.status;
  let status: ClusterStatus = "draft";
  if (statusValue !== undefined) {
    if (statusValue !== "draft" && statusValue !== "validated") {
      errors.push({
        field: "status",
        message: "Må være «draft» eller «validated»",
      });
    } else {
      status = statusValue;
    }
  }

  const widgetIdsValue = record.widgetIds;
  const widgetIds: string[] = [];

  if (!Array.isArray(widgetIdsValue)) {
    errors.push({
      field: "widgetIds",
      message: "Må være en liste med widget-id-er",
    });
  } else {
    if (widgetIdsValue.length < 2) {
      errors.push({
        field: "widgetIds",
        message: "Må inneholde minst to widget-id-er",
      });
    }

    const seenWidgetIds = new Set<string>();
    let hasDuplicateWidgetIdError = false;

    for (const [index, widgetId] of widgetIdsValue.entries()) {
      if (!isUuid(widgetId)) {
        errors.push({
          field: `widgetIds[${index}]`,
          message: "Må være en gyldig UUID",
        });
        continue;
      }

      if (seenWidgetIds.has(widgetId)) {
        if (!hasDuplicateWidgetIdError) {
          errors.push({
            field: "widgetIds",
            message: "Kan ikke inneholde duplikate widget-id-er",
          });
          hasDuplicateWidgetIdError = true;
        }
        continue;
      }

      seenWidgetIds.add(widgetId);
      widgetIds.push(widgetId);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const sanitizedProjectId = isUuid(projectId) ? projectId : "";

  return {
    ok: true,
    data: {
      projectId: sanitizedProjectId,
      name,
      summary,
      status,
      widgetIds,
    },
  };
}
