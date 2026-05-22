import {
  caseStatuses,
  type Dependency,
  dependencyStatuses,
  eastCategories,
  type ForgoodProfile,
  foggTargets,
  forgoodDimensions,
  forgoodLevels,
  type Governance,
  governanceReviewStatuses,
  type Hypothesis,
  journeyPhases,
  type Metric,
  measurementGaps,
  metricKinds,
  type OpenQuestion,
  type StudioCase,
  type StudioCaseBundle,
  sourceBases,
  surfaces,
  type Tiltak,
  type Tiltakspakke,
  targetAudiences,
} from "./model";

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const longNumberPattern = /\b\d{8,}\b/;
const diagnosisPattern =
  /\b(diagnose|diagnoser|depresjon|angst|kreft|ptsd|adhd|autisme|schizofreni|bipolar)\b/i;

type ValidationIssue = {
  path: string;
  message: string;
};

export class DataValidationError extends Error {
  constructor(readonly issues: ValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n"));
    this.name = "DataValidationError";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addIssue(issues: ValidationIssue[], path: string, message: string) {
  issues.push({ path, message });
}

function validateKeys(
  value: Record<string, unknown>,
  path: string,
  requiredKeys: string[],
  allowedKeys: string[],
  issues: ValidationIssue[],
) {
  for (const key of requiredKeys) {
    if (!(key in value)) {
      addIssue(issues, path, `mangler påkrevd felt "${key}"`);
    }
  }

  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      addIssue(issues, path, `ukjent felt "${key}"`);
    }
  }
}

function expectObject(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): Record<string, unknown> | null {
  if (!isObject(value)) {
    addIssue(issues, path, "må være et objekt");
    return null;
  }

  return value;
}

function expectString(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  maxLength = 220,
): string {
  if (typeof value !== "string") {
    addIssue(issues, path, "må være tekst");
    return "";
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    addIssue(issues, path, "kan ikke være tom");
    return "";
  }

  if (trimmedValue.length > maxLength) {
    addIssue(issues, path, `kan ikke være lengre enn ${maxLength} tegn`);
  }

  if (emailPattern.test(trimmedValue)) {
    addIssue(issues, path, "kan ikke inneholde e-postadresse");
  }

  if (longNumberPattern.test(trimmedValue)) {
    addIssue(
      issues,
      path,
      "kan ikke inneholde lange tallsekvenser som ligner person- eller telefonnummer",
    );
  }

  if (diagnosisPattern.test(trimmedValue)) {
    addIssue(
      issues,
      path,
      "kan ikke inneholde diagnose- eller helsereferanser",
    );
  }

  return trimmedValue;
}

function expectBoolean(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): boolean {
  if (typeof value !== "boolean") {
    addIssue(issues, path, "må være true eller false");
    return false;
  }

  return value;
}

function expectEnum<TValue extends string>(
  value: unknown,
  path: string,
  allowedValues: readonly TValue[],
  issues: ValidationIssue[],
): TValue {
  if (typeof value !== "string" || !allowedValues.includes(value as TValue)) {
    addIssue(issues, path, `må være en av: ${allowedValues.join(", ")}`);
    return allowedValues[0];
  }

  return value as TValue;
}

function expectStringArray<TValue extends string>(
  value: unknown,
  path: string,
  allowedValues: readonly TValue[] | null,
  issues: ValidationIssue[],
  minimumLength = 1,
): TValue[] {
  if (!Array.isArray(value)) {
    addIssue(issues, path, "må være en liste");
    return [];
  }

  const parsedValues = value.map((item, index) =>
    allowedValues
      ? expectEnum(item, `${path}[${index}]`, allowedValues, issues)
      : (expectString(item, `${path}[${index}]`, issues) as TValue),
  );

  const uniqueValues = [...new Set(parsedValues)];

  if (uniqueValues.length !== parsedValues.length) {
    addIssue(issues, path, "kan ikke inneholde duplikater");
  }

  if (parsedValues.length < minimumLength) {
    addIssue(issues, path, `må ha minst ${minimumLength} verdi(er)`);
  }

  return uniqueValues;
}

