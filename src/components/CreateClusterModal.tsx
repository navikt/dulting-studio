"use client";

import {
  BodyShort,
  Button,
  Heading,
  HStack,
  Modal,
  Textarea,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { type FormEvent, useCallback, useRef, useState } from "react";

type CreateClusterModalProps = {
  projectId: string;
  widgetIds: string[];
  onClose: () => void;
  onSuccess: (clusterId: string) => void;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export function CreateClusterModal({
  projectId,
  widgetIds,
  onClose,
  onSuccess,
}: CreateClusterModalProps) {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = submitState.status === "submitting";
  const nameError =
    submitState.status === "error" ? submitState.fieldErrors?.name : undefined;
  const widgetIdsError =
    submitState.status === "error"
      ? submitState.fieldErrors?.widgetIds
      : undefined;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const trimmedName = name.trim();
      if (!trimmedName) {
        setSubmitState({
          status: "error",
          message: "Navn er påkrevd.",
          fieldErrors: { name: "Gi klyngen et beskrivende navn." },
        });
        nameInputRef.current?.focus();
        return;
      }

      setSubmitState({ status: "submitting" });

      try {
        const response = await fetch(`/api/projects/${projectId}/clusters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            summary: summary.trim() || null,
            widgetIds,
          }),
        });

        if (response.status === 201) {
          const data = await response.json();
          onSuccess(data.clusterId);
          return;
        }

        const body = await response.json().catch(() => null);

        if (response.status === 400 || response.status === 422) {
          const fieldErrors: Record<string, string> = {};
          if (body?.errors && Array.isArray(body.errors)) {
            for (const err of body.errors) {
              if (err.field && err.message) {
                fieldErrors[err.field] = err.message;
              }
            }
          }
          setSubmitState({
            status: "error",
            message: body?.message || "Ugyldig forespørsel.",
            fieldErrors:
              Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
          });
          return;
        }

        if (response.status === 409) {
          setSubmitState({
            status: "error",
            message:
              body?.message ||
              "En eller flere widgets tilhører allerede en klynge.",
            fieldErrors: {
              widgetIds: "Noen valgte widgets er allerede i en klynge.",
            },
          });
          return;
        }

        setSubmitState({
          status: "error",
          message:
            body?.message || `Uventet feil (${response.status}). Prøv igjen.`,
        });
      } catch {
        setSubmitState({
          status: "error",
          message: "Kunne ikke kontakte serveren. Sjekk nettverkstilkobling.",
        });
      }
    },
    [name, summary, widgetIds, projectId, onSuccess],
  );

  return (
    <Modal
      open
      onClose={onClose}
      aria-labelledby="create-cluster-heading"
      width="medium"
    >
      <Modal.Header closeButton>
        <Heading id="create-cluster-heading" size="medium" level="2">
          Opprett klynge
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <form id="create-cluster-form" onSubmit={handleSubmit}>
          <VStack gap="space-20">
            <BodyShort size="small">
              {widgetIds.length} widgets valgt for klyngen.
            </BodyShort>

            <TextField
              ref={nameInputRef}
              label="Navn på klynge"
              description="Kort, beskrivende navn for klyngen."
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
              disabled={isSubmitting}
              autoFocus
              autoComplete="off"
            />

            <Textarea
              label="Oppsummering (valgfri)"
              description="Skriv en sanitert redaksjonell oppsummering. Ikke lim inn rå tekst fra workshopen."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              error={
                submitState.status === "error"
                  ? submitState.fieldErrors?.summary
                  : undefined
              }
              disabled={isSubmitting}
              maxLength={2000}
              rows={3}
            />

            {widgetIdsError && (
              <BodyShort size="small" className="navds-error-message">
                {widgetIdsError}
              </BodyShort>
            )}

            {submitState.status === "error" && submitState.message && (
              <BodyShort
                size="small"
                className="navds-error-message"
                role="alert"
              >
                {submitState.message}
              </BodyShort>
            )}
          </VStack>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <HStack gap="space-12" justify="end">
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
          >
            Avbryt
          </Button>
          <Button
            variant="primary"
            size="small"
            type="submit"
            form="create-cluster-form"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Opprett klynge
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
}
