"use client";

import { HStack, Search, Select, VStack } from "@navikt/ds-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type WidgetFiltersProps = {
  currentType: string;
  currentSearch: string;
  currentStatus: string;
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

/*
 * TODO: Lane-filter (Fase 2)
 * Lane-typer er prosjektkonfigurerbare (se ADR-004). Filteret skal hente
 * tilgjengelige lanes fra prosjektdata/API når det er implementert.
 * API-kontrakten i widget-query.ts er allerede klar (format-validering).
 * Ikke vis hardkodede faser som ikke samsvarer med faktisk prosjektkonfigurasjon.
 */

export function WidgetFilters({
  currentType,
  currentSearch,
  currentStatus,
  projectId,
}: WidgetFiltersProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync search input with URL state on back/forward navigation
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();

      const values = {
        type: currentType,
        search: currentSearch,
        status: currentStatus,
        page: "1", // Reset to page 1 on filter change
        ...overrides,
      };

      for (const [key, val] of Object.entries(values)) {
        if (val) params.set(key, val);
      }

      return `/projects/${projectId}?${params.toString()}`;
    },
    [currentType, currentSearch, currentStatus, projectId],
  );

  const handleTypeChange = (value: string) => {
    router.push(buildUrl({ type: value }));
  };

  const handleStatusChange = (value: string) => {
    router.push(buildUrl({ status: value }));
  };

  const handleSearchSubmit = (value: string) => {
    router.push(buildUrl({ search: value }));
  };

  const handleSearchClear = () => {
    setSearchInput("");
    router.push(buildUrl({ search: "" }));
  };

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
      </HStack>
    </VStack>
  );
}