function validateObjectArray<TValue>(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  validator: (
    value: unknown,
    path: string,
    issues: ValidationIssue[],
  ) => TValue,
): TValue[] {
  if (!Array.isArray(value)) {
    addIssue(issues, path, "må være en liste");
    return [];
  }

  return value.map((item, index) => {
    return validator(item, `${path}[${index}]`, issues);
  });
}

function validateHypothesis(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): Hypothesis {
  const hypothesis = expectObject(value, path, issues) ?? {};

  validateKeys(
    hypothesis,
    path,
    ["id", "statement", "expectedEffect", "signal"],
    ["id", "statement", "expectedEffect", "signal"],
    issues,
  );

  return {
    id: expectString(hypothesis.id, `${path}.id`, issues, 80),
    statement: expectString(
      hypothesis.statement,
      `${path}.statement`,
      issues,
      260,
    ),
    expectedEffect: expectString(
      hypothesis.expectedEffect,
      `${path}.expectedEffect`,
      issues,
      260,
    ),
    signal: expectString(hypothesis.signal, `${path}.signal`, issues, 180),
  };
}

function validateMetric(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): Metric {
  const metric = expectObject(value, path, issues) ?? {};

  validateKeys(
    metric,
    path,
    ["id", "label", "kind", "measurementGap", "description"],
    ["id", "label", "kind", "measurementGap", "description"],
    issues,
  );

  return {
    id: expectString(metric.id, `${path}.id`, issues, 80),
    label: expectString(metric.label, `${path}.label`, issues, 120),
    kind: expectEnum(metric.kind, `${path}.kind`, metricKinds, issues),
    measurementGap: expectEnum(
      metric.measurementGap,
      `${path}.measurementGap`,
      measurementGaps,
      issues,
    ),
    description: expectString(
      metric.description,
      `${path}.description`,
      issues,
      220,
    ),
  };
}

function validateDependency(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): Dependency {
  const dependency = expectObject(value, path, issues) ?? {};

  validateKeys(
    dependency,
    path,
    ["id", "description", "ownerRole", "status"],
    ["id", "description", "ownerRole", "status"],
    issues,
  );

  return {
    id: expectString(dependency.id, `${path}.id`, issues, 80),
    description: expectString(
      dependency.description,
      `${path}.description`,
      issues,
      220,
    ),
    ownerRole: expectString(
      dependency.ownerRole,
      `${path}.ownerRole`,
      issues,
      120,
    ),
    status: expectEnum(
      dependency.status,
      `${path}.status`,
      dependencyStatuses,
      issues,
    ),
  };
}

function validateOpenQuestion(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): OpenQuestion {
  const openQuestion = expectObject(value, path, issues) ?? {};

  validateKeys(
    openQuestion,
    path,
    ["id", "question", "ownerRole", "status"],
    ["id", "question", "ownerRole", "status"],
    issues,
  );

  return {
    id: expectString(openQuestion.id, `${path}.id`, issues, 80),
    question: expectString(
      openQuestion.question,
      `${path}.question`,
      issues,
      220,
    ),
    ownerRole: expectString(
      openQuestion.ownerRole,
      `${path}.ownerRole`,
      issues,
      120,
    ),
    status: expectEnum(
      openQuestion.status,
      `${path}.status`,
      dependencyStatuses,
      issues,
    ),
  };
}

