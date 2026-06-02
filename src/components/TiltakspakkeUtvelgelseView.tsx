"use client";

import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@navikt/aksel-icons";
import {
  Link as AkselLink,
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Heading,
  HStack,
  Tag,
  ToggleGroup,
  VStack,
} from "@navikt/ds-react";
import NextLink from "next/link";
import { useState } from "react";
import {
  bangForBuck,
  krDekning,
  pakke1,
  type SelectionTiltak,
} from "@/lib/tiltakspakke-utvelgelse-model";
import { MaldekningStrip } from "./utvelgelse/MaldekningStrip";
import { MatriseView } from "./utvelgelse/MatriseView";
import { OmUtvalget } from "./utvelgelse/OmUtvalget";
import { TiltakKort } from "./utvelgelse/TiltakKort";
import { usePakkeTiltak } from "./utvelgelse/usePakkeTiltak";

const byBang = (a: SelectionTiltak, b: SelectionTiltak) =>
  bangForBuck(b) - bangForBuck(a) || b.effekt - a.effekt;

export function TiltakspakkeUtvelgelseView() {
  const { view, setView, aktorFilter, tiltak, setMedlemskap } =
    usePakkeTiltak();
  const [visMatrise, setVisMatrise] = useState(false);

  const valgte = pakke1(aktorFilter, tiltak).sort(
    (a, b) =>
      Number(b.kjerne ?? false) - Number(a.kjerne ?? false) || byBang(a, b),
  );
  const kjerne = valgte.filter((t) => t.kjerne);
  const stotte = valgte.filter((t) => !t.kjerne);
  const iSpor = tiltak.filter((t) =>
    aktorFilter ? t.aktor === aktorFilter : true,
  );
  const kandidater = iSpor.filter((t) => t.tier === "vurder").sort(byBang);
  const senere = iSpor.filter((t) => t.tier === "senere").sort(byBang);
  const dekning = krDekning(aktorFilter, tiltak);

  return (
    <VStack gap="space-24" className="tu pb">
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

        <Box background="info-soft" borderRadius="12" padding="space-24">
          <VStack gap="space-12">
            <HStack gap="space-8" wrap>
              <Tag variant="info" size="small">
                Utvelgelse
              </Tag>
              <Tag variant="neutral" size="small">
                Effekt × innsats · første tiltakspakke
              </Tag>
            </HStack>
            <VStack gap="space-4">
              <Heading level="1" size="large">
                Hvilke tiltak skal med i første pakke?
              </Heading>
              <BodyLong>
                Velg hvilke tiltak som skal være med i pakke 1, og se hvorfor.
                Flytt fritt inn og ut med knappene — måldekning, kjerne/støtte
                og åpne avklaringer oppdateres med en gang. Forslaget samler seg
                om det høyeste løftepunktet: stillheten før 4-ukers-fristen.{" "}
                <strong>Klikk en tiltak-kode</strong> for full forklaring.
              </BodyLong>
            </VStack>
            <ToggleGroup
              label="Velg spor"
              value={view}
              onChange={(v) => setView(v as typeof view)}
              data-color="neutral"
              size="small"
            >
              <ToggleGroup.Item value="ag" label="Arbeidsgiver" />
              <ToggleGroup.Item value="sm" label="Den sykmeldte" />
              <ToggleGroup.Item value="begge" label="Begge" />
            </ToggleGroup>
          </VStack>
        </Box>
      </VStack>

      <Alert variant="info" size="small">
        Effekt- og innsats-anslagene er et utkast for kalibrering med teamet,
        ikke en fasit.{" "}
        <AkselLink as={NextLink} href="/tiltakspakke-utvelgelse/rediger">
          Rediger og kalibrer tiltakene (team-delt) →
        </AkselLink>
      </Alert>

      <MaldekningStrip dekning={dekning} />

      <HStack gap="space-8" wrap align="center">
        <Tag variant="success" size="small">
          {valgte.length} i pakke 1
        </Tag>
        <Tag variant="neutral" size="small">
          {kjerne.length} kjerne · {stotte.length} støtte
        </Tag>
        <Tag variant="warning" size="small">
          {valgte.filter((t) => t.blokkertAv).length} med åpen avklaring
        </Tag>
        <span className="pb-maler-legend">
          Måler: ●●● høy · ●●○ middels · ●○○ lav
        </span>
      </HStack>

      <div className="pb-cols">
        <section className="pb-col pb-col--inn" aria-label="I pakke 1">
          <h2 className="pb-col__hd">
            <span className="pb-col__dot" aria-hidden />I pakke 1
            <span className="pb-col__count">
              {kjerne.length} kjerne · {stotte.length} støtte
            </span>
          </h2>
          {valgte.length === 0 ? (
            <p className="pb-empty">
              Ingen tiltak i pakke 1 for dette sporet ennå.
            </p>
          ) : (
            valgte.map((t) => (
              <TiltakKort key={t.id} t={t} inn onToggle={setMedlemskap} />
            ))
          )}
        </section>

        <section
          className="pb-col pb-col--ute"
          aria-label="Kandidater og senere"
        >
          <h2 className="pb-col__hd">
            <span className="pb-col__dot pb-col__dot--ute" aria-hidden />
            Kandidater og senere
          </h2>

          {kandidater.length === 0 ? (
            <p className="pb-empty">Ingen kandidater i dette sporet.</p>
          ) : (
            kandidater.map((t) => (
              <TiltakKort
                key={t.id}
                t={t}
                inn={false}
                onToggle={setMedlemskap}
              />
            ))
          )}

          <h3 className="pb-subhd">Senere</h3>
          {senere.length === 0 ? (
            <p className="pb-empty">Ingen tiltak parkert til senere.</p>
          ) : (
            senere.map((t) => (
              <TiltakKort
                key={t.id}
                t={t}
                inn={false}
                onToggle={setMedlemskap}
              />
            ))
          )}
        </section>
      </div>

      <div>
        <Button
          variant="tertiary"
          size="small"
          onClick={() => setVisMatrise((v) => !v)}
          aria-expanded={visMatrise}
          icon={
            visMatrise ? (
              <ChevronUpIcon aria-hidden />
            ) : (
              <ChevronDownIcon aria-hidden />
            )
          }
        >
          {visMatrise ? "Skjul matrise" : "Se som matrise"}
        </Button>
        {visMatrise && (
          <Box marginBlock="space-12 space-0">
            <MatriseView tiltak={tiltak} view={view} />
          </Box>
        )}
      </div>

      <OmUtvalget />

      <Box borderWidth="1" borderRadius="8" padding="space-16">
        <VStack gap="space-8">
          <Heading level="2" size="small">
            Slik henger det sammen
          </Heading>
          <BodyShort size="small">
            Utvelgelsen bygger på de samme tiltakene som i kartene — her sortert
            etter hva som bør med først:
          </BodyShort>
          <HStack gap="space-12" wrap>
            <AkselLink as={NextLink} href="/atferdsmatrise">
              Atferdsmatrise — hvorfor de virker
            </AkselLink>
            <AkselLink as={NextLink} href="/tiltakskart">
              Tiltakskart — arbeidsgiver
            </AkselLink>
            <AkselLink as={NextLink} href="/tiltakskart/sykmeldt">
              Tiltakskart — sykmeldt
            </AkselLink>
            <AkselLink as={NextLink} href="/brukerreise/sammen">
              Begge reiser side om side
            </AkselLink>
          </HStack>
        </VStack>
      </Box>

      <BodyShort size="small" className="muted">
        Kilde: bearbeidede tiltaksregistre (<code>T01–T14</code>,{" "}
        <code>ST01–ST12</code>) + <code>docs/dulting-scoping-status.md</code>.
        Effekt/innsats er et kalibrerbart utkast. Illustrativt og syntetisk.
      </BodyShort>
    </VStack>
  );
}
