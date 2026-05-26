/**
 * Classification request body validation.
 * Pure functions — no database dependency, fully testable.
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Max lengths for free-text fields. */
const MAX_LANE_KEY_LENGTH = 100;
const MAX_LANE_LABEL_LENGTH = 200;
const MAX_SCENARIO_LENGTH = 300;
const MAX_ACTOR_TRACK_LENGTH = 200;
const MAX_JOURNEY_STEP_LENGTH = 300;
const MAX_NOTES_LENGTH = 2000;

export type ClassifyRequestBody = {
  laneTypeKey: string;
  laneTypeLabel: string;
  scenario?: string | null;
  actorTrack?: string | null;
  journeyStep?: string | null;
  journeyIndex?: number | null;
  notes?: string | null;
  version: number;
  /**
   * Explicit expected server state to prevent create-race:
   * - "unclassified": client expects no classification exists → create path
   * - "classified": client expects an existing classification → update path
   */
  expectedState: "unclassified" | "classified";
};

export type ClassifyValidationError = {
  field: string;
  message: string;
};

export type ClassifyValidationResult =
  | { ok: true; data: ClassifyRequestBody }
  | { ok: false; errors: ClassifyValidationError[] };

/**
 * Strictly allowed top-level keys in the request body.
 * Any extra keys are rejected to prevent data injection.
 */
const ALLOWED_KEYS = new Set([
  "laneTypeKey",
  "laneTypeLabel",
  "scenario",
  "actorTrack",
  "journeyStep",
  "journeyIndex",
  "notes",
  "version",
  "expectedState",
]);

export function validateUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export function validateClassifyBody(body: unknown): ClassifyValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      errors: [{ field: "body", message: "Ugyldig forespørsel" }],
    };
  }

  const record = body as Record<string, unknown>;
  const errors: ClassifyValidationError[] = [];

  // Reject unknown keys
  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) {
      errors.push({ field: key, message: "Ukjent felt" });
    }
  }

  // Required: version (positive integer)
  if (!("version" in record) || typeof record.version !== "number") {
    errors.push({ field: "version", message: "Må være et positivt heltall" });
  } else if (!Number.isInteger(record.version) || record.version < 1) {
    errors.push({ field: "version", message: "Må være et positivt heltall" });
  }

  // Required: expectedState ("unclassified" | "classified")
  if (
    !("expectedState" in record) ||
    (record.expectedState !== "unclassified" &&
      record.expectedState !== "classified")
  ) {
    errors.push({
      field: "expectedState",
      message: "Må være «unclassified» eller «classified»",
    });
  }

  // Required: laneTypeKey (non-empty string)
  if (
    !("laneTypeKey" in record) ||
    typeof record.laneTypeKey !== "string" ||
    record.laneTypeKey.trim() === ""
  ) {
    errors.push({
      field: "laneTypeKey",
      message: "Påkrevd felt. Maks 100 tegn.",
    });
  } else if (record.laneTypeKey.length > MAX_LANE_KEY_LENGTH) {
    errors.push({
      field: "laneTypeKey",
      message: `Maks ${MAX_LANE_KEY_LENGTH} tegn`,
    });
  }

  // Required: laneTypeLabel (non-empty string)
  if (
    !("laneTypeLabel" in record) ||
    typeof record.laneTypeLabel !== "string" ||
    record.laneTypeLabel.trim() === ""
  ) {
    errors.push({
      field: "laneTypeLabel",
      message: "Påkrevd felt. Maks 200 tegn.",
    });
  } else if (record.laneTypeLabel.length > MAX_LANE_LABEL_LENGTH) {
    errors.push({
      field: "laneTypeLabel",
      message: `Maks ${MAX_LANE_LABEL_LENGTH} tegn`,
    });
  }

  // Optional: scenario
  if (record.scenario !== undefined && record.scenario !== null) {
    if (typeof record.scenario !== "string") {
      errors.push({ field: "scenario", message: "Må være tekst" });
    } else if (record.scenario.length > MAX_SCENARIO_LENGTH) {
      errors.push({
        field: "scenario",
        message: `Maks ${MAX_SCENARIO_LENGTH} tegn`,
      });
    }
  }

  // Optional: actorTrack
  if (record.actorTrack !== undefined && record.actorTrack !== null) {
    if (typeof record.actorTrack !== "string") {
      errors.push({ field: "actorTrack", message: "Må være tekst" });
    } else if (record.actorTrack.length > MAX_ACTOR_TRACK_LENGTH) {
      errors.push({
        field: "actorTrack",
        message: `Maks ${MAX_ACTOR_TRACK_LENGTH} tegn`,
      });
    }
  }

  // Optional: journeyStep
  if (record.journeyStep !== undefined && record.journeyStep !== null) {
    if (typeof record.journeyStep !== "string") {
      errors.push({ field: "journeyStep", message: "Må være tekst" });
    } else if (record.journeyStep.length > MAX_JOURNEY_STEP_LENGTH) {
      errors.push({
        field: "journeyStep",
        message: `Maks ${MAX_JOURNEY_STEP_LENGTH} tegn`,
      });
    }
  }

  // Optional: journeyIndex (non-negative integer)
  if (record.journeyIndex !== undefined && record.journeyIndex !== null) {
    if (
      typeof record.journeyIndex !== "number" ||
      !Number.isInteger(record.journeyIndex) ||
      record.journeyIndex < 0
    ) {
      errors.push({
        field: "journeyIndex",
        message: "Må være et ikke-negativt heltall",
      });
    }
  }

  // Optional: notes
  if (record.notes !== undefined && record.notes !== null) {
    if (typeof record.notes !== "string") {
      errors.push({ field: "notes", message: "Må være tekst" });
    } else if (record.notes.length > MAX_NOTES_LENGTH) {
      errors.push({
        field: "notes",
        message: `Maks ${MAX_NOTES_LENGTH} tegn`,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      laneTypeKey: (record.laneTypeKey as string).trim(),
      laneTypeLabel: (record.laneTypeLabel as string).trim(),
      scenario:
        record.scenario != null
          ? (record.scenario as string).trim() || null
          : null,
      actorTrack:
        record.actorTrack != null
          ? (record.actorTrack as string).trim() || null
          : null,
      journeyStep:
        record.journeyStep != null
          ? (record.journeyStep as string).trim() || null
          : null,
      journeyIndex:
        record.journeyIndex != null ? (record.journeyIndex as number) : null,
      notes:
        record.notes != null ? (record.notes as string).trim() || null : null,
      version: record.version as number,
      expectedState: record.expectedState as "unclassified" | "classified",
    },
  };
}
