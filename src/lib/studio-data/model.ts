export const caseStatuses = [
  "forslag",
  "vurderes",
  "forkastet",
  "klar-for-eksperiment",
] as const;

export const governanceReviewStatuses = [
  "ikke-startet",
  "under-avklaring",
  "godkjent",
  "stoppet",
] as const;

export const journeyPhases = [
  "forsta-oppgaven",
  "komme-i-gang",
  "samarbeide-om-planen",
  "holde-fremdrift",
  "avklare-neste-steg",
] as const;

export const surfaces = [
  "inngangsside",
  "planoversikt",
  "veiviser",
  "påminnelse",
  "bekreftelse",
] as const;

export const targetAudiences = [
  "arbeidsgiver",
  "sykmeldt",
  "nav-ansatt",
] as const;

export const metricKinds = ["ledende", "etterfolgende", "guardrail"] as const;

export const measurementGaps = ["ingen", "delvis", "stor"] as const;

export const dependencyStatuses = [
  "aapen",
  "under-arbeid",
  "avklart",
  "stoppet",
] as const;

export const sourceBases = [
  "offentlig-regelverk",
  "aggregert-innsikt",
  "forskning",
  "redaksjonell-vurdering",
] as const;

export const eastCategories = [
  "easy",
  "attractive",
  "social",
  "timely",
] as const;

export const foggTargets = ["motivation", "ability", "prompt"] as const;

export const forgoodDimensions = [
  "fairness",
  "openness",
  "respect",
  "goals",
  "opinions",
  "options",
  "delegation",
] as const;

export const forgoodLevels = [
  "styrke",
  "obs",
  "risiko",
  "mangler-grunnlag",
] as const;

export type CaseStatus = (typeof caseStatuses)[number];
export type GovernanceReviewStatus = (typeof governanceReviewStatuses)[number];
export type JourneyPhase = (typeof journeyPhases)[number];
export type Surface = (typeof surfaces)[number];
export type TargetAudience = (typeof targetAudiences)[number];
export type MetricKind = (typeof metricKinds)[number];
export type MeasurementGap = (typeof measurementGaps)[number];
export type DependencyStatus = (typeof dependencyStatuses)[number];
export type SourceBasis = (typeof sourceBases)[number];
export type EastCategory = (typeof eastCategories)[number];
export type FoggTarget = (typeof foggTargets)[number];
export type ForgoodDimension = (typeof forgoodDimensions)[number];
export type ForgoodLevel = (typeof forgoodLevels)[number];

export type Governance = {
  decisionOwnerRole: string;
  editorRole: string;
  stakeholders: string[];
  privacyReview: GovernanceReviewStatus;
  ethicsReview: GovernanceReviewStatus;
  nextDecisionGate: string;
};

export type Hypothesis = {
  id: string;
  statement: string;
  expectedEffect: string;
  signal: string;
};

export type Metric = {
  id: string;
  label: string;
  kind: MetricKind;
  measurementGap: MeasurementGap;
  description: string;
};

export type Dependency = {
  id: string;
  description: string;
  ownerRole: string;
  status: DependencyStatus;
};

export type OpenQuestion = {
  id: string;
  question: string;
  ownerRole: string;
  status: DependencyStatus;
};

export type ForgoodAssessment = {
  level: ForgoodLevel;
  rationale: string;
};

export type ForgoodProfile = Record<ForgoodDimension, ForgoodAssessment>;

export type StudioCase = {
  entityType: "case";
  id: string;
  name: string;
  summary: string;
  problemStatement: string;
  status: CaseStatus;
  boundariesConfirmed: boolean;
  sourceBasis: SourceBasis[];
  targetAudiences: TargetAudience[];
  journeyPhases: JourneyPhase[];
  surfaces: Surface[];
  hypotheses: Hypothesis[];
  metrics: Metric[];
  governance: Governance;
  dependencies: Dependency[];
  openQuestions: OpenQuestion[];
};

export type Tiltak = {
  entityType: "tiltak";
  id: string;
  caseId: string;
  name: string;
  summary: string;
  status: CaseStatus;
  targetAudiences: TargetAudience[];
  journeyPhases: JourneyPhase[];
  surfaces: Surface[];
  hypothesis: Hypothesis;
  metrics: Metric[];
  east: EastCategory[];
  fogg: {
    target: FoggTarget;
    rationale: string;
  };
  forgood: ForgoodProfile;
  governance: Governance;
  dependencies: Dependency[];
  openQuestions: OpenQuestion[];
};

export type Tiltakspakke = {
  entityType: "tiltakspakke";
  id: string;
  caseId: string;
  name: string;
  summary: string;
  status: CaseStatus;
  targetAudiences: TargetAudience[];
  journeyPhases: JourneyPhase[];
  surfaces: Surface[];
  tiltakIds: string[];
  hypotheses: Hypothesis[];
  metrics: Metric[];
  aggregatedForgood: ForgoodProfile;
  governance: Governance;
  dependencies: Dependency[];
  openQuestions: OpenQuestion[];
};

export type StudioCaseBundle = {
  case: StudioCase;
  tiltak: Tiltak[];
  tiltakspakker: Tiltakspakke[];
};
