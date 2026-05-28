"use client";

import {
  ArrowLeftIcon,
  DownloadIcon,
  ExclamationmarkTriangleIcon,
} from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  ExpansionCard,
  Heading,
  HStack,
  Label,
  Loader,
  LocalAlert,
  Table,
  Tag,
  VStack,
} from "@navikt/ds-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ExportPackageDialog } from "@/components/ExportPackageDialog";

type PackageSourceRef = {
  widgetId: string;
  muralWidgetId: string | null;
  piiRisk: "none" | "possible" | "probable";
  sanitizedExcerpt: string | null;
  relevanceNote: string | null;
};

type PackageForgoodFlag = {
  dimension: string;
  note: string;
};

type PackageOpenQuestion = {
  question: string;
  category?: string | null;
};

type PackageStopCriterion = {
  criterion: string;
};

type PackageMember = {
  id: string;
  candidateId: string;
  title: string;
  status: string;
  rationale: string;
  actorTrack: string | null;
  journeyStep: string | null;
  placementRole: string | null;
  assessment: string;
  forgoodFlags: PackageForgoodFlag[];
  openQuestions: PackageOpenQuestion[];
  stopCriteria: PackageStopCriterion[];
  sourceRefs: PackageSourceRef[];
};

type PackageGroup = {
  placementRole: string;
  label: string;
  candidates: PackageMember[];
};

type PackageCoverageCell = {
  actorTrack: string;
  journeyStep: string;
  count: number;
};

type PackageDetail = {
  package: {
    id: string;
    name: string;
    purpose: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  groups: PackageGroup[];
  coverage: {
    actorTracks: string[];
    journeySteps: string[];
    cells: PackageCoverageCell[];
  };
};

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; detail: PackageDetail };

const PII_RISK_LABELS: Record<PackageSourceRef["piiRisk"], string> = {
  none: "Ingen PII-risiko",
  possible: "Mulig PII",
  probable: "Sannsynlig PII",
};

const FORGOOD_LABELS: Record<string, string> = {
  fairness: "Fairness",
  openness: "Openness",
  respect: "Respect",
  goals: "Goals",
  opinions: "Opinions",
  options: "Options",
  delegation: "Delegation",
};

function statusVariant(
  status: PackageSourceRef["piiRisk"],
): "neutral" | "warning" | "error" {
  switch (status) {
    case "probable":
      return "error";
    case "possible":
      return "warning";
    default:
      return "neutral";
  }
}

function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function coverageCount(
  cells: PackageCoverageCell[],
  actorTrack: string,
  journeyStep: string,
) {
  return (
    cells.find(
      (cell) =>
        cell.actorTrack === actorTrack && cell.journeyStep === journeyStep,
    )?.count ?? 0
  );
}

