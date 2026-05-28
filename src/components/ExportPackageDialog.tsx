"use client";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HStack,
  LocalAlert,
  Modal,
  Radio,
  RadioGroup,
  VStack,
} from "@navikt/ds-react";
import { type FormEvent, useCallback, useState } from "react";

type ExportPackageDialogProps = {
  projectId: string;
  onClose: () => void;
};

type ExportFormat = "markdown" | "json";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function ExportPackageDialog({
  projectId,
  onClose,
}: ExportPackageDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("markdown");
  const [piiExportConfirmed, setPiiExportConfirmed] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const isSubmitting = submitState.status === "submitting";

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (!piiExportConfirmed) {
        setSubmitState({
          status: "error",
          message: "Bekreft PII-stoppunktet før eksport.",
        });
        return;
      }

      setSubmitState({ status: "submitting" });

      try {
        const response = await fetch(
          `/api/projects/${projectId}/intervention-packages/current/export`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              format,
              piiExportConfirmed,
            }),
          },
        );

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          setSubmitState({
            status: "error",
            message:
              body?.message ||
              `Kunne ikke eksportere pakken (${response.status}).`,
          });
          return;
        }

        const blob = await response.blob();
        const contentDisposition =
          response.headers.get("Content-Disposition") ?? "";
        const fileName =
          /filename="([^"]+)"/.exec(contentDisposition)?.[1] ??
          `tiltakspakke.${format === "markdown" ? "md" : "json"}`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);

        setSubmitState({
          status: "success",
          message: "Eksporten er laget og lastet ned.",
        });
      } catch {
        setSubmitState({
          status: "error",
          message: "Kunne ikke kontakte serveren. Prøv igjen senere.",
        });
      }
    },
    [format, piiExportConfirmed, projectId],
  );

  return (
    <Modal
      open
      onClose={onClose}
      aria-labelledby="export-package-heading"
      width="small"
    >
      <Modal.Header closeButton>
        <Heading id="export-package-heading" size="medium" level="2">
          Eksporter tiltakspakke
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <form id="export-package-form" onSubmit={handleSubmit}>
          <VStack gap="space-20">
            <RadioGroup
              legend="Format"
              value={format}
              onChange={(value) => setFormat(value as ExportFormat)}
            >
              <Radio value="markdown">Markdown</Radio>
              <Radio value="json">JSON</Radio>
            </RadioGroup>

            <CheckboxGroup
              legend="PII-bekreftelse"
              description="Eksporten kan lastes ned og deles videre. Sjekk at pakken ikke inneholder personopplysninger før du eksporterer."
              value={piiExportConfirmed ? ["confirmed"] : []}
              onChange={(values) =>
                setPiiExportConfirmed(values.includes("confirmed"))
              }
            >
              <Checkbox value="confirmed" disabled={isSubmitting}>
                Jeg bekrefter at eksporten er vurdert mot PII-stoppunktet.
              </Checkbox>
            </CheckboxGroup>

            {(submitState.status === "error" ||
              submitState.status === "success") && (
              <LocalAlert
                status={submitState.status === "success" ? "success" : "error"}
              >
                <LocalAlert.Content>{submitState.message}</LocalAlert.Content>
              </LocalAlert>
            )}
          </VStack>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <HStack gap="space-12" justify="end">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Lukk
          </Button>
          <Button
            type="submit"
            form="export-package-form"
            loading={isSubmitting}
            disabled={!piiExportConfirmed || isSubmitting}
          >
            Eksporter
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
}
