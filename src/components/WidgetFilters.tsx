"use client";

import {
  BodyShort,
  Button,
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
  ].filter(Boolean).length;

  return (
    <VStack gap="space-12">
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
      </form>
      <BodyShort size="small" className="muted" aria-live="polite">
        {activeFilterCount === 0
          ? "Ingen aktive filtre."
          : `${activeFilterCount} aktive filtre.`}
      </BodyShort>
    </VStack>
  );
}
