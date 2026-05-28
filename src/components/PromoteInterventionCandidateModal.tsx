"use client";

import {
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HStack,
  LocalAlert,
  Modal,
  Select,
  Tag,
  Textarea,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { type FormEvent, useCallback, useRef, useState } from "react";

type SourceWidget = {
  id: string;
  muralWidgetId: string;
};

type PromoteInterventionCandidateModalProps = {
  projectId: string;
  sourceWidgets: SourceWidget[];
  onClose: () => void;
  onSuccess: (candidateId: string) => void;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

const PLACEMENT_OPTIONS = [
  { value: "", label: "Ikke valgt ennå" },
  { value: "journey_step", label: "Reisesteg" },
  { value: "cross_cutting_support", label: "Tverrgående støtte" },
  { value: "package_support", label: "Pakkestøtte" },
  { value: "clarification", label: "Avklaring" },
  { value: "context", label: "Kontekst" },
];

export function PromoteInterventionCandidateModal({
  projectId,
  sourceWidgets,
  onClose,
  onSuccess,
}: PromoteInterventionCandidateModalProps) {
  const [title, setTitle] = useState("");
  const [rationale, setRationale] = useState("");
  const [desiredBehavior, setDesiredBehavior] = useState("");
  const [actorTrack, setActorTrack] = useState("");
  const [journeyStep, setJourneyStep] = useState("");
  const [placementRole, setPlacementRole] = useState("");
  const [piiConfirmed, setPiiConfirmed] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });
  const titleInputRef = useRef<HTMLInputElement>(null);
  const rationaleInputRef = useRef<HTMLTextAreaElement>(null);

  const isSubmitting = submitState.status === "submitting";
  const fieldErrors =
    submitState.status === "error" ? submitState.fieldErrors : undefined;
  const canSubmit =
    title.trim().length > 0 &&
    rationale.trim().length > 0 &&
    piiConfirmed &&
    sourceWidgets.length > 0 &&
    !isSubmitting;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const trimmedTitle = title.trim();
      const trimmedRationale = rationale.trim();

      if (!trimmedTitle) {
        setSubmitState({
          status: "error",
          message: "Tittel er påkrevd.",
          fieldErrors: { title: "Gi tiltaket en kort tittel." },
        });
        titleInputRef.current?.focus();
        return;
      }

      if (!trimmedRationale) {
        setSubmitState({
          status: "error",
          message: "Begrunnelse er påkrevd.",
          fieldErrors: {
            rationale: "Skriv hvorfor disse kildene bør bli et tiltak.",
          },
        });
        rationaleInputRef.current?.focus();
        return;
      }

      if (!piiConfirmed) {
        setSubmitState({
          status: "error",
          message: "Bekreft PII-stoppunktet før promotering.",
          fieldErrors: {
            piiConfirmed: "Bekreft at kildene er sjekket for PII.",
          },
        });
        return;
      }

      setSubmitState({ status: "submitting" });

      try {
        const response = await fetch(
          `/api/projects/${projectId}/intervention-candidates`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: trimmedTitle,
              rationale: trimmedRationale,
              desiredBehavior: desiredBehavior.trim() || null,
              actorTrack: actorTrack.trim() || null,
              journeyStep: journeyStep.trim() || null,
              placementRole: placementRole || null,
              widgetIds: sourceWidgets.map((widget) => widget.id),
              piiConfirmed,
            }),
          },
        );

        if (response.status === 201) {
          const data = await response.json();
          onSuccess(data.candidateId);
          return;
        }

        const body = await response.json().catch(() => null);

        if (response.status === 400 || response.status === 422) {
          const nextFieldErrors: Record<string, string> = {};
          if (body?.errors && Array.isArray(body.errors)) {
            for (const err of body.errors) {
              if (err.field && err.message) {
                nextFieldErrors[err.field] = err.message;
              }
            }
          }

          setSubmitState({
            status: "error",
            message: body?.message || "Ugyldig forespørsel.",
            fieldErrors:
              Object.keys(nextFieldErrors).length > 0
                ? nextFieldErrors
                : undefined,
          });
          return;
        }

        if (response.status === 409) {
          setSubmitState({
            status: "error",
            message:
              body?.message ||
              "En eller flere widgets er lagt inn flere ganger.",
            fieldErrors: {
              widgetIds: "Noen valgte widgets er duplikater.",
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
    [
      actorTrack,
      desiredBehavior,
      journeyStep,
      onSuccess,
      piiConfirmed,
      placementRole,
      projectId,
      rationale,
      sourceWidgets,
      title,
    ],
  );

  return (
    <Modal
      open
      onClose={onClose}
      aria-labelledby="promote-candidate-heading"
      width="medium"
    >
      <Modal.Header closeButton>
        <Heading id="promote-candidate-heading" size="medium" level="2">
          Promoter til tiltak
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <form id="promote-candidate-form" onSubmit={handleSubmit}>
          <VStack gap="space-20">
            <VStack gap="space-8">
              <BodyShort size="small">
                {sourceWidgets.length} widget
                {sourceWidgets.length === 1 ? "" : "s"} blir kilde til tiltaket.
              </BodyShort>
              <HStack gap="space-4" wrap>
                {sourceWidgets.map((widget) => (
                  <Tag key={widget.id} variant="info" size="xsmall">
                    {widget.muralWidgetId}
                  </Tag>
                ))}
              </HStack>
            </VStack>

            <TextField
              ref={titleInputRef}
              label="Tittel"
              description="Kort navn på tiltaket. Ikke lim inn rå lappetekst."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={fieldErrors?.title}
              disabled={isSubmitting}
              autoFocus
              autoComplete="off"
              maxLength={200}
            />

            <Textarea
              ref={rationaleInputRef}
              label="Kort begrunnelse"
              description="Hvorfor bør disse kildene løftes til et tiltak?"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              error={fieldErrors?.rationale}
              disabled={isSubmitting}
              maxLength={1000}
              rows={3}
            />

            <Textarea
              label="Ønsket atferd (valgfri)"
              description="Hva ønsker vi at arbeidsgiver eller sykmeldt skal gjøre annerledes?"
              value={desiredBehavior}
              onChange={(e) => setDesiredBehavior(e.target.value)}
              error={fieldErrors?.desiredBehavior}
              disabled={isSubmitting}
              maxLength={2000}
              rows={3}
            />

            <HStack gap="space-12" align="start" wrap>
              <TextField
                label="Aktørspor (valgfri)"
                value={actorTrack}
                onChange={(e) => setActorTrack(e.target.value)}
                error={fieldErrors?.actorTrack}
                disabled={isSubmitting}
                autoComplete="off"
                maxLength={200}
              />
              <TextField
                label="Brukerreisesteg (valgfri)"
                value={journeyStep}
                onChange={(e) => setJourneyStep(e.target.value)}
                error={fieldErrors?.journeyStep}
                disabled={isSubmitting}
                autoComplete="off"
                maxLength={200}
              />
            </HStack>

            <Select
              label="Plassering/rolle (valgfri)"
              description="Bruk tverrgående støtte for K6/støttetiltak."
              value={placementRole}
              onChange={(e) => setPlacementRole(e.target.value)}
              error={fieldErrors?.placementRole}
              disabled={isSubmitting}
            >
              {PLACEMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <CheckboxGroup
              legend="PII-bekreftelse"
              description="Sjekk kildene før du promoterer. Dette er et manuelt stoppunkt, ikke automatisk PII-deteksjon."
              value={piiConfirmed ? ["confirmed"] : []}
              onChange={(values) =>
                setPiiConfirmed(values.includes("confirmed"))
              }
              error={fieldErrors?.piiConfirmed}
            >
              <Checkbox value="confirmed" disabled={isSubmitting}>
                Jeg bekrefter at valgte widgets ikke inneholder
                personopplysninger, helseopplysninger eller saksnær tekst som
                kan identifisere enkeltpersoner.
              </Checkbox>
            </CheckboxGroup>

            {fieldErrors?.widgetIds && (
              <LocalAlert status="error">
                <LocalAlert.Content>{fieldErrors.widgetIds}</LocalAlert.Content>
              </LocalAlert>
            )}

            {submitState.status === "error" &&
              submitState.message &&
              !fieldErrors?.widgetIds && (
                <LocalAlert status="error">
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
            form="promote-candidate-form"
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            Promoter til tiltak
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
}