function validateGovernance(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): Governance {
  const governance = expectObject(value, path, issues) ?? {};

  validateKeys(
    governance,
    path,
    [
      "decisionOwnerRole",
      "editorRole",
      "stakeholders",
      "privacyReview",
      "ethicsReview",
      "nextDecisionGate",
    ],
    [
      "decisionOwnerRole",
      "editorRole",
      "stakeholders",
      "privacyReview",
      "ethicsReview",
      "nextDecisionGate",
    ],
    issues,
  );

  return {
    decisionOwnerRole: expectString(
      governance.decisionOwnerRole,
      `${path}.decisionOwnerRole`,
      issues,
      120,
    ),
    editorRole: expectString(
      governance.editorRole,
      `${path}.editorRole`,
      issues,
      120,
    ),
    stakeholders: expectStringArray(
      governance.stakeholders,
      `${path}.stakeholders`,
      null,
      issues,
    ),
    privacyReview: expectEnum(
      governance.privacyReview,
      `${path}.privacyReview`,
      governanceReviewStatuses,
      issues,
    ),
    ethicsReview: expectEnum(
      governance.ethicsReview,
      `${path}.ethicsReview`,
      governanceReviewStatuses,
      issues,
    ),
    nextDecisionGate: expectString(
      governance.nextDecisionGate,
      `${path}.nextDecisionGate`,
      issues,
      180,
    ),
  };
}

function validateForgoodProfile(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): ForgoodProfile {
  const forgood = expectObject(value, path, issues) ?? {};

  validateKeys(
    forgood,
    path,
    [...forgoodDimensions],
    [...forgoodDimensions],
    issues,
  );

  const profile = {} as ForgoodProfile;

  for (const dimension of forgoodDimensions) {
    const assessment =
      expectObject(forgood[dimension], `${path}.${dimension}`, issues) ?? {};

    validateKeys(
      assessment,
      `${path}.${dimension}`,
      ["level", "rationale"],
      ["level", "rationale"],
      issues,
    );

    profile[dimension] = {
      level: expectEnum(
        assessment.level,
        `${path}.${dimension}.level`,
        forgoodLevels,
        issues,
      ),
      rationale: expectString(
        assessment.rationale,
        `${path}.${dimension}.rationale`,
        issues,
        220,
      ),
    };
  }

  return profile;
}

function validateCommonBase(
  value: Record<string, unknown>,
  path: string,
  issues: ValidationIssue[],
) {
  const id = expectString(value.id, `${path}.id`, issues, 80);

  if (id.length > 0 && !idPattern.test(id)) {
    addIssue(
      issues,
      `${path}.id`,
      "må være kebab-case med små bokstaver, tall og bindestrek",
    );
  }

  return {
    id,
    name: expectString(value.name, `${path}.name`, issues, 120),
    summary: expectString(value.summary, `${path}.summary`, issues, 260),
    status: expectEnum(value.status, `${path}.status`, caseStatuses, issues),
    targetAudiences: expectStringArray(
      value.targetAudiences,
      `${path}.targetAudiences`,
      targetAudiences,
      issues,
    ),
    journeyPhases: expectStringArray(
      value.journeyPhases,
      `${path}.journeyPhases`,
      journeyPhases,
      issues,
    ),
    surfaces: expectStringArray(
      value.surfaces,
      `${path}.surfaces`,
      surfaces,
      issues,
    ),
    governance: validateGovernance(
      value.governance,
      `${path}.governance`,
      issues,
    ),
    dependencies: validateObjectArray(
      value.dependencies,
      `${path}.dependencies`,
      issues,
      validateDependency,
    ),
    openQuestions: validateObjectArray(
      value.openQuestions,
      `${path}.openQuestions`,
      issues,
      validateOpenQuestion,
    ),
  };
}

