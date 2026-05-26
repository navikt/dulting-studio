"use client";

import { CheckmarkCircleIcon, UploadIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Checkbox,
  Heading,
  HStack,
  Label,
  List,
  Loader,
  Tag,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { useCallback, useRef, useState } from "react";
import type {
  ProjectImportReport,
  ProjectImportWidget,
} from "@/lib/mural-import-contract";
import { parseMuralExport } from "@/lib/mural-parser";

type ParsedData = {
  widgets: ProjectImportWidget[];
  report: ProjectImportReport & { warnings: string[] };
  fileName: string;
};

type ParseState =
  | { status: "idle" }
  | { status: "parsing" }
  | { status: "parsed" }
  | { status: "error"; message: string }
  | { status: "submitting" }
  | { status: "success"; projectId: string; importId: string }
  | { status: "submit-error"; message: string; canRetry: boolean };

export function ImportDropzone() {
  const [state, setState] = useState<ParseState>({ status: "idle" });
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [projectName, setProjectName] = useState("");
  const [sourceDescription, setSourceDescription] = useState("");
  const [dataminConfirmed, setDataminConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const focusStatus = useCallback(() => {
    setTimeout(() => statusRef.current?.focus(), 100);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".json")) {
        setState({
          status: "error",
          message: "Filen må være en JSON-fil (.json).",
        });
        focusStatus();
        return;
      }

      setState({ status: "parsing" });

      try {
        const text = await file.text();
        let raw: unknown;

        try {
          raw = JSON.parse(text);
        } catch {
          setState({
            status: "error",
            message:
              "Filen inneholder ugyldig JSON. Kontroller at du valgte riktig eksportfil fra Mural.",
          });
          focusStatus();
          return;
        }

        const result = parseMuralExport(raw);

        if (result.widgets.length === 0) {
          setState({
            status: "error",
            message:
              "Filen inneholder ingen gjenkjente widgets. Kontroller at dette er en Mural-eksport.",
          });
          focusStatus();
          return;
        }

        setState({ status: "parsed" });
        setParsedData({
          widgets: result.widgets,
          report: result.report,
          fileName: file.name,
        });
        focusStatus();
      } catch {
        setState({
          status: "error",
          message: "Noe gikk galt under lesing av filen. Prøv igjen.",
        });
        focusStatus();
      }
    },
    [focusStatus],
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!parsedData) return;
    if (
      state.status !== "parsed" &&
      !(state.status === "submit-error" && state.canRetry)
    )
      return;

    const trimmedName = projectName.trim();
    const trimmedDescription = sourceDescription.trim();

    if (!trimmedName) return;
    if (!trimmedDescription) return;

    setState({ status: "submitting" });

    const sourceId = parsedData.fileName.replace(/\.json$/i, "");

    const payload = {
      projectName: trimmedName,
      sourceId,
      sourceDescription: trimmedDescription,
      widgets: parsedData.widgets,
      report: {
        totalWidgets: parsedData.report.totalWidgets,
        includedWidgets: parsedData.report.includedWidgets,
        droppedWidgets: parsedData.report.droppedWidgets,
        unknownTypeCount: parsedData.report.unknownTypeCount,
        missingTextCount: parsedData.report.missingTextCount,
        geometryWarningCount: parsedData.report.geometryWarningCount,
      },
    };

    try {
      const response = await fetch("/api/projects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setState({
          status: "success",
          projectId: result.projectId ?? "ukjent",
          importId: result.importId ?? "ukjent",
        });
        focusStatus();
        return;
      }

      const errorBody = await response.json().catch(() => null);

      if (response.status === 409) {
        setState({
          status: "submit-error",
          message:
            "Denne Mural-eksporten er allerede importert. Bruk en annen fil eller kontakt admin.",
          canRetry: false,
        });
      } else if (response.status === 400) {
        const issues = errorBody?.issues;
        const detail = Array.isArray(issues)
          ? ` Detaljer: ${issues.slice(0, 3).join(", ")}`
          : "";
        setState({
          status: "submit-error",
          message: `Payloaden ble avvist av serveren.${detail}`,
          canRetry: false,
        });
      } else if (response.status === 401 || response.status === 403) {
        setState({
          status: "submit-error",
          message: "Du har ikke tilgang til å importere. Sjekk innlogging.",
          canRetry: false,
        });
      } else {
        setState({
          status: "submit-error",
          message: "Noe gikk galt under import. Prøv igjen senere.",
          canRetry: true,
        });
      }
      focusStatus();
    } catch {
      setState({
        status: "submit-error",
        message:
          "Kunne ikke nå serveren. Sjekk nettverksforbindelsen og prøv igjen.",
        canRetry: true,
      });
      focusStatus();
    }
  }, [state, parsedData, projectName, sourceDescription, focusStatus]);

  const handleReset = useCallback(() => {
    setState({ status: "idle" });
    setParsedData(null);
    setProjectName("");
    setSourceDescription("");
    setDataminConfirmed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const canSubmit =
    state.status === "parsed" &&
    projectName.trim().length > 0 &&
    sourceDescription.trim().length > 0 &&
    dataminConfirmed;

  return (
    <VStack gap="space-24">
      {/* Dataminimering info */}
      <Box padding="space-16" borderRadius="8" background="info-soft">
        <BodyShort weight="semibold">Dataminimering</BodyShort>
        <BodyShort>
          Rå Mural JSON forlater ikke nettleseren din. Filen leses og
          transformeres lokalt. Serveren mottar kun en dataminimert payload
          etter at du har bekreftet importen.
        </BodyShort>
      </Box>

      {/* Filopplasting */}
      {(state.status === "idle" ||
        state.status === "parsing" ||
        state.status === "error") && (
        // biome-ignore lint/a11y/noStaticElementInteractions: Drop target wraps an accessible file input; drag events are progressive enhancement
        <div
          className="import-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <VStack gap="space-12" align="center">
            <UploadIcon aria-hidden fontSize="2.5rem" />
            <Label htmlFor="mural-file-input">Velg Mural JSON-eksportfil</Label>
            <BodyShort className="muted">
              Dra og slipp en fil hit, eller klikk for å velge
            </BodyShort>
            <input
              ref={fileInputRef}
              id="mural-file-input"
              type="file"
              accept=".json,application/json"
              onChange={handleFileInput}
              className="import-dropzone__input"
              aria-describedby="file-help-text"
            />
            <BodyShort id="file-help-text" size="small" className="muted">
              Aksepterer .json-filer. Kun Mural-eksportformat støttes.
            </BodyShort>
            {state.status === "parsing" && (
              <HStack gap="space-8" align="center">
                <Loader size="small" title="Leser fil..." />
                <BodyShort>Parser fil...</BodyShort>
              </HStack>
            )}
          </VStack>
        </div>
      )}

      {/* Status-meldinger */}
      <div
        ref={statusRef}
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="true"
        className="import-status-region"
      >
        {state.status === "error" && (
          <Alert variant="error">{state.message}</Alert>
        )}

        {state.status === "submit-error" && (
          <VStack gap="space-12">
            <Alert variant="error">{state.message}</Alert>
            <HStack gap="space-8">
              {state.canRetry && (
                <Button variant="secondary" size="small" onClick={handleSubmit}>
                  Prøv igjen
                </Button>
              )}
              <Button variant="tertiary" size="small" onClick={handleReset}>
                Start på nytt
              </Button>
            </HStack>
          </VStack>
        )}

        {state.status === "success" && (
          <VStack gap="space-12">
            <Alert variant="success">
              <Heading level="3" size="small" spacing>
                Import fullført
              </Heading>
              <BodyShort>
                Prosjekt opprettet (ID: {state.projectId}). Widgetene er lagret
                og klare for videre behandling.
              </BodyShort>
            </Alert>
            <Button variant="secondary" size="small" onClick={handleReset}>
              Importer ny fil
            </Button>
          </VStack>
        )}
      </div>

      {/* Rapport og bekreftelse */}
      {state.status === "parsed" && parsedData && (
        <VStack gap="space-20">
          <Box
            padding="space-20"
            borderRadius="12"
            borderColor="neutral-subtle"
            borderWidth="1"
          >
            <VStack gap="space-16">
              <HStack gap="space-8" align="center">
                <CheckmarkCircleIcon
                  aria-hidden
                  fontSize="1.5rem"
                  color="var(--a-icon-success)"
                />
                <Heading level="3" size="small">
                  Fil analysert: {parsedData.fileName}
                </Heading>
              </HStack>

              <fieldset
                className="import-report-grid"
                aria-label="Importrapport"
              >
                <ReportStat
                  label="Totalt i filen"
                  value={parsedData.report.totalWidgets}
                />
                <ReportStat
                  label="Inkludert"
                  value={parsedData.report.includedWidgets}
                  variant="success"
                />
                <ReportStat
                  label="Droppet"
                  value={parsedData.report.droppedWidgets}
                  variant={
                    parsedData.report.droppedWidgets > 0 ? "warning" : "neutral"
                  }
                />
                <ReportStat
                  label="Ukjent type"
                  value={parsedData.report.unknownTypeCount}
                  variant={
                    parsedData.report.unknownTypeCount > 0
                      ? "warning"
                      : "neutral"
                  }
                />
                <ReportStat
                  label="Mangler tekst"
                  value={parsedData.report.missingTextCount}
                  variant={
                    parsedData.report.missingTextCount > 0 ? "info" : "neutral"
                  }
                />
                <ReportStat
                  label="Usikker plassering"
                  value={parsedData.report.geometryWarningCount}
                  variant={
                    parsedData.report.geometryWarningCount > 0
                      ? "warning"
                      : "neutral"
                  }
                />
              </fieldset>

              {parsedData.report.warnings.length > 0 && (
                <>
                  <Heading level="4" size="xsmall">
                    Merknader
                  </Heading>
                  <List as="ul" size="small">
                    {parsedData.report.warnings.map((warning) => (
                      <List.Item key={warning}>{warning}</List.Item>
                    ))}
                  </List>
                </>
              )}

              <BodyShort size="small" className="muted">
                Kilde-ID: {parsedData.fileName.replace(/\.json$/i, "")}
              </BodyShort>
            </VStack>
          </Box>

          {/* Prosjektinfo-skjema */}
          <Box
            padding="space-20"
            borderRadius="12"
            borderColor="neutral-subtle"
            borderWidth="1"
          >
            <VStack gap="space-16">
              <Heading level="3" size="small">
                Prosjektinformasjon
              </Heading>
              <TextField
                label="Prosjektnavn"
                description="Kort, beskrivende navn for importprosjektet"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoComplete="off"
              />
              <TextField
                label="Kildebeskrivelse"
                description="Beskriv Mural-brettet kort (f.eks. «Oppfølgingsplan – brukerreise Q1 2025»)"
                value={sourceDescription}
                onChange={(e) => setSourceDescription(e.target.value)}
                autoComplete="off"
              />
            </VStack>
          </Box>

          {/* Dataminimering-bekreftelse */}
          <Checkbox
            checked={dataminConfirmed}
            onChange={(e) => setDataminConfirmed(e.target.checked)}
          >
            Jeg bekrefter at filen ikke inneholder personopplysninger utover det
            som er nødvendig, og at kun dataminimert payload sendes til
            serveren.
          </Checkbox>

          {/* Bekreft/avbryt */}
          <HStack gap="space-12">
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              Bekreft og importer
            </Button>
            <Button variant="tertiary" onClick={handleReset}>
              Avbryt
            </Button>
          </HStack>
        </VStack>
      )}

      {state.status === "submitting" && (
        <HStack gap="space-8" align="center">
          <Loader size="medium" title="Importerer..." />
          <BodyLong>Sender dataminimert payload til server...</BodyLong>
        </HStack>
      )}
    </VStack>
  );
}

function ReportStat({
  label,
  value,
  variant = "neutral",
}: {
  label: string;
  value: number;
  variant?: "neutral" | "success" | "warning" | "info";
}) {
  const tagColor =
    variant === "success"
      ? "success"
      : variant === "warning"
        ? "warning"
        : variant === "info"
          ? "info"
          : "neutral";

  return (
    <div className="import-report-stat">
      <BodyShort size="small" className="muted">
        {label}
      </BodyShort>
      <Tag variant="moderate" data-color={tagColor} size="small">
        {value.toLocaleString("nb-NO")}
      </Tag>
    </div>
  );
}
