"use client";

import {
  BodyShort,
  Box,
  Button,
  Chips,
  Heading,
  HStack,
  Search,
  Select,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";

type WidgetFiltersProps = {
  currentType: string;
  currentSearch: string;
  currentStatus: string;
  currentLane: string;
  currentActorTrack: string;
  currentJourneyStep: string;
  currentPlacement: string;
  currentTriage: string;
  resultCount?: number | null;
  visibleCount?: number | null;
  projectId: string;
};

const WIDGET_TYPES = [
  { value: "", label: "Alle typer" },
  { value: "sticky_note", label: "Sticky note" },
  { value: "text", label: "Tekst" },
  { value: "shape", label: "Form" },
  { value: "image", label: "Bilde" },
  { value: "connector", label: "Kobling" },
  { value: "icon", label: "Ikon" },
  { value: "drawing", label: "Tegning" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Alle statuser" },
  { value: "unclassified", label: "Uklassifisert" },
  { value: "classified", label: "Klassifisert" },
];

const PLACEMENT_OPTIONS = [
  { value: "", label: "Alle plasseringer" },
  { value: "unplaced", label: "Uten rad eller kolonne" },
];

export function WidgetFilters({
  currentType,
  currentSearch,
  currentStatus,
  currentLane,
  currentActorTrack,
  currentJourneyStep,
  currentPlacement,
  currentTriage,
  resultCount,
  visibleCount,
  projectId,
}: WidgetFiltersProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [laneInput, setLaneInput] = useState(currentLane);
  const [actorTrackInput, setActorTrackInput] = useState(currentActorTrack);
  const [journeyStepInput, setJourneyStepInput] = useState(currentJourneyStep);

  // Sync search input with URL state on back/forward navigation
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setLaneInput(currentLane);
    setActorTrackInput(currentActorTrack);
    setJourneyStepInput(currentJourneyStep);
  }, [currentLane, currentActorTrack, currentJourneyStep]);

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();

      const values = {
        type: currentType,
        search: currentSearch,
        status: currentStatus,
        lane: currentLane,
        actorTrack: currentActorTrack,
        journeyStep: currentJourneyStep,
        placement: currentPlacement,
        triage: currentTriage,
        page: "1", // Reset to page 1 on filter change
        ...overrides,
      };

      for (const [key, val] of Object.entries(values)) {
        if (val) params.set(key, val);
      }

      const query = params.toString();
      return query
        ? `/projects/${projectId}?${query}`
        : `/projects/${projectId}`;
    },
    [
      currentType,
      currentSearch,
      currentStatus,
      currentLane,
      currentActorTrack,
      currentJourneyStep,
      currentPlacement,
      currentTriage,
      projectId,
    ],
  );

  const handleTypeChange = (value: string) => {
    router.push(buildUrl({ type: value }));
  };

  const handleStatusChange = (value: string) => {
    router.push(buildUrl({ status: value }));
  };

  const handlePlacementChange = (value: string) => {
    router.push(buildUrl({ placement: value }));
  };

  const handleQuickFilter = (overrides: Record<string, string>) => {
    router.push(buildUrl(overrides));
  };

  const handleSearchSubmit = (value: string) => {
    router.push(buildUrl({ search: value }));
  };

  const handleSearchClear = () => {
    setSearchInput("");
    router.push(buildUrl({ search: "" }));
  };

  const handleTextFiltersSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(
      buildUrl({
        lane: laneInput,
        actorTrack: actorTrackInput,
        journeyStep: journeyStepInput,
      }),
    );
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setLaneInput("");
    setActorTrackInput("");
    setJourneyStepInput("");
    router.push(`/projects/${projectId}`);
  };

  const activeFilterCount = [
    currentType,
    currentSearch,
    currentStatus,
    currentLane,
    currentActorTrack,
    currentJourneyStep,
    currentPlacement,
    currentTriage,
  ].filter(Boolean).length;

  return (
    <Box
      as="section"
      aria-labelledby="inbox-filter-heading"
      background="default"
      borderColor="neutral-subtle"
      borderRadius="12"
      borderWidth="1"
      padding={{ xs: "space-16", md: "space-20" }}
      className="inbox-command-bar"
    >
      <VStack gap="space-16">
        <HStack gap="space-12" align="start" justify="space-between" wrap>
          <VStack gap="space-4">
            <Heading level="3" size="small" id="inbox-filter-heading">
              Triage
            </Heading>
            <BodyShort size="small" className="muted" aria-live="polite">
              {resultCount == null
                ? activeFilterCount === 0
                  ? "Ingen aktive filtre."
                  : `${activeFilterCount} aktive filtre.`
                : `${visibleCount ?? 0} vist av ${resultCount} treff${
                    activeFilterCount > 0
                      ? ` med ${activeFilterCount} filtre`
                      : ""
                  }.`}
            </BodyShort>
          </VStack>

          {activeFilterCount > 0 && (
            <Button
              type="button"
              size="small"
              variant="tertiary"
              onClick={handleResetFilters}
            >
              Nullstill
            </Button>
          )}
        </HStack>

        <Chips size="small" data-color="neutral" aria-label="Hurtigfiltre">
          <Chips.Toggle
            selected={currentStatus === "unclassified"}
            onClick={() =>
              handleQuickFilter({
                status: currentStatus === "unclassified" ? "" : "unclassified",
              })
            }
          >
            Uklassifisert
          </Chips.Toggle>
          <Chips.Toggle
            selected={currentPlacement === "unplaced"}
            onClick={() =>
              handleQuickFilter({
                placement: currentPlacement === "unplaced" ? "" : "unplaced",
              })
            }
          >
            Uplassert
          </Chips.Toggle>
          <Chips.Toggle
            selected={currentTriage === "open"}
            onClick={() =>
              handleQuickFilter({
                triage: currentTriage === "open" ? "" : "open",
              })
            }
          >
            Aktive
          </Chips.Toggle>
          <Chips.Toggle
            selected={currentTriage === "parked"}
            onClick={() =>
              handleQuickFilter({
                triage: currentTriage === "parked" ? "" : "parked",
              })
            }
          >
            Parkert
          </Chips.Toggle>
          <Chips.Toggle
            selected={currentTriage === "rejected"}
            onClick={() =>
              handleQuickFilter({
                triage: currentTriage === "rejected" ? "" : "rejected",
              })
            }
          >
            Forkastet
          </Chips.Toggle>
        </Chips>

        <HStack gap="space-12" align="end" wrap>
          <div className="widget-filter-search">
            <Search
              label="Søk i widgettekst"
              size="small"
              variant="simple"
              value={searchInput}
              onChange={setSearchInput}
              onSearchClick={handleSearchSubmit}
              onClear={handleSearchClear}
              placeholder="Søk i innhold …"
            />
          </div>

          <Select
            label="Type"
            size="small"
            value={currentType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="widget-filter-select"
          >
            {WIDGET_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <Select
            label="Status"
            size="small"
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="widget-filter-select"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <Select
            label="Plassering"
            size="small"
            value={currentPlacement}
            onChange={(e) => handlePlacementChange(e.target.value)}
            className="widget-filter-select"
          >
            {PLACEMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </HStack>

        <form onSubmit={handleTextFiltersSubmit}>
          <HStack gap="space-12" align="end" wrap>
            <TextField
              label="Lane-nøkkel"
              size="small"
              value={laneInput}
              onChange={(e) => setLaneInput(e.target.value)}
              className="widget-filter-select"
              placeholder="f.eks. dialog"
            />
            <TextField
              label="Aktørspor"
              size="small"
              value={actorTrackInput}
              onChange={(e) => setActorTrackInput(e.target.value)}
              className="widget-filter-select"
              placeholder="f.eks. Arbeidsgiver"
            />
            <TextField
              label="Brukerreisesteg"
              size="small"
              value={journeyStepInput}
              onChange={(e) => setJourneyStepInput(e.target.value)}
              className="widget-filter-select"
              placeholder="f.eks. Uke 4"
            />
            <Button type="submit" size="small" variant="secondary">
              Bruk filtre
            </Button>
          </HStack>
        </form>
      </VStack>
    </Box>
  );
}
