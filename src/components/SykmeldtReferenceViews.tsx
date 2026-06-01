"use client";

import { ArrowLeftIcon } from "@navikt/aksel-icons";
import {
  Link as AkselLink,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Heading,
  HStack,
  Tag,
  VStack,
} from "@navikt/ds-react";
import NextLink from "next/link";
import {
  type SykmeldtPhase,
  type SykmeldtTiltak,
  sykmeldtMapPhases,
  sykmeldtMission,
  sykmeldtOpenQuestions,
  sykmeldtSupport,
  sykmeldtTotalTiltak,
} from "@/lib/sykmeldt-reference-model";
import { AnalyseNav } from "./AnalyseNav";
import { TiltakDialog } from "./TiltakDialog";

/** Kompakt, klikkbart tiltakskort i sykmeldt-kartet. Flisen er triggeren; det
 *  kanoniske tiltak-kortet (likt overalt) åpnes i dialog via TiltakDialog. */
function SykmeldtTiltakCard({ tiltak }: { tiltak: SykmeldtTiltak }) {
  return (
    <TiltakDialog
      id={tiltak.id}
      className="kidult-map-tiltak-card kidult-map-tiltak-card--btn"
      ariaLabel={`Vis detaljer for ${tiltak.id}: ${tiltak.title}`}
    >
      <span className="kidult-map-tiltak-card__head">
        <Tag variant="neutral" size="xsmall">
          {tiltak.id}
        </Tag>
        {tiltak.sharedWithAg && (
          <Tag variant="alt3" size="xsmall">
            Delt
          </Tag>
        )}
      </span>
      <span className="kidult-map-tiltak-card__title">{tiltak.title}</span>
      <span className="kidult-map-tiltak-card__desc">
        {tiltak.onsketAtferd}
      </span>
      <span className="kidult-map-tiltak-card__why">
        <Tag variant="warning" size="xsmall">
          {tiltak.barriere}
        </Tag>
        <Tag variant="success" size="xsmall">
          {tiltak.motivasjon}
        </Tag>
      </span>
      <span className="kidult-map-tiltak-card__more" aria-hidden>
        Se hele tiltaket →
      </span>
    </TiltakDialog>
  );
}

function PhaseCard({ phase }: { phase: SykmeldtPhase }) {
  return (
    <section
      className="kidult-map-phase"
      data-phase={`k${phase.number}`}
      aria-labelledby={`sphase-${phase.id}`}
    >
      <div className="kidult-map-phase__number" aria-hidden>
        {phase.number}
      </div>
      <VStack gap="space-16" className="kidult-map-phase__body">
        <VStack gap="space-4">
          <Heading level="2" size="medium" id={`sphase-${phase.id}`}>
            {phase.title}
          </Heading>
          <BodyShort>{phase.goal}</BodyShort>
          {phase.mirrors && (
            <BodyShort size="small" className="muted">
              Speiler: {phase.mirrors}
            </BodyShort>
          )}
        </VStack>

        <Box borderRadius="8" padding="space-12">
          <BodyShort size="small">
            <strong>Klyngemål:</strong> {phase.measurement}
          </BodyShort>
        </Box>

        <div className="kidult-map-tiltak-grid">
          {phase.tiltak.map((tiltak) => (
            <SykmeldtTiltakCard key={tiltak.id} tiltak={tiltak} />
          ))}
        </div>
      </VStack>
    </section>
  );
}

export function SykmeldtInterventionMapView() {
  return (
    <VStack gap="space-24">
      <VStack gap="space-20" className="kidult-reference-header">
        <HStack gap="space-12" align="center" wrap>
          <Button
            as={NextLink}
            href="/"
            variant="tertiary-neutral"
            size="small"
            icon={<ArrowLeftIcon aria-hidden />}
          >
            Forsiden
          </Button>
        </HStack>
        <AnalyseNav />

        <Box background="info-soft" borderRadius="12" padding="space-24">
          <VStack gap="space-12">
            <HStack gap="space-8" wrap>
              <Tag variant="info" size="small">
                Sykmeldt-sporet
              </Tag>
              <Tag variant="neutral" size="small">
                Bearbeidet referanse
              </Tag>
              <Tag variant="alt3" size="small">
                {sykmeldtTotalTiltak} tiltak · 5 klynger
              </Tag>
            </HStack>
            <VStack gap="space-4">
              <Heading level="1" size="large">
                {sykmeldtMission.title}
              </Heading>
              <BodyLong>{sykmeldtMission.lead}</BodyLong>
            </VStack>
          </VStack>
        </Box>
      </VStack>

      <div className="kidult-map">
        {sykmeldtMapPhases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </div>

      <Box borderWidth="1" borderRadius="8" padding="space-16">
        <VStack gap="space-8">
          <Heading level="2" size="small">
            Støttelag (gjennomgående, ikke en egen fase)
          </Heading>
          <ul className="kidult-plain-list">
            {sykmeldtSupport.map((item) => (
              <li key={item}>
                <BodyShort size="small">{item}</BodyShort>
              </li>
            ))}
          </ul>
        </VStack>
      </Box>

      <Box background="warning-soft" borderRadius="8" padding="space-16">
        <VStack gap="space-8">
          <Heading level="2" size="small">
            Åpne spørsmål til bearbeidingen
          </Heading>
          <ul className="kidult-plain-list">
            {sykmeldtOpenQuestions.map((question) => (
              <li key={question}>
                <BodyShort size="small">{question}</BodyShort>
              </li>
            ))}
          </ul>
        </VStack>
      </Box>

      <BodyShort size="small" className="muted">
        Kilde: <code>docs/dulting-tiltaksregister-sykmeldt-bearbeidet.md</code>.
        Se også{" "}
        <AkselLink as={NextLink} href="/tiltakskart">
          arbeidsgiver-tiltakskartet
        </AkselLink>{" "}
        og{" "}
        <AkselLink as={NextLink} href="/atferdsmatrise">
          atferdsmatrisen
        </AkselLink>{" "}
        og{" "}
        <AkselLink as={NextLink} href="/tiltakspakke-utvelgelse">
          utvelgelsen til første pakke
        </AkselLink>
        .
      </BodyShort>
    </VStack>
  );
}
