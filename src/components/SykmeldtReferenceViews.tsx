"use client";

import { ArrowLeftIcon, TableIcon } from "@navikt/aksel-icons";
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
  sykmeldtMapPhases,
  sykmeldtMission,
  sykmeldtOpenQuestions,
  sykmeldtSupport,
  sykmeldtTotalTiltak,
} from "@/lib/sykmeldt-reference-model";

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
          <Heading level="3" size="medium" id={`sphase-${phase.id}`}>
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
            <article
              key={tiltak.id}
              className="kidult-map-tiltak-card"
              aria-labelledby={`${phase.id}-${tiltak.id}`}
            >
              <VStack gap="space-8">
                <HStack gap="space-8" align="center" wrap>
                  <Tag variant="neutral" size="xsmall">
                    {tiltak.id}
                  </Tag>
                  <Heading
                    level="4"
                    size="xsmall"
                    id={`${phase.id}-${tiltak.id}`}
                  >
                    {tiltak.title}
                  </Heading>
                  {tiltak.sharedWithAg && (
                    <Tag variant="alt3" size="xsmall">
                      Delt med AG
                    </Tag>
                  )}
                </HStack>

                <BodyShort size="small">{tiltak.onsketAtferd}</BodyShort>

                <HStack gap="space-4" wrap>
                  <Tag variant="warning" size="xsmall">
                    Barriere · {tiltak.barriere}
                  </Tag>
                  <Tag variant="success" size="xsmall">
                    Spiller på · {tiltak.motivasjon}
                  </Tag>
                </HStack>

                <BodyShort size="small">
                  <strong>Dult:</strong> {tiltak.dult}
                </BodyShort>
                <BodyShort size="small">
                  <strong>Måletegn:</strong> {tiltak.maaletegn}
                </BodyShort>
                <BodyShort size="small">
                  <strong>Stoppunkt:</strong> {tiltak.guardrail}
                </BodyShort>
                <BodyShort size="small" className="muted">
                  EAST/Fogg: {tiltak.eastFogg} · FORGOOD: {tiltak.forgood}
                  {tiltak.sharedWithAg ? ` · ${tiltak.sharedWithAg}` : ""}
                </BodyShort>

                <HStack gap="space-4" wrap>
                  {tiltak.raakort.map((ref) => (
                    <Tag key={ref} variant="neutral" size="xsmall">
                      {ref}
                    </Tag>
                  ))}
                </HStack>
              </VStack>
            </article>
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
        <HStack gap="space-12" align="center" justify="space-between" wrap>
          <Button
            as={NextLink}
            href="/"
            variant="tertiary-neutral"
            size="small"
            icon={<ArrowLeftIcon aria-hidden />}
          >
            Forsiden
          </Button>
          <Button
            as={NextLink}
            href="/tiltakskart"
            variant="tertiary"
            size="small"
            icon={<TableIcon aria-hidden />}
          >
            Arbeidsgiver-sporet
          </Button>
        </HStack>

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
              <Heading level="2" size="large">
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
          <Heading level="3" size="small">
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
          <Heading level="3" size="small">
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
        </AkselLink>
        .
      </BodyShort>
    </VStack>
  );
}
