"use client";

import { ArrowLeftIcon, PackageIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  HStack,
  Loader,
  LocalAlert,
  Table,
  Tag,
  VStack,
} from "@navikt/ds-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AddPackageMemberModal } from "@/components/AddPackageMemberModal";

type InterventionCandidateSourceRef = {
  widgetId: string;
  muralWidgetId: string;
  piiRisk: string;
};

type InterventionCandidateListItem = {
  id: string;
  title: string;
  status: string;
  rationale: string;
  actorTrack: string | null;
  journeyStep: string | null;
  placementRole: string | null;
  widgetCount: number;
  sourceRefs: InterventionCandidateSourceRef[];
  createdAt: string;
  updatedAt: string;
};

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; candidates: InterventionCandidateListItem[] };

const STATUS_LABELS: Record<string, string> = {
  proposed: "Foreslått",
  needs_clarification: "Trenger avklaring",
  assessed_relevant: "Vurdert relevant",
  ready_for_package: "Klar for pakke",
  parked: "Parkert",
  rejected: "Avvist",
};

const PLACEMENT_ROLE_LABELS: Record<string, string> = {
  journey_step: "Reisesteg",
  cross_cutting_support: "Tverrgående støtte",
  package_support: "Pakkestøtte",
  clarification: "Avklaring",
  context: "Kontekst",
};

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

function statusVariant(
  status: string,
): "neutral" | "info" | "success" | "warning" | "error" {
  switch (status) {
    case "assessed_relevant":
    case "ready_for_package":
      return "success";
    case "needs_clarification":
      return "warning";
    case "rejected":
      return "error";
    case "parked":
      return "neutral";
    default:
      return "info";
  }
}

function placementRoleLabel(role: string | null): string {
  if (!role) return "Ikke valgt";
  return PLACEMENT_ROLE_LABELS[role] ?? role;
}

function CandidateSources({
  sourceRefs,
}: {
  sourceRefs: InterventionCandidateSourceRef[];
}) {
  return (
    <HStack gap="space-4" wrap>
      {sourceRefs.map((source) => (
        <Tag key={source.widgetId} variant="info" size="xsmall">
          {source.muralWidgetId}
        </Tag>
      ))}
    </HStack>
  );
}

