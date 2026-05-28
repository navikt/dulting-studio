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
  Textarea,
  VStack,
} from "@navikt/ds-react";
import { type FormEvent, useCallback, useMemo, useState } from "react";

type PackageCandidate = {
  id: string;
  title: string;
};

type AddPackageMemberModalProps = {
  projectId: string;
  candidate: PackageCandidate;
  onClose: () => void;
  onSuccess: () => void;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

const FORGOOD_OPTIONS = [
  { value: "fairness", label: "Fairness" },
  { value: "openness", label: "Openness" },
  { value: "respect", label: "Respect" },
  { value: "goals", label: "Goals" },
  { value: "opinions", label: "Opinions" },
  { value: "options", label: "Options" },
  { value: "delegation", label: "Delegation" },
];

function linesToItems(value: string, key: "question" | "criterion") {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      key === "question"
        ? { question: line, category: null }
        : { criterion: line },
    );
}

export function AddPackageMemberModal({
  projectId,
  candidate,
  onClose,
  onSuccess,
}: AddPackageMemberModalProps) {
  const [assessment, setAssessment] = useState("");
  const [forgoodDimensions, setForgoodDimensions] = useState<string[]>([]);
  const [forgoodNote, setForgoodNote] = useState("");
  const [openQuestions, setOpenQuestions] = useState("");
  const [stopCriteria, setStopCriteria] = useState("");
  const [piiConfirmed, setPiiConfirmed] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const isSubmitting = submitState.status === "submitting";
  const fieldErrors =
    submitState.status === "error" ? submitState.fieldErrors : undefined;
  const canSubmit =
    assessment.trim().length > 0 && piiConfirmed && !isSubmitting;
  const forgoodFlags = useMemo(
    () =>
      forgoodDimensions.map((dimension) => ({
        dimension,
        note: forgoodNote.trim() || "Flagget for review i tiltakspakken.",
      })),
    [forgoodDimensions, forgoodNote],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (!assessment.trim()) {
        setSubmitState({
          status: "error",
          message: "Skriv en vurdering før tiltaket legges i pakken.",
          fieldErrors: { assessment: "Skriv en vurdering." },
        });
        return;
      }

      if (!piiConfirmed) {
        setSubmitState({
          status: "error",
          message: "Bekreft PII-stoppunktet før tiltaket legges i pakken.",
          fieldErrors: {
            piiConfirmed:
              "Bekreft at vurdering, spørsmål og stoppkriterier ikke inneholder PII.",
          },
        });
        return;
      }

      setSubmitState({ status: "submitting" });

      try {
        const response = await fetch(
          `/api/projects/${projectId}/intervention-packages/current/members`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              candidateId: candidate.id,
              assessment: assessment.trim(),
              forgoodFlags,
              openQuestions: linesToItems(openQuestions, "question"),
              stopCriteria: linesToItems(stopCriteria, "criterion"),
              piiConfirmed,
            }),
          },
        );

        if (response.status === 201) {
          onSuccess();
          return;
        }

        const body = await response.json().catch(() => null);
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
          message:
            body?.message ||
            `Kunne ikke legge tiltaket i pakken (${response.status}).`,
          fieldErrors:
            Object.keys(nextFieldErrors).length > 0
              ? nextFieldErrors
              : undefined,
        });
      } catch {
        setSubmitState({
          status: "error",
          message: "Kunne ikke kontakte serveren. Prøv igjen senere.",
        });
      }
    },
    [
      assessment,
      candidate.id,
      forgoodFlags,
      onSuccess,
      openQuestions,
      piiConfirmed,
      projectId,
      stopCriteria,
    ],
  );

  return (
    <Modal
      open
      onClose={onClose}
      aria-labelledby="add-package-member-heading"
      width="medium"
    >
      <Modal.Header closeButton>
        <Heading id="add-package-member-heading" size="medium" level="2">
          Legg i Tiltakspakke 1
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <form id="add-package-member-form" onSubmit={handleSubmit}>
          <VStack gap="space-20">
            <BodyShort>
              Tiltaket <strong>{candidate.title}</strong> legges i første
              tiltakspakke.
            </BodyShort>

            <Textarea
              label="Vurdering"
              description="Hvorfor hører tiltaket hjemme i første pakke? Ikke skriv rå lappetekst eller PII."
              value={assessment}
              onChange={(event) => setAssessment(event.target.value)}
              error={fieldErrors?.assessment}
              disabled={isSubmitting}
              maxLength={2000}
              rows={3}
            />

            <CheckboxGroup
              legend="FORGOOD-flagg"
              description="Velg dimensjoner som bør synliggjøres i review. Ingen totalscore beregnes."
              value={forgoodDimensions}
              onChange={setForgoodDimensions}
            >
              {FORGOOD_OPTIONS.map((option) => (
                <Checkbox key={option.value} value={option.value}>
                  {option.label}
                </Checkbox>
              ))}
            </CheckboxGroup>

            {forgoodDimensions.length > 0 && (
              <Textarea
                label="Kort FORGOOD-refleksjon"
                description="Samme refleksjon brukes på valgte flagg i denne MVP-en."
                value={forgoodNote}
                onChange={(event) => setForgoodNote(event.target.value)}
                error={fieldErrors?.forgoodFlags}
                disabled={isSubmitting}
                maxLength={500}
                rows={2}
              />
            )}

            <Textarea
              label="Åpne spørsmål (valgfritt)"
              description="Ett spørsmål per linje."
              value={openQuestions}
              onChange={(event) => setOpenQuestions(event.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              rows={3}
            />

            <Textarea
              label="Stoppkriterier (valgfritt)"
              description="Ett stoppkriterium per linje."
              value={stopCriteria}
              onChange={(event) => setStopCriteria(event.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              rows={3}
            />

            <CheckboxGroup
              legend="PII-bekreftelse"
              description="Dette er et manuelt stoppunkt før tekstene lagres på pakke-nivå."
              value={piiConfirmed ? ["confirmed"] : []}
              onChange={(values) =>
                setPiiConfirmed(values.includes("confirmed"))
              }
              error={fieldErrors?.piiConfirmed}
            >
              <Checkbox value="confirmed" disabled={isSubmitting}>
                Jeg bekrefter at vurdering, åpne spørsmål, stoppkriterier og
                FORGOOD-refleksjoner ikke inneholder personopplysninger,
                helseopplysninger eller saksnær tekst.
              </Checkbox>
            </CheckboxGroup>

            {submitState.status === "error" && (
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
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button
            type="submit"
            form="add-package-member-form"
            loading={isSubmitting}
            disabled={!canSubmit}
          >
            Legg i pakke
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
}
