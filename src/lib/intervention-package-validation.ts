const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_ASSESSMENT_LENGTH = 2000;
const MAX_NOTE_LENGTH = 500;
const MAX_CATEGORY_LENGTH = 100;

export const FORGOOD_DIMENSIONS = [
  "fairness",
  "openness",
  "respect",
  "goals",
  "opinions",
  "options",
  "delegation",
] as const;

export type ForgoodDimension = (typeof FORGOOD_DIMENSIONS)[number];

export type PackageForgoodFlag = {
  dimension: ForgoodDimension;
  note: string;
};

export type PackageOpenQuestion = {
  question: string;
  category: string | null;
};

export type PackageStopCriterion = {
  criterion: string;
};

export type AddPackageMemberInput = {
  candidateId: string;
  assessment: string;
  forgoodFlags: PackageForgoodFlag[];
  openQuestions: PackageOpenQuestion[];
  stopCriteria: PackageStopCriterion[];
  piiConfirmed: true;
};

export type ExportPackageInput = {
  format: "markdown" | "json";
  piiExportConfirmed: true;
};

export type InterventionPackageValidationError = {
  field: string;
  message: string;
};

export type InterventionPackageValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: InterventionPackageValidationError[] };

const ADD_MEMBER_ALLOWED_KEYS = new Set([
  "candidateId",
  "assessment",
  "forgoodFlags",
  "openQuestions",
  "stopCriteria",
  "piiConfirmed",
]);

const EXPORT_ALLOWED_KEYS = new Set(["format", "piiExportConfirmed"]);

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function containsHtmlMarkup(value: string) {
  return /<\s*\/?\s*[a-z][^>]*>/i.test(value);
}

function validateObject(
  body: unknown,
  allowedKeys: Set<string>,
): {
  record: Record<string, unknown>;
  errors: InterventionPackageValidationError[];
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      record: {},
      errors: [{ field: "body", message: "Ugyldig forespørsel" }],
    };
  }

  const record = body as Record<string, unknown>;
  const errors: InterventionPackageValidationError[] = [];

  for (const key of Object.keys(record)) {
    if (!allowedKeys.has(key)) {
      errors.push({ field: key, message: "Ukjent felt" });
    }
  }

  return { record, errors };
}

function validateRequiredText(
  record: Record<string, unknown>,
  field: string,
  maxLength: number,
  requiredMessage: string,
  errors: InterventionPackageValidationError[],
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

function validateOptionalTextValue(
  value: unknown,
  field: string,
  maxLength: number,
  errors: InterventionPackageValidationError[],
) {
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

function validateForgoodFlags(
  value: unknown,
  errors: InterventionPackageValidationError[],
): PackageForgoodFlag[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    errors.push({ field: "forgoodFlags", message: "Må være en liste" });
    return [];
  }

  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push({
        field: `forgoodFlags[${index}]`,
        message: "Må være et objekt",
      });
      return [];
    }

    const record = item as Record<string, unknown>;
    const dimension = record.dimension;
    if (
      typeof dimension !== "string" ||
      !FORGOOD_DIMENSIONS.includes(dimension as ForgoodDimension)
    ) {
      errors.push({
        field: `forgoodFlags[${index}].dimension`,
        message: "Ugyldig FORGOOD-dimensjon",
      });
      return [];
    }

    const note = validateRequiredText(
      record,
      "note",
      MAX_NOTE_LENGTH,
      "Skriv en kort FORGOOD-refleksjon.",
      errorsForNestedField(errors, `forgoodFlags[${index}]`),
    );

    return [{ dimension: dimension as ForgoodDimension, note }];
  });
}

function validateOpenQuestions(
  value: unknown,
  errors: InterventionPackageValidationError[],
): PackageOpenQuestion[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    errors.push({ field: "openQuestions", message: "Må være en liste" });
    return [];
  }

  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push({
        field: `openQuestions[${index}]`,
        message: "Må være et objekt",
      });
      return [];
    }

    const record = item as Record<string, unknown>;
    const question = validateRequiredText(
      record,
      "question",
      MAX_NOTE_LENGTH,
      "Skriv spørsmålet.",
      errorsForNestedField(errors, `openQuestions[${index}]`),
    );
    const category = validateOptionalTextValue(
      record.category,
      `openQuestions[${index}].category`,
      MAX_CATEGORY_LENGTH,
      errors,
    );

    return [{ question, category }];
  });
}

function validateStopCriteria(
  value: unknown,
  errors: InterventionPackageValidationError[],
): PackageStopCriterion[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    errors.push({ field: "stopCriteria", message: "Må være en liste" });
    return [];
  }

  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push({
        field: `stopCriteria[${index}]`,
        message: "Må være et objekt",
      });
      return [];
    }

    const record = item as Record<string, unknown>;
    const criterion = validateRequiredText(
      record,
      "criterion",
      MAX_NOTE_LENGTH,
      "Skriv stoppkriteriet.",
      errorsForNestedField(errors, `stopCriteria[${index}]`),
    );

    return [{ criterion }];
  });
}

function errorsForNestedField(
  errors: InterventionPackageValidationError[],
  prefix: string,
): InterventionPackageValidationError[] {
  return new Proxy(errors, {
    get(target, prop, receiver) {
      if (prop !== "push") {
        return Reflect.get(target, prop, receiver);
      }

      return (...items: InterventionPackageValidationError[]) =>
        target.push(
          ...items.map((item) => ({
            ...item,
            field: `${prefix}.${item.field}`,
          })),
        );
    },
  });
}

export function validateAddPackageMemberBody(
  body: unknown,
): InterventionPackageValidationResult<AddPackageMemberInput> {
  const { record, errors } = validateObject(body, ADD_MEMBER_ALLOWED_KEYS);

  if (!isUuid(record.candidateId)) {
    errors.push({ field: "candidateId", message: "Må være en gyldig UUID" });
  }

  const assessment = validateRequiredText(
    record,
    "assessment",
    MAX_ASSESSMENT_LENGTH,
    "Skriv en kort vurdering før tiltaket legges i pakken.",
    errors,
  );
  const forgoodFlags = validateForgoodFlags(record.forgoodFlags, errors);
  const openQuestions = validateOpenQuestions(record.openQuestions, errors);
  const stopCriteria = validateStopCriteria(record.stopCriteria, errors);

  if (record.piiConfirmed !== true) {
    errors.push({
      field: "piiConfirmed",
      message: "Bekreft PII-stoppunktet før tiltaket legges i pakken.",
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      candidateId: record.candidateId as string,
      assessment,
      forgoodFlags,
      openQuestions,
      stopCriteria,
      piiConfirmed: true,
    },
  };
}

export function validateExportPackageBody(
  body: unknown,
): InterventionPackageValidationResult<ExportPackageInput> {
  const { record, errors } = validateObject(body, EXPORT_ALLOWED_KEYS);

  const format = record.format;
  if (format !== "markdown" && format !== "json") {
    errors.push({ field: "format", message: "Velg Markdown eller JSON" });
  }

  if (record.piiExportConfirmed !== true) {
    errors.push({
      field: "piiExportConfirmed",
      message: "Bekreft PII-stoppunktet før eksport.",
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      format: format as "markdown" | "json",
      piiExportConfirmed: true,
    },
  };
}
