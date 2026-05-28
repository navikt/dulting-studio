const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_WIDGET_IDS = 100;
const MAX_REASON_LENGTH = 500;

export type WidgetTriageState = "open" | "parked" | "rejected";

export type WidgetTriageRequestBody = {
  widgetIds: string[];
  state: WidgetTriageState;
  reason: string | null;
};

export type WidgetTriageValidationError = {
  field: string;
  message: string;
};

export type WidgetTriageValidationResult =
  | { ok: true; data: WidgetTriageRequestBody }
  | { ok: false; errors: WidgetTriageValidationError[] };

const ALLOWED_KEYS = new Set(["widgetIds", "state", "reason"]);
const ALLOWED_STATES = new Set(["open", "parked", "rejected"]);

export function validateWidgetTriageBody(
  body: unknown,
): WidgetTriageValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      errors: [{ field: "body", message: "Ugyldig forespørsel" }],
    };
  }

  const record = body as Record<string, unknown>;
  const errors: WidgetTriageValidationError[] = [];

  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) {
      errors.push({ field: key, message: "Ukjent felt" });
    }
  }

  const widgetIds = record.widgetIds;
  if (!Array.isArray(widgetIds) || widgetIds.length === 0) {
    errors.push({
      field: "widgetIds",
      message: "Velg minst én widget.",
    });
  } else if (widgetIds.length > MAX_WIDGET_IDS) {
    errors.push({
      field: "widgetIds",
      message: `Maks ${MAX_WIDGET_IDS} widgets om gangen.`,
    });
  } else {
    const seen = new Set<string>();
    for (const widgetId of widgetIds) {
      if (typeof widgetId !== "string" || !UUID_REGEX.test(widgetId)) {
        errors.push({
          field: "widgetIds",
          message: "Alle widget-id-er må være gyldige UUID-er.",
        });
        break;
      }

      if (seen.has(widgetId)) {
        errors.push({
          field: "widgetIds",
          message: "Samme widget kan ikke sendes flere ganger.",
        });
        break;
      }

      seen.add(widgetId);
    }
  }

  if (typeof record.state !== "string" || !ALLOWED_STATES.has(record.state)) {
    errors.push({
      field: "state",
      message: "Må være 'open', 'parked' eller 'rejected'",
    });
  }

  if (record.reason !== undefined && record.reason !== null) {
    if (typeof record.reason !== "string") {
      errors.push({ field: "reason", message: "Må være tekst" });
    } else if (
      record.reason.length > MAX_REASON_LENGTH ||
      /[<>]/.test(record.reason)
    ) {
      errors.push({
        field: "reason",
        message: `Maks ${MAX_REASON_LENGTH} tegn og ingen HTML.`,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const state = record.state as WidgetTriageState;
  return {
    ok: true,
    data: {
      widgetIds: widgetIds as string[],
      state,
      reason:
        state === "open"
          ? null
          : record.reason != null
            ? (record.reason as string).trim() || null
            : null,
    },
  };
}
