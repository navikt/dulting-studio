import { createHash } from "node:crypto";
import type {
  CurrentInterventionPackage,
  InterventionPackageCandidate,
  InterventionPackageSourceRef,
} from "./intervention-package-queries";

export class PackageNotFoundForExportError extends Error {
  readonly code = "package_not_found_for_export";

  constructor() {
    super("Tiltakspakken finnes ikke.");
  }
}

export class ProbablePiiRiskExportError extends Error {
  readonly code = "probable_pii_risk_export";

  constructor() {
    super("Eksport er blokkert fordi minst én kilde har sannsynlig PII-risiko.");
  }
}

export type PackageExportFormat = "markdown" | "json";

export type PackageExportContext = {
  exportedBy: string;
  exportedAt: Date;
  callId: string;
};

export type PackageExportResult = {
  content: string;
  contentType: string;
  fileName: string;
  contentHash: string;
  includedPiiRiskLevels: string[];
};

export function buildInterventionPackageExport(
  packageDetail: CurrentInterventionPackage,
  format: PackageExportFormat,
  context: PackageExportContext,
): PackageExportResult {
  if (!packageDetail.package) {
    throw new PackageNotFoundForExportError();
  }

  const candidates = packageDetail.groups.flatMap((group) => group.candidates);
  const includedPiiRiskLevels = getIncludedPiiRiskLevels(candidates);

  if (includedPiiRiskLevels.includes("probable")) {
    throw new ProbablePiiRiskExportError();
  }

  const content =
    format === "markdown"
      ? buildMarkdownExport(packageDetail, context)
      : buildJsonExport(packageDetail, context);
  const contentHash = createHash("sha256").update(content).digest("hex");
  const extension = format === "markdown" ? "md" : "json";
  const contentType =
    format === "markdown"
      ? "text/markdown; charset=utf-8"
      : "application/json; charset=utf-8";

  return {
    content,
    contentType,
    fileName: `tiltakspakke-${packageDetail.package.id}-${formatDateForFileName(
      context.exportedAt,
    )}.${extension}`,
    contentHash,
    includedPiiRiskLevels,
  };
}

