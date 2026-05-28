const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_TITLE_LENGTH = 200;
const MAX_RATIONALE_LENGTH = 1000;
const MAX_LONG_TEXT_LENGTH = 2000;
const MAX_SHORT_TEXT_LENGTH = 200;

const PLACEMENT_ROLES = [
  "journey_step",
  "cross_cutting_support",
  "package_support",
  "clarification",
  "context",
] as const;

const BODY_ALLOWED_KEYS = new Set([
  "title",
  "desiredBehavior",
  "rationale",
  "actorTrack",
  "journeyStep",
  "placementRole",
  "widgetIds",
  "piiConfirmed",
]);

export type PlacementRole = (typeof PLACEMENT_ROLES)[number];

export type CreateInterventionCandidateInput = {
  projectId: string;
  title: string;
  status: InterventionCandidateStatus;
  desiredBehavior: string | null;
  rationale: string;
  actorTrack: string | null;
  journeyStep: string | null;
  placementRole: PlacementRole | null;
  widgetIds: string[];
  piiConfirmed: true;
};

export type InterventionCandidateStatus =
  | "proposed"
  | "needs_clarification"
  | "assessed_relevant"
  | "ready_for_package"
  | "parked"
  | "rejected";

export type CreateInterventionCandidateBodyInput = Omit<
  CreateInterventionCandidateInput,
  "projectId" | "status"
>;

export type InterventionCandidateValidationError = {
  field: string;
  message: string;
};

export type InterventionCandidateValidationResult =
  | { ok: true; data: CreateInterventionCandidateBodyInput }
  | { ok: false; errors: InterventionCandidateValidationError[] };

function containsHtmlMarkup(value: string) {
  return /<\s*\/?\s*[a-z][^>]*>/i.test(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function validateRequiredText(
  record: Record<string, unknown>,
  field: string,
  maxLength: number,
  requiredMessage: string,
  errors: InterventionCandidateValidationError[],
) {
  const value = record[field];

  if (typeof value !== "string" || value.trim() === "") {
    errors.push({ field, message: requiredMessage });
    return "";
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length > maxLength) {
    errors.push({ field, message: `Maks ${maxLength} tegn` });
  }

  if (containsHtmlMarkup(trimmedValue)) {
    errors.push({ field, message: "Må være ren tekst uten HTML" });
  }

  return trimmedValue;
}

function validateOptionalText(
  record: Record<string, unknown>,
  field: string,
  maxLength: number,
  errors: InterventionCandidateValidationError[],
) {
  const value = record[field];

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    errors.push({ field, message: "Må være tekst eller null" });
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (trimmedValue.length > maxLength) {
    errors.push({ field, message: `Maks ${maxLength} tegn` });
  }

  if (containsHtmlMarkup(trimmedValue)) {
    errors.push({ field, message: "Må være ren tekst uten HTML" });
  }

  return trimmedValue;
}

export function validateCreateInterventionCandidateBody(
  body: unknown,
): InterventionCandidateValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      errors: [{ field: "body", message: "Ugyldig forespørsel" }],
    };
  }

  const record = body as Record<string, unknown>;
  const errors: InterventionCandidateValidationError[] = [];

  for (const key of Object.keys(record)) {
    if (!BODY_ALLOWED_KEYS.has(key)) {
      errors.push({ field: key, message: "Ukjent felt" });
    }
  }

  const title = validateRequiredText(
    record,
    "title",
    MAX_TITLE_LENGTH,
    "Påkrevd felt. Maks 200 tegn.",
    errors,
  );
  const rationale = validateRequiredText(
    record,
    "rationale",
    MAX_RATIONALE_LENGTH,
    "Skriv en kort begrunnelse. Maks 1000 tegn.",
    errors,
  );
  const desiredBehavior = validateOptionalText(
    record,
    "desiredBehavior",
    MAX_LONG_TEXT_LENGTH,
    errors,
  );
  const actorTrack = validateOptionalText(
    record,
    "actorTrack",
    MAX_SHORT_TEXT_LENGTH,
    errors,
  );
  const journeyStep = validateOptionalText(
    record,
    "journeyStep",
    MAX_SHORT_TEXT_LENGTH,
    errors,
  );

  const placementRoleValue = validateOptionalText(
    record,
    "placementRole",
    MAX_SHORT_TEXT_LENGTH,
    errors,
  );
  let placementRole: PlacementRole | null = null;
  if (placementRoleValue !== null) {
    if (PLACEMENT_ROLES.includes(placementRoleValue as PlacementRole)) {
      placementRole = placementRoleValue as PlacementRole;
    } else {
      errors.push({
        field: "placementRole",
        message: "Ugyldig plassering eller rolle",
      });
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
    if (widgetIdsValue.length < 1) {
      errors.push({
        field: "widgetIds",
        message: "Må inneholde minst én widget-id",
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

  if (record.piiConfirmed !== true) {
    errors.push({
      field: "piiConfirmed",
      message: "Bekreft PII-stoppunktet før promotering.",
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      title,
      rationale,
      desiredBehavior,
      actorTrack,
      journeyStep,
      placementRole,
      widgetIds,
      piiConfirmed: true,
    },
  };
}