export function validateStudioCase(value: unknown, path = "case"): StudioCase {
  const issues: ValidationIssue[] = [];
  const studioCase = expectObject(value, path, issues) ?? {};

  validateKeys(
    studioCase,
    path,
    [
      "entityType",
      "id",
      "name",
      "summary",
      "problemStatement",
      "status",
      "boundariesConfirmed",
      "sourceBasis",
      "targetAudiences",
      "journeyPhases",
      "surfaces",
      "hypotheses",
      "metrics",
      "governance",
      "dependencies",
      "openQuestions",
    ],
    [
      "entityType",
      "id",
      "name",
      "summary",
      "problemStatement",
      "status",
      "boundariesConfirmed",
      "sourceBasis",
      "targetAudiences",
      "journeyPhases",
      "surfaces",
      "hypotheses",
      "metrics",
      "governance",
      "dependencies",
      "openQuestions",
    ],
    issues,
  );

  const commonBase = validateCommonBase(studioCase, path, issues);

  const parsedCase: StudioCase = {
    entityType: expectEnum(
      studioCase.entityType,
      `${path}.entityType`,
      ["case"],
      issues,
    ),
    ...commonBase,
    problemStatement: expectString(
      studioCase.problemStatement,
      `${path}.problemStatement`,
      issues,
      320,
    ),
    boundariesConfirmed: expectBoolean(
      studioCase.boundariesConfirmed,
      `${path}.boundariesConfirmed`,
      issues,
    ),
    sourceBasis: expectStringArray(
      studioCase.sourceBasis,
      `${path}.sourceBasis`,
      sourceBases,
      issues,
    ),
    hypotheses: validateObjectArray(
      studioCase.hypotheses,
      `${path}.hypotheses`,
      issues,
      validateHypothesis,
    ),
    metrics: validateObjectArray(
      studioCase.metrics,
      `${path}.metrics`,
      issues,
      validateMetric,
    ),
  };

  if (!parsedCase.boundariesConfirmed) {
    addIssue(
      issues,
      `${path}.boundariesConfirmed`,
      "må være true for alle case",
    );
  }

  if (issues.length > 0) {
    throw new DataValidationError(issues);
  }

  return parsedCase;
}

export function validateTiltak(value: unknown, path = "tiltak"): Tiltak {
  const issues: ValidationIssue[] = [];
  const tiltak = expectObject(value, path, issues) ?? {};

  validateKeys(
    tiltak,
    path,
    [
      "entityType",
      "id",
      "caseId",
      "name",
      "summary",
      "status",
      "targetAudiences",
      "journeyPhases",
      "surfaces",
      "hypothesis",
      "metrics",
      "east",
      "fogg",
      "forgood",
      "governance",
      "dependencies",
      "openQuestions",
    ],
    [
      "entityType",
      "id",
      "caseId",
      "name",
      "summary",
      "status",
      "targetAudiences",
      "journeyPhases",
      "surfaces",
      "hypothesis",
      "metrics",
      "east",
      "fogg",
      "forgood",
      "governance",
      "dependencies",
      "openQuestions",
    ],
    issues,
  );

  const commonBase = validateCommonBase(tiltak, path, issues);
  const fogg = expectObject(tiltak.fogg, `${path}.fogg`, issues) ?? {};

  validateKeys(
    fogg,
    `${path}.fogg`,
    ["target", "rationale"],
    ["target", "rationale"],
    issues,
  );

  const parsedTiltak: Tiltak = {
    entityType: expectEnum(
      tiltak.entityType,
      `${path}.entityType`,
      ["tiltak"],
      issues,
    ),
    ...commonBase,
    caseId: expectString(tiltak.caseId, `${path}.caseId`, issues, 80),
    hypothesis: validateHypothesis(
      tiltak.hypothesis,
      `${path}.hypothesis`,
      issues,
    ),
    metrics: validateObjectArray(
      tiltak.metrics,
      `${path}.metrics`,
      issues,
      validateMetric,
    ),
    east: expectStringArray(
      tiltak.east,
      `${path}.east`,
      eastCategories,
      issues,
    ),
    fogg: {
      target: expectEnum(
        fogg.target,
        `${path}.fogg.target`,
        foggTargets,
        issues,
      ),
      rationale: expectString(
        fogg.rationale,
        `${path}.fogg.rationale`,
        issues,
        220,
      ),
    },
    forgood: validateForgoodProfile(tiltak.forgood, `${path}.forgood`, issues),
  };

  if (issues.length > 0) {
    throw new DataValidationError(issues);
  }

  return parsedTiltak;
}

