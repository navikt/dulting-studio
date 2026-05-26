"use client";

import { ArrowLeftIcon, TableIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  HStack,
  Loader,
  LocalAlert,
  VStack,
} from "@navikt/ds-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { JourneyMatrix } from "@/components/JourneyMatrix";
import { fetchAllWidgetPages } from "@/lib/fetch-all-widgets";
import {
  buildMatrixModel,
  type MatrixModel,
  type MatrixWidget,
} from "@/lib/matrix-transform";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; model: MatrixModel };

function MatrixContent() {
  const params = useParams();
  const projectId = params.id as string;

  const [state, setState] = useState<FetchState>({ status: "loading" });

  const fetchAllWidgets = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const result = await fetchAllWidgetPages(projectId);

      if (!result.ok) {
        if (result.status === 404) {
          setState({
            status: "error",
            message: "Prosjektet finnes ikke.",
          });
          return;
        }

        setState({
          status: "error",
          message: result.message,
        });
        return;
      }

      const widgets: MatrixWidget[] = result.widgets.map((item) => ({
        id: item.id,
        widgetType: item.widgetType,
        textContent: item.textContent,
        backgroundColor: item.backgroundColor,
        rowIndex: item.rowIndex,
        columnIndex: item.columnIndex,
        classification: item.classification
          ? {
              laneTypeKey: item.classification.laneTypeKey,
              laneTypeLabel: item.classification.laneTypeLabel,
              status: item.classification.status,
            }
          : null,
      }));

      const model = buildMatrixModel(widgets);
      setState({ status: "success", model });
    } catch {
      setState({
        status: "error",
        message: "Kunne ikke kontakte serveren. Prøv igjen senere.",
      });
    }
  }, [projectId]);

  useEffect(() => {
    fetchAllWidgets();
  }, [fetchAllWidgets]);

  return (
    <VStack gap="space-24">
      <HStack gap="space-12" align="center">
        <Button
          as={Link}
          href={`/projects/${projectId}`}
          variant="tertiary-neutral"
          size="small"
          icon={<ArrowLeftIcon aria-hidden />}
        >
          Innholdsvisning
        </Button>
      </HStack>

      <VStack gap="space-8">
        <HStack gap="space-8" align="center">
          <TableIcon aria-hidden fontSize="1.5rem" />
          <Heading level="2" size="large">
            Brukerreisematrise
          </Heading>
        </HStack>
        <BodyLong>
          Visuell oversikt over importerte widgets gruppert etter rad og kolonne
          fra Mural-workshopen.
        </BodyLong>
      </VStack>

      {state.status === "loading" && (
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster matrise …" />
        </HStack>
      )}

      {state.status === "error" && (
        <LocalAlert status="error">
          <LocalAlert.Content>{state.message}</LocalAlert.Content>
        </LocalAlert>
      )}

      {state.status === "success" && state.model.totalWidgets === 0 && (
        <VStack gap="space-8" align="center" padding="space-32">
          <BodyShort weight="semibold">Ingen widgets funnet.</BodyShort>
          <BodyShort size="small">
            Importer widgets fra Mural for å se dem i matrisevisningen.
          </BodyShort>
        </VStack>
      )}

      {state.status === "success" && state.model.totalWidgets > 0 && (
        <JourneyMatrix model={state.model} projectId={projectId} />
      )}
    </VStack>
  );
}

export default function MatrixPage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster matrise …" />
        </HStack>
      }
    >
      <MatrixContent />
    </Suspense>
  );
}
