"use client";

import { ArrowLeftIcon } from "@navikt/aksel-icons";
import {
  Link as AkselLink,
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Detail,
  Dialog,
  Heading,
  HGrid,
  HStack,
  LocalAlert,
  Tag,
  ToggleGroup,
  VStack,
} from "@navikt/ds-react";
import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  berikelseUtkastNote,
  type InterventionMapPhase,
  type InterventionMapTiltak,
  interventionMapPhases,
  isJourneyStepVisible,
  type JourneyStep,
  type JourneyVariant,
  journeySteps,
  journeyVariantLabels,
  openJourneyQuestions,
  supportTiltak,
} from "@/lib/kidult-reference-model";
import { raakortText } from "@/lib/tiltak-provenance";
import { AnalyseNav } from "./AnalyseNav";

type ReferenceView = "journey" | "map";

function getVariant(searchParams: URLSearchParams): JourneyVariant {
  return searchParams.get("variant") === "today" ? "today" : "package";
}

function useReferenceVariant() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const variant = getVariant(searchParams);

  function setVariant(nextVariant: string) {
    const params = new URLSearchParams(searchParams);
    params.set("variant", nextVariant);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return { variant, setVariant };
}

function ReferenceHeader({
  currentView,
  variant,
  onVariantChange,
}: {
  currentView: ReferenceView;
  variant: JourneyVariant;
  onVariantChange: (variant: string) => void;
}) {
  return (
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
              Ki-dult v3.2
            </Tag>
            <Tag variant="neutral" size="small">
              Nærmeste leder
            </Tag>
            <Tag variant="alt3" size="small">
              {journeyVariantLabels[variant]}
            </Tag>
          </HStack>
          <VStack gap="space-4">
            <Heading level="1" size="large">
              {currentView === "journey"
                ? "Brukerreise for oppfølgingsplan"
                : "Tiltakskart for oppfølgingsplan"}
            </Heading>
            <BodyLong>
              {currentView === "journey"
                ? "Fra sykmelding til behovsvurdering: se forskjellen mellom dagens stillhet og en tidlig tiltakspakke."
                : "Kanonisk oversikt over klynger, tiltak, måletegn og stoppunkter fra Ki-dult v3.2."}
            </BodyLong>
          </VStack>
          {currentView === "journey" && (
            <ToggleGroup
              label="Velg visning"
              value={variant}
              onChange={onVariantChange}
              data-color="neutral"
              size="small"
            >
              <ToggleGroup.Item value="today" label="I dag" />
              <ToggleGroup.Item value="package" label="Med tiltakspakke" />
            </ToggleGroup>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}

function JourneyStepCard({
  step,
  variant,
}: {
  step: JourneyStep;
  variant: JourneyVariant;
}) {
  const isMuted =
    variant === "package" &&
    (step.kind === "silence" || step.id === "dialogmote");

  return (
    <article
      className={`kidult-journey-step kidult-journey-step--${step.kind}${
        isMuted ? " kidult-journey-step--muted" : ""
      }`}
      aria-labelledby={`step-${step.id}`}
    >
      <VStack gap="space-8">
        <HStack gap="space-8" align="center" wrap>
          <Heading level="2" size="small" id={`step-${step.id}`}>
            {step.title}
          </Heading>
          {step.channel && (
            <Tag variant="neutral" size="xsmall">
              {step.channel}
            </Tag>
          )}
          {step.tiltakRefs?.map((ref) => (
            <Tag key={ref} variant="info" size="xsmall">
              {ref}
            </Tag>
          ))}
        </HStack>
        <BodyLong size="small">{step.body}</BodyLong>
        {step.action && (
          <BodyShort size="small" weight="semibold">
            {step.action}
          </BodyShort>
        )}
        {step.paths && (
          <HGrid gap="space-12" columns={{ xs: 1, md: 2 }}>
            {step.paths.map((path) => (
              <Box
                key={path.title}
                borderWidth="1"
                borderRadius="8"
                padding="space-16"
              >
                <VStack gap="space-8">
                  <Heading level="3" size="xsmall">
                    {path.title}
                  </Heading>
                  <BodyShort size="small">{path.body}</BodyShort>
                  <ul className="kidult-plain-list">
                    {path.steps.map((pathStep) => (
                      <li key={pathStep}>
                        <BodyShort size="small">{pathStep}</BodyShort>
                      </li>
                    ))}
                  </ul>
                </VStack>
              </Box>
            ))}
          </HGrid>
        )}
      </VStack>
    </article>
  );
}

export function KidultJourneyView() {
  const { variant, setVariant } = useReferenceVariant();
  const visibleSteps = journeySteps.filter((step) =>
    isJourneyStepVisible(step, variant),
  );

  return (
    <VStack gap="space-24">
      <ReferenceHeader
        currentView="journey"
        variant={variant}
        onVariantChange={setVariant}
      />

      <LocalAlert status="announcement">
        <LocalAlert.Content>
          Dette er referansemodellen fra Ki-dult v3.2. Den er foreløpig ikke
          koblet dynamisk til importerte Mural-prosjekter.
        </LocalAlert.Content>
      </LocalAlert>

      <section aria-labelledby="journey-timeline-heading">
        <VStack gap="space-16">
          <Heading level="2" size="medium" id="journey-timeline-heading">
            Tidslinje
          </Heading>
          <div className="kidult-journey-timeline" data-variant={variant}>
            {visibleSteps.map((step) => (
              <div key={step.id} className="kidult-journey-row">
                <div className="kidult-journey-time">
                  {step.timeLabel && (
                    <Tag
                      variant={step.kind === "dulting" ? "info" : "neutral"}
                      size="small"
                    >
                      {step.timeLabel}
                    </Tag>
                  )}
                </div>
                <JourneyStepCard step={step} variant={variant} />
              </div>
            ))}
          </div>
        </VStack>
      </section>

      <Box background="warning-soft" borderRadius="8" padding="space-16">
        <VStack gap="space-8">
          <Heading level="2" size="small">
            Åpne avklaringer
          </Heading>
          <ul className="kidult-plain-list">
            {openJourneyQuestions.map((question) => (
              <li key={question}>
                <BodyShort size="small">{question}</BodyShort>
              </li>
            ))}
          </ul>
        </VStack>
      </Box>
    </VStack>
  );
}

/** Kompakt, klikkbart tiltakskort. Synlig: kode + tittel + 1–2 linjer +
 *  barriere/driver-chips (why-laget). Resten — dult, måletegn, stoppunkt,
 *  EAST/Fogg, FORGOOD, råkort — åpnes i dialog (samme mønster som DultRefTag
 *  og kodene i utvelgelsen), så kartet blir skannbart i stedet for en vegg. */
function MapTiltakCard({ tiltak }: { tiltak: InterventionMapTiltak }) {
  return (
    <Dialog>
      <Dialog.Trigger>
        <button
          type="button"
          className="kidult-map-tiltak-card kidult-map-tiltak-card--btn"
          aria-label={`Vis detaljer for ${tiltak.id}: ${tiltak.title}`}
        >
          <span className="kidult-map-tiltak-card__head">
            <Tag variant="neutral" size="xsmall">
              {tiltak.id}
            </Tag>
            {tiltak.sharedWithSykmeldt && (
              <Tag variant="alt3" size="xsmall">
                Delt
              </Tag>
            )}
          </span>
          <span className="kidult-map-tiltak-card__title">{tiltak.title}</span>
          <span className="kidult-map-tiltak-card__desc">
            {tiltak.description}
          </span>
          {tiltak.barriere && tiltak.motivasjon && (
            <span className="kidult-map-tiltak-card__why">
              <Tag variant="warning" size="xsmall">
                {tiltak.barriere}
              </Tag>
              <Tag variant="success" size="xsmall">
                {tiltak.motivasjon}
              </Tag>
            </span>
          )}
          <span className="kidult-map-tiltak-card__more" aria-hidden>
            Dult, måletegn og stoppunkt →
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Header>
          <Detail uppercase>
            {tiltak.id}
            {tiltak.sharedWithSykmeldt ? " · delt med sykmeldt" : ""}
          </Detail>
          <Dialog.Title>{tiltak.title}</Dialog.Title>
          <Dialog.Description>{tiltak.description}</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <dl className="dult-ref-dialog__meta">
            {tiltak.barriere && tiltak.motivasjon && (
              <div>
                <dt>Barriere → driver</dt>
                <dd>
                  {tiltak.barriere} → {tiltak.motivasjon}
                </dd>
              </div>
            )}
            {tiltak.dult && (
              <div>
                <dt>Dult</dt>
                <dd>{tiltak.dult}</dd>
              </div>
            )}
            <div>
              <dt>Måletegn</dt>
              <dd>{tiltak.signal}</dd>
            </div>
            <div>
              <dt>Stoppunkt</dt>
              <dd>{tiltak.guardrail}</dd>
            </div>
            {tiltak.eastFogg && (
              <div>
                <dt>EAST/Fogg (utkast)</dt>
                <dd>{tiltak.eastFogg}</dd>
              </div>
            )}
            {tiltak.forgood && (
              <div>
                <dt>FORGOOD (utkast)</dt>
                <dd>{tiltak.forgood}</dd>
              </div>
            )}
            {tiltak.sharedWithSykmeldt && (
              <div>
                <dt>Delt touchpoint</dt>
                <dd>{tiltak.sharedWithSykmeldt}</dd>
              </div>
            )}
            {tiltak.raakort && tiltak.raakort.length > 0 && (
              <div>
                <dt>Laget av råkort</dt>
                <dd>
                  <ul className="tiltak-ref-raakort">
                    {tiltak.raakort.map((rid) => {
                      const tekst = raakortText(rid);
                      return (
                        <li key={rid}>
                          <b>{rid}</b>
                          {tekst ? ` — ${tekst}` : ""}
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseTrigger>
            <Button variant="secondary" size="small">
              Lukk
            </Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  );
}

function PhaseCard({
  phase,
  variant,
}: {
  phase: InterventionMapPhase;
  variant: JourneyVariant;
}) {
  return (
    <section
      className="kidult-map-phase"
      data-phase={phase.id}
      aria-labelledby={`phase-${phase.id}`}
    >
      <div className="kidult-map-phase__number" aria-hidden>
        {phase.number}
      </div>
      <VStack gap="space-16" className="kidult-map-phase__body">
        <VStack gap="space-4">
          <Heading level="2" size="medium" id={`phase-${phase.id}`}>
            {phase.title}
          </Heading>
          <BodyShort>{phase.behavior}</BodyShort>
        </VStack>

        <Box borderRadius="8" padding="space-12">
          <BodyShort size="small">
            <strong>Klyngemål:</strong> {phase.measurement}
          </BodyShort>
        </Box>

        <div className="kidult-map-tiltak-grid">
          {phase.tiltak.map((tiltak) => (
            <MapTiltakCard key={tiltak.id} tiltak={tiltak} />
          ))}
        </div>

        {phase.decisionPoint && (
          <Box borderWidth="1" borderRadius="8" padding="space-12">
            <BodyShort size="small" weight="semibold">
              {phase.decisionPoint}
            </BodyShort>
          </Box>
        )}

        {variant === "today" && phase.number > 2 && (
          <BodyShort size="small" className="muted">
            I dagens flyt blir dette ofte først relevant senere i løpet, typisk
            når planarbeidet allerede har blitt etterspurt.
          </BodyShort>
        )}
      </VStack>
    </section>
  );
}

export function KidultInterventionMapView() {
  const { variant, setVariant } = useReferenceVariant();
  const totalTiltak = interventionMapPhases.reduce(
    (sum, phase) => sum + phase.tiltak.length,
    supportTiltak.length,
  );

  return (
    <VStack gap="space-24">
      <ReferenceHeader
        currentView="map"
        variant={variant}
        onVariantChange={setVariant}
      />

      <HStack gap="space-8" wrap>
        <Tag variant="neutral" size="small">
          5 faser
        </Tag>
        <Tag variant="neutral" size="small">
          {totalTiltak} tiltak inkludert støttelag
        </Tag>
        <Tag variant="info" size="small">
          Koblet til barriere/motivasjon · utkast
        </Tag>
      </HStack>

      <Alert variant="info" size="small">
        {berikelseUtkastNote}
      </Alert>

      <div className="kidult-map" data-variant={variant}>
        {interventionMapPhases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} variant={variant} />
        ))}
      </div>

      <Box borderWidth="1" borderRadius="8" padding="space-16">
        <VStack gap="space-8">
          <Heading level="2" size="small">
            Støttende gjennom hele reisen
          </Heading>
          <BodyShort>
            Klarspråk, begreper og verdiformidling følger lederen gjennom hele
            flyten, ikke som en separat fase.
          </BodyShort>
          <HStack as="ul" gap="space-8" wrap className="unstyled-list">
            {supportTiltak.map((tiltak) => (
              <li key={tiltak}>
                <Tag variant="neutral" size="small">
                  {tiltak}
                </Tag>
              </li>
            ))}
          </HStack>
        </VStack>
      </Box>

      <BodyShort size="small" className="muted">
        Kilde: Ki-dult v3.2-modell. Se også{" "}
        <AkselLink as={NextLink} href="/brukerreise/leder">
          brukerreisen med variantvalg
        </AkselLink>{" "}
        og{" "}
        <AkselLink as={NextLink} href="/tiltakskart/sykmeldt">
          sykmeldt-sporet
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