function InterventionCandidatesContent() {
  const params = useParams();
  const projectId = params.id as string;

  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [packageCandidate, setPackageCandidate] =
    useState<InterventionCandidateListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch(
        `/api/projects/${projectId}/intervention-candidates`,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setState({
          status: "error",
          message:
            body?.message ||
            `Feil ved henting av tiltakskandidater (${response.status})`,
        });
        return;
      }

      const data = await response.json();
      setState({ status: "success", candidates: data.candidates });
    } catch {
      setState({
        status: "error",
        message: "Kunne ikke kontakte serveren. Prøv igjen senere.",
      });
    }
  }, [projectId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handlePackageSuccess = useCallback(() => {
    setPackageCandidate(null);
    setSuccessMessage("Tiltaket er lagt i Tiltakspakke 1.");
  }, []);

  return (
    <VStack gap="space-24" padding="space-24">
      <HStack gap="space-12" align="center">
        <Button
          as={Link}
          href={`/projects/${projectId}`}
          variant="tertiary-neutral"
          size="small"
          icon={<ArrowLeftIcon aria-hidden />}
        >
          Tilbake til widgets
        </Button>
        <Button
          as={Link}
          href={`/projects/${projectId}/tiltakspakke`}
          variant="tertiary"
          size="small"
          icon={<PackageIcon aria-hidden />}
        >
          Tiltakspakke
        </Button>
      </HStack>

      <VStack gap="space-8">
        <Heading level="2" size="large">
          Tiltakskandidater
        </Heading>
        <BodyLong>
          Bearbeidede tiltak fra valgte Mural-widgets. Listen viser redaksjonell
          begrunnelse og dataminimerte kildehenvisninger, ikke rå lappetekst.
        </BodyLong>
      </VStack>

      {state.status === "loading" && (
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Henter tiltakskandidater …" />
        </HStack>
      )}

      {state.status === "error" && (
        <LocalAlert status="error">
          <LocalAlert.Content>{state.message}</LocalAlert.Content>
        </LocalAlert>
      )}

      {successMessage && (
        <LocalAlert status="success">
          <LocalAlert.Content>
            {successMessage}{" "}
            <Link href={`/projects/${projectId}/tiltakspakke`}>
              Se tiltakspakke
            </Link>
          </LocalAlert.Content>
        </LocalAlert>
      )}

      {state.status === "success" && state.candidates.length === 0 && (
        <VStack gap="space-8" align="center" padding="space-32">
          <BodyShort weight="semibold">
            Ingen tiltakskandidater opprettet ennå.
          </BodyShort>
          <BodyShort size="small">
            Gå til widgetvisningen, velg én eller flere widgets og promoter dem
            til tiltak.
          </BodyShort>
        </VStack>
      )}

      {state.status === "success" && state.candidates.length > 0 && (
        <Table size="small">
          <caption className="aksel-sr-only">
            Tiltakskandidater for prosjektet. {state.candidates.length}{" "}
            kandidater totalt.
          </caption>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Tiltak</Table.HeaderCell>
              <Table.HeaderCell scope="col">Status</Table.HeaderCell>
              <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
              <Table.HeaderCell scope="col">Kilder</Table.HeaderCell>
              <Table.HeaderCell scope="col">Opprettet</Table.HeaderCell>
              <Table.HeaderCell scope="col">Pakke</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {state.candidates.map((candidate) => (
              <Table.Row key={candidate.id}>
                <Table.DataCell>
                  <VStack gap="space-4">
                    <BodyShort weight="semibold">{candidate.title}</BodyShort>
                    <BodyShort size="small">{candidate.rationale}</BodyShort>
                    {(candidate.actorTrack || candidate.journeyStep) && (
                      <BodyShort size="small" className="muted">
                        {[candidate.actorTrack, candidate.journeyStep]
                          .filter(Boolean)
                          .join(" · ")}
                      </BodyShort>
                    )}
                  </VStack>
                </Table.DataCell>
                <Table.DataCell>
                  <Tag variant={statusVariant(candidate.status)} size="xsmall">
                    {STATUS_LABELS[candidate.status] ?? candidate.status}
                  </Tag>
                </Table.DataCell>
                <Table.DataCell>
                  <BodyShort size="small">
                    {placementRoleLabel(candidate.placementRole)}
                  </BodyShort>
                </Table.DataCell>
                <Table.DataCell>
                  <VStack gap="space-4">
                    <BodyShort size="small">
                      {candidate.widgetCount} kilde
                      {candidate.widgetCount === 1 ? "" : "r"}
                    </BodyShort>
                    <CandidateSources sourceRefs={candidate.sourceRefs} />
                  </VStack>
                </Table.DataCell>
                <Table.DataCell>
                  <BodyShort size="small">
                    {formatDate(candidate.createdAt)}
                  </BodyShort>
                </Table.DataCell>
                <Table.DataCell>
                  <Button
                    variant="secondary"
                    size="xsmall"
                    onClick={() => setPackageCandidate(candidate)}
                    disabled={candidate.status === "rejected"}
                  >
                    Legg i pakke
                  </Button>
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {packageCandidate && (
        <AddPackageMemberModal
          projectId={projectId}
          candidate={{
            id: packageCandidate.id,
            title: packageCandidate.title,
          }}
          onClose={() => setPackageCandidate(null)}
          onSuccess={handlePackageSuccess}
        />
      )}
    </VStack>
  );
}

export default function InterventionCandidatesPage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster tiltakskandidater …" />
        </HStack>
      }
    >
      <InterventionCandidatesContent />
    </Suspense>
  );
}
