"use client";

import { FolderIcon, UploadIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  Box,
  Button,
  Heading,
  HStack,
  Loader,
  VStack,
} from "@navikt/ds-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Project,
  ProjectList,
  type SortField,
  type SortOrder,
} from "@/components/ProjectList";

type ProjectsResponse = {
  projects: Project[];
  sort: string;
  order: string;
};

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ProjectsResponse };

export default function ProjectsPage() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [sort, setSort] = useState<SortField>("importedAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProjects = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState({ status: "loading" });

    try {
      const response = await fetch(
        `/api/projects?sort=${sort}&order=${order}`,
        {
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setState({
          status: "error",
          message:
            body?.message || `Kunne ikke hente prosjekter (${response.status})`,
        });
        return;
      }

      const data: ProjectsResponse = await response.json();
      setState({ status: "success", data });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setState({
        status: "error",
        message: "Kunne ikke kontakte serveren. Prøv igjen senere.",
      });
    }
  }, [sort, order]);

  useEffect(() => {
    fetchProjects();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchProjects]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sort) {
        setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSort(field);
        setOrder(field === "name" ? "asc" : "desc");
      }
    },
    [sort],
  );

  return (
    <VStack gap="space-24">
      <HStack justify="space-between" align="center" wrap>
        <Heading level="2" size="large">
          Prosjekter
        </Heading>
        <Button
          as={Link}
          href="/projects/import"
          variant="primary"
          size="small"
          icon={<UploadIcon aria-hidden />}
        >
          Importer Mural
        </Button>
      </HStack>

      {state.status === "loading" && (
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Henter prosjekter …" />
        </HStack>
      )}

      {state.status === "error" && (
        <Alert variant="error">
          {state.message}
          <Box marginBlock="space-8 space-0">
            <Button variant="secondary" size="small" onClick={fetchProjects}>
              Prøv igjen
            </Button>
          </Box>
        </Alert>
      )}

      {state.status === "success" && state.data.projects.length === 0 && (
        <Box
          padding="space-32"
          borderRadius="12"
          borderColor="neutral-subtle"
          borderWidth="1"
          background="sunken"
        >
          <VStack gap="space-16" align="center">
            <FolderIcon aria-hidden fontSize="3rem" />
            <VStack gap="space-8" align="center">
              <Heading level="3" size="medium">
                Ingen prosjekter ennå
              </Heading>
              <BodyLong align="center">
                Prosjekter opprettes automatisk når du importerer et
                Mural-brett. Start med å importere din første fil.
              </BodyLong>
            </VStack>
            <Button
              as={Link}
              href="/projects/import"
              variant="secondary"
              size="small"
            >
              Importer Mural-brett
            </Button>
          </VStack>
        </Box>
      )}

      {state.status === "success" && state.data.projects.length > 0 && (
        <ProjectList
          projects={state.data.projects}
          sort={sort}
          order={order}
          onSort={handleSort}
        />
      )}
    </VStack>
  );
}
