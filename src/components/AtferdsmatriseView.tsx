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
  ToggleGroup,
  VStack,
} from "@navikt/ds-react";
import NextLink from "next/link";
import { useState } from "react";
import {
  type Aktor,
  aktorLabel,
  BARRIERER,
  DRIVERE,
  itemsInCell,
  type MatriseItem,
  matriseItems,
} from "@/lib/atferdsmatrise-model";
import { KategoriDialog } from "./KategoriDialog";
import { TiltakDialog } from "./TiltakDialog";

/** Klikkbart matrise-element → det delte, kanoniske tiltak-kortet. */
function MatriseChip({ item }: { item: MatriseItem }) {
  return (
    <TiltakDialog
      id={item.id}
      className="bm__chip bm__chip--btn"
      ariaLabel={`Vis tiltak ${item.id}: ${item.title}`}
    >
      <b>{item.id}</b> {item.title}
    </TiltakDialog>
  );
}

export function AtferdsmatriseView() {
  const [aktor, setAktor] = useState<Aktor>("arbeidsgiver");
  const count = matriseItems[aktor].length;

  return (
    <VStack gap="space-24" className="atferdsmatrise">
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
                Atferdsmatrise
              </Tag>
              <Tag variant="neutral" size="small">
                Nudgelab · motivasjon × barriere
              </Tag>
            </HStack>
            <VStack gap="space-4">
              <Heading level="1" size="large">
                Hvorfor dultene virker
              </Heading>
              <BodyLong>
                Her ser du de identifiserte tiltakene og hvorfor de skal virke:
                hvert tiltak er plassert etter hvilken <strong>barriere</strong>{" "}
                det skal løse (rad) og hvilken{" "}
                <strong>motivasjonsdriver</strong> det spiller på (kolonne).
                Slik henger atferdslogikken bak hver dult sammen — og du ser
                hvor tiltakene klynger seg. Bytt aktør for å se mønsteret i
                hvert spor.
              </BodyLong>
            </VStack>
            <ToggleGroup
              label="Velg aktør"
              value={aktor}
              onChange={(v) => setAktor(v as Aktor)}
              data-color="neutral"
              size="small"
            >
              <ToggleGroup.Item value="arbeidsgiver" label="Arbeidsgiver" />
              <ToggleGroup.Item value="sykmeldt" label="Den sykmeldte" />
            </ToggleGroup>
          </VStack>
        </Box>
      </VStack>

      <HStack gap="space-8" wrap>
        <Tag variant="neutral" size="small">
          {aktorLabel[aktor]}
        </Tag>
        <Tag variant="neutral" size="small">
          {count} tiltak plassert
        </Tag>
        <Tag variant="info" size="small">
          4 barrierer × 5 drivere
        </Tag>
      </HStack>

      <section
        className="bm-scroll"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scroll-container må kunne fokuseres for tastatur-scroll
        tabIndex={0}
        aria-label="Atferdsmatrise — bla horisontalt ved behov"
      >
        <table className="bm" data-aktor={aktor}>
          <caption className="bm__caption">
            Atferdsmatrise for {aktorLabel[aktor].toLowerCase()}: barriere (rad)
            mot motivasjonsdriver (kolonne).
          </caption>
          <thead>
            <tr>
              <td className="bm__corner" aria-hidden />
              {DRIVERE.map((driver) => (
                <th key={driver} scope="col" className="bm__colhead">
                  <KategoriDialog
                    navn={driver}
                    kind="driver"
                    className="bm__head-btn"
                  >
                    {driver}
                  </KategoriDialog>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BARRIERER.map((barriere) => (
              <tr key={barriere}>
                <th scope="row" className="bm__rowhead">
                  <KategoriDialog
                    navn={barriere}
                    kind="barriere"
                    className="bm__head-btn"
                  >
                    {barriere}
                  </KategoriDialog>
                </th>
                {DRIVERE.map((driver) => {
                  const cellItems = itemsInCell(aktor, barriere, driver);
                  return (
                    <td
                      key={driver}
                      className={`bm__cell${
                        cellItems.length ? " bm__cell--filled" : ""
                      }`}
                    >
                      {cellItems.map((item) => (
                        <MatriseChip key={item.id} item={item} />
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Box borderWidth="1" borderRadius="8" padding="space-16">
        <VStack gap="space-8">
          <Heading level="2" size="small">
            Slik henger det sammen
          </Heading>
          <BodyShort size="small">
            Matrisen er grunnlaget; reisene og tiltakskartene er anvendelsen. Se
            de samme tiltakene i kontekst:
          </BodyShort>
          <HStack gap="space-12" wrap>
            <AkselLink as={NextLink} href="/tiltakspakke-utvelgelse">
              Utvelgelse — hvilke tiltak først
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
        Rammeverket — 5 motivasjonsdrivere × 4 barrierer — er Nudgelabs, fra
        atferdskartleggingen. Her er det operasjonalisert og koblet til de
        bearbeidede tiltakene. Illustrativt og syntetisk.
      </BodyShort>
    </VStack>
  );
}