export function validateTiltakspakke(
  value: unknown,
  path = "tiltakspakke",
): Tiltakspakke {
  const issues: ValidationIssue[] = [];
  const tiltakspakke = expectObject(value, path, issues) ?? {};

  validateKeys(
    tiltakspakke,
    path,
    [
      "entityType",
      "id",
      "caseId",
      "name",
      "summary",
      "status",
      "targetAudiences",
      "journeyPhases",
      "surfaces",
      "tiltakIds",
      "hypotheses",
      "metrics",
      "aggregatedForgood",
      "governance",
      "dependencies",
      "openQuestions",
    ],
    [
      "entityType",
      "id",
      "caseId",
      "name",
      "summary",
      "status",
      "targetAudiences",
      "journeyPhases",
      "surfaces",
      "tiltakIds",
      "hypotheses",
      "metrics",
      "aggregatedForgood",
      "governance",
      "dependencies",
      "openQuestions",
    ],
    issues,
  );

  const commonBase = validateCommonBase(tiltakspakke, path, issues);

  const parsedTiltakspakke: Tiltakspakke = {
    entityType: expectEnum(
      tiltakspakke.entityType,
      `${path}.entityType`,
      ["tiltakspakke"],
      issues,
    ),
    ...commonBase,
    caseId: expectString(tiltakspakke.caseId, `${path}.caseId`, issues, 80),
    tiltakIds: expectStringArray(
      tiltakspakke.tiltakIds,
      `${path}.tiltakIds`,
      null,
      issues,
    ),
    hypotheses: validateObjectArray(
      tiltakspakke.hypotheses,
      `${path}.hypotheses`,
      issues,
      validateHypothesis,
    ),
    metrics: validateObjectArray(
      tiltakspakke.metrics,
      `${path}.metrics`,
      issues,
      validateMetric,
    ),
    aggregatedForgood: validateForgoodProfile(
      tiltakspakke.aggregatedForgood,
      `${path}.aggregatedForgood`,
      issues,
    ),
  };

  if (issues.length > 0) {
    throw new DataValidationError(issues);
  }

  return parsedTiltakspakke;
}

export function validateStudioCaseBundle(
  bundle: StudioCaseBundle,
): StudioCaseBundle {
  const issues: ValidationIssue[] = [];

  if (bundle.tiltak.length === 0) {
    addIssue(issues, "tiltak", "må inneholde minst ett tiltak");
  }

  if (bundle.tiltakspakker.length === 0) {
    addIssue(issues, "tiltakspakker", "må inneholde minst én tiltakspakke");
  }

  const tiltakIds = new Set(bundle.tiltak.map((item) => item.id));

  for (const tiltak of bundle.tiltak) {
    if (tiltak.caseId !== bundle.case.id) {
      addIssue(
        issues,
        `tiltak.${tiltak.id}.caseId`,
        `må peke til case "${bundle.case.id}"`,
      );
    }
  }

  for (const tiltakspakke of bundle.tiltakspakker) {
    if (tiltakspakke.caseId !== bundle.case.id) {
      addIssue(
        issues,
        `tiltakspakker.${tiltakspakke.id}.caseId`,
        `må peke til case "${bundle.case.id}"`,
      );
    }

    for (const tiltakId of tiltakspakke.tiltakIds) {
      if (!tiltakIds.has(tiltakId)) {
        addIssue(
          issues,
          `tiltakspakker.${tiltakspakke.id}.tiltakIds`,
          `refererer til ukjent tiltak "${tiltakId}"`,
        );
      }
    }
  }

  if (issues.length > 0) {
    throw new DataValidationError(issues);
  }

  return bundle;
}