function buildMarkdownExport(
  packageDetail: CurrentInterventionPackage,
  context: PackageExportContext,
) {
  const currentPackage = packageDetail.package;
  if (!currentPackage) {
    throw new PackageNotFoundForExportError();
  }

  const lines = [
    `# Tiltakspakke: ${currentPackage.name}`,
    "",
    `Formål: ${currentPackage.purpose ?? "Ikke beskrevet"}`,
    `Eksportert: ${context.exportedAt.toISOString()} av ${context.exportedBy}`,
    "",
    "## Dekning",
    "",
    `- Aktørspor: ${formatList(packageDetail.coverage.actorTracks)}`,
    `- Brukerreisesteg: ${formatList(packageDetail.coverage.journeySteps)}`,
    "",
  ];

  for (const group of packageDetail.groups) {
    lines.push(`## ${group.label}`, "");

    for (const candidate of group.candidates) {
      lines.push(
        `### ${candidate.title}`,
        "",
        `- Status: ${candidate.status}`,
        `- Vurdering: ${candidate.assessment}`,
        `- Ønsket atferd: ${candidate.desiredBehavior ?? "Ikke beskrevet"}`,
        `- Begrunnelse: ${candidate.rationale}`,
        `- Aktørspor: ${candidate.actorTrack ?? "Uplassert"}`,
        `- Brukerreisesteg: ${candidate.journeyStep ?? "Uplassert"}`,
        `- Rolle: ${candidate.placementRole ?? "Uplassert"}`,
        "",
        "#### FORGOOD-refleksjoner",
        "",
        ...formatForgoodFlags(candidate),
        "",
        "#### Åpne spørsmål",
        "",
        ...formatOpenQuestions(candidate),
        "",
        "#### Stoppkriterier",
        "",
        ...formatStopCriteria(candidate),
        "",
        "#### Kilder",
        "",
        ...formatSources(candidate.sourceRefs),
        "",
      );
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function buildJsonExport(
  packageDetail: CurrentInterventionPackage,
  context: PackageExportContext,
) {
  const currentPackage = packageDetail.package;
  if (!currentPackage) {
    throw new PackageNotFoundForExportError();
  }

  return `${JSON.stringify(
    {
      schemaVersion: 1,
      exportedAt: context.exportedAt.toISOString(),
      exportedBy: context.exportedBy,
      callId: context.callId,
      package: {
        id: currentPackage.id,
        name: currentPackage.name,
        purpose: currentPackage.purpose,
        status: currentPackage.status,
      },
      coverage: packageDetail.coverage,
      groups: packageDetail.groups.map((group) => ({
        placementRole: group.placementRole,
        label: group.label,
        candidates: group.candidates.map((candidate) => ({
          id: candidate.id,
          title: candidate.title,
          status: candidate.status,
          desiredBehavior: candidate.desiredBehavior,
          rationale: candidate.rationale,
          actorTrack: candidate.actorTrack,
          journeyStep: candidate.journeyStep,
          placementRole: candidate.placementRole,
          assessment: candidate.assessment,
          forgoodFlags: candidate.forgoodFlags,
          openQuestions: candidate.openQuestions,
          stopCriteria: candidate.stopCriteria,
          sources: candidate.sourceRefs.map(sanitizeSourceForExport),
        })),
      })),
    },
    null,
    2,
  )}\n`;
}

function getIncludedPiiRiskLevels(candidates: InterventionPackageCandidate[]) {
  const levels: string[] = [];

  for (const candidate of candidates) {
    for (const source of candidate.sourceRefs) {
      if (!levels.includes(source.piiRisk)) {
        levels.push(source.piiRisk);
      }
    }
  }

  return ["none", "possible", "probable"].filter((level) =>
    levels.includes(level),
  );
}

function formatDateForFileName(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Ingen";
}

function formatForgoodFlags(candidate: InterventionPackageCandidate) {
  if (candidate.forgoodFlags.length === 0) {
    return ["- Ingen flagg registrert."];
  }

  return candidate.forgoodFlags.map(
    (flag) => `- ${flag.dimension}: ${flag.note}`,
  );
}

function formatOpenQuestions(candidate: InterventionPackageCandidate) {
  if (candidate.openQuestions.length === 0) {
    return ["- Ingen åpne spørsmål registrert."];
  }

  return candidate.openQuestions.map((question) =>
    question.category
      ? `- ${question.question} (${question.category})`
      : `- ${question.question}`,
  );
}

function formatStopCriteria(candidate: InterventionPackageCandidate) {
  if (candidate.stopCriteria.length === 0) {
    return ["- Ingen stoppkriterier registrert."];
  }

  return candidate.stopCriteria.map((criterion) => `- ${criterion.criterion}`);
}

function formatSources(sources: InterventionPackageSourceRef[]) {
  if (sources.length === 0) {
    return ["- Ingen kilder registrert."];
  }

  return sources.map((source) => {
    const safeSource = sanitizeSourceForExport(source);
    return [
      `- Widget ${safeSource.muralWidgetId}`,
      `PII-risiko: ${safeSource.piiRisk}`,
      safeSource.relevanceNote,
      safeSource.sanitizedExcerpt,
    ]
      .filter(Boolean)
      .join(" | ");
  });
}

function sanitizeSourceForExport(source: InterventionPackageSourceRef) {
  return {
    widgetId: source.widgetId,
    muralWidgetId: source.muralWidgetId,
    piiRisk: source.piiRisk,
    relevanceNote: source.relevanceNote,
    sanitizedExcerpt:
      source.piiRisk === "none" ? source.sanitizedExcerpt : null,
  };
}