function PackageCoverage({ detail }: { detail: PackageDetail }) {
  if (detail.coverage.actorTracks.length === 0) {
    return (
      <LocalAlert status="announcement">
        <LocalAlert.Content>
          Legg tiltak i pakken for å se dekning på aktørspor og brukerreisesteg.
        </LocalAlert.Content>
      </LocalAlert>
    );
  }

  return (
    <Table size="small">
      <caption className="aksel-sr-only">
        Dekning for tiltakspakken fordelt på aktørspor og brukerreisesteg.
      </caption>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Aktørspor</Table.HeaderCell>
          {detail.coverage.journeySteps.map((journeyStep) => (
            <Table.HeaderCell key={journeyStep} scope="col">
              {journeyStep}
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {detail.coverage.actorTracks.map((actorTrack) => (
          <Table.Row key={actorTrack}>
            <Table.HeaderCell scope="row">{actorTrack}</Table.HeaderCell>
            {detail.coverage.journeySteps.map((journeyStep) => (
              <Table.DataCell key={journeyStep}>
                <Tag
                  size="small"
                  variant={
                    coverageCount(
                      detail.coverage.cells,
                      actorTrack,
                      journeyStep,
                    ) > 0
                      ? "success"
                      : "neutral"
                  }
                >
                  {coverageCount(
                    detail.coverage.cells,
                    actorTrack,
                    journeyStep,
                  )}
                </Tag>
              </Table.DataCell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function PackageMemberCard({ member }: { member: PackageMember }) {
  const hasProbablePii = member.sourceRefs.some(
    (source) => source.piiRisk === "probable",
  );

  return (
    <ExpansionCard aria-label={`Tiltak: ${member.title}`} size="small">
      <ExpansionCard.Header>
        <ExpansionCard.Title>{member.title}</ExpansionCard.Title>
        <ExpansionCard.Description>
          {[member.actorTrack, member.journeyStep]
            .filter(Boolean)
            .join(" · ") || "Ikke plassert i spor/steg"}
        </ExpansionCard.Description>
      </ExpansionCard.Header>
      <ExpansionCard.Content>
        <VStack gap="space-16">
          {hasProbablePii && (
            <LocalAlert status="warning">
              <LocalAlert.Content>
                Tiltaket har kilde med sannsynlig PII. Eksport er blokkert til
                kilden er ryddet.
              </LocalAlert.Content>
            </LocalAlert>
          )}

          <VStack gap="space-4">
            <Label as="p">Vurdering</Label>
            <BodyLong>{member.assessment}</BodyLong>
          </VStack>

          <VStack gap="space-4">
            <Label as="p">Begrunnelse fra tiltakskandidat</Label>
            <BodyLong>{member.rationale}</BodyLong>
          </VStack>

          {member.forgoodFlags.length > 0 && (
            <VStack gap="space-8">
              <Label as="p">FORGOOD-refleksjoner</Label>
              {member.forgoodFlags.map((flag) => (
                <Box
                  key={`${member.id}-${flag.dimension}-${flag.note}`}
                  padding="space-12"
                  borderWidth="1"
                  borderRadius="8"
                >
                  <VStack gap="space-4">
                    <Tag size="small" variant="info">
                      {FORGOOD_LABELS[flag.dimension] ?? flag.dimension}
                    </Tag>
                    <BodyShort size="small">{flag.note}</BodyShort>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}

          {member.openQuestions.length > 0 && (
            <VStack gap="space-4">
              <Label as="p">Åpne spørsmål</Label>
              <ul>
                {member.openQuestions.map((question) => (
                  <li key={question.question}>
                    <BodyShort>{question.question}</BodyShort>
                  </li>
                ))}
              </ul>
            </VStack>
          )}

          {member.stopCriteria.length > 0 && (
            <VStack gap="space-4">
              <Label as="p">Stoppkriterier</Label>
              <ul>
                {member.stopCriteria.map((criterion) => (
                  <li key={criterion.criterion}>
                    <BodyShort>{criterion.criterion}</BodyShort>
                  </li>
                ))}
              </ul>
            </VStack>
          )}

          <VStack gap="space-8">
            <Label as="p">Kilder</Label>
            <HStack gap="space-8" wrap>
              {member.sourceRefs.map((source) => (
                <Tag
                  key={source.widgetId}
                  size="small"
                  variant={statusVariant(source.piiRisk)}
                >
                  {source.muralWidgetId ?? source.widgetId} ·{" "}
                  {PII_RISK_LABELS[source.piiRisk]}
                </Tag>
              ))}
            </HStack>
            <BodyShort size="small" className="muted">
              Kildevisningen er dataminimert. Rå Mural-tekst vises ikke her.
            </BodyShort>
          </VStack>
        </VStack>
      </ExpansionCard.Content>
    </ExpansionCard>
  );
}

function InterventionPackageContent() {
  const params = useParams();
  const projectId = params.id as string;
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [showExportDialog, setShowExportDialog] = useState(false);

  const fetchPackage = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch(
        `/api/projects/${projectId}/intervention-packages/current`,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setState({
          status: "error",
          message:
            body?.message ||
            `Feil ved henting av tiltakspakke (${response.status})`,
        });
        return;
      }

      const detail = await response.json();
      setState({ status: "success", detail });
    } catch {
      setState({
        status: "error",
        message: "Kunne ikke kontakte serveren. Prøv igjen senere.",
      });
    }
  }, [projectId]);

  useEffect(() => {
    fetchPackage();
  }, [fetchPackage]);

  const packageDetail =
    state.status === "success" ? state.detail.package : null;
  const totalMembers =
    state.status === "success"
      ? state.detail.groups.reduce(
          (sum, group) => sum + group.candidates.length,
          0,
        )
      : 0;
  const hasProbablePii =
    state.status === "success" &&
    state.detail.groups.some((group) =>
      group.candidates.some((member) =>
        member.sourceRefs.some((source) => source.piiRisk === "probable"),
      ),
    );

  return (
    <Box padding="space-24">
      <VStack gap="space-24">
        <HStack gap="space-12" align="center" justify="space-between" wrap>
          <HStack gap="space-12" align="center">
            <Button
              as={Link}
              href={`/projects/${projectId}/tiltak`}
              variant="tertiary-neutral"
              size="small"
              icon={<ArrowLeftIcon aria-hidden />}
            >
              Tilbake til tiltak
            </Button>
            <Button
              as={Link}
              href={`/projects/${projectId}`}
              variant="tertiary"
              size="small"
            >
              Widgets
            </Button>
          </HStack>
          <Button
            variant="primary"
            size="small"
            icon={<DownloadIcon aria-hidden />}
            onClick={() => setShowExportDialog(true)}
            disabled={totalMembers === 0 || hasProbablePii}
          >
            Eksporter
          </Button>
        </HStack>

        <Box background="info-soft" borderRadius="12" padding="space-24">
          <VStack gap="space-12">
            <HStack gap="space-8" wrap>
              <Tag variant="alt3" size="small">
                {totalMembers} tiltak
              </Tag>
              {packageDetail && (
                <Tag variant="info" size="small">
                  Oppdatert {formatDate(packageDetail.updatedAt)}
                </Tag>
              )}
              {hasProbablePii && (
                <Tag
                  variant="warning"
                  size="small"
                  icon={<ExclamationmarkTriangleIcon aria-hidden />}
                >
                  Eksport blokkert av PII-stoppunkt
                </Tag>
              )}
            </HStack>
            <Heading level="2" size="large">
              {packageDetail?.name ?? "Tiltakspakke 1"}
            </Heading>
            <BodyLong>
              {packageDetail?.purpose ??
                "Første kuraterte pakke med tiltakskandidater fra Mural-arbeidet."}
            </BodyLong>
          </VStack>
        </Box>

        {state.status === "loading" && (
          <HStack justify="center" padding="space-32">
            <Loader size="xlarge" title="Henter tiltakspakke …" />
          </HStack>
        )}

        {state.status === "error" && (
          <LocalAlert status="error">
            <LocalAlert.Content>{state.message}</LocalAlert.Content>
          </LocalAlert>
        )}

        {state.status === "success" && totalMembers === 0 && (
          <LocalAlert status="announcement">
            <LocalAlert.Content>
              Tiltakspakken er tom. Gå til{" "}
              <Link href={`/projects/${projectId}/tiltak`}>
                tiltakskandidater
              </Link>{" "}
              og legg inn de tiltakene som skal inngå i første pakke.
            </LocalAlert.Content>
          </LocalAlert>
        )}

        {state.status === "success" && totalMembers > 0 && (
          <>
            <VStack gap="space-12">
              <Heading level="3" size="medium">
                Dekning
              </Heading>
              <PackageCoverage detail={state.detail} />
            </VStack>

            <VStack gap="space-16">
              <Heading level="3" size="medium">
                Tiltak i pakken
              </Heading>
              {state.detail.groups.map((group) => (
                <VStack key={group.placementRole} gap="space-12">
                  <HStack gap="space-8" align="center">
                    <Heading level="4" size="small">
                      {group.label}
                    </Heading>
                    <Tag size="small" variant="neutral">
                      {group.candidates.length}
                    </Tag>
                  </HStack>
                  {group.candidates.map((member) => (
                    <PackageMemberCard key={member.id} member={member} />
                  ))}
                </VStack>
              ))}
            </VStack>
          </>
        )}
      </VStack>

      {showExportDialog && (
        <ExportPackageDialog
          projectId={projectId}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </Box>
  );
}

export default function InterventionPackagePage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster tiltakspakke …" />
        </HStack>
      }
    >
      <InterventionPackageContent />
    </Suspense>
  );
}
