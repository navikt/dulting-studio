"use client";

import { ArrowLeftIcon } from "@navikt/aksel-icons";
import {
  Link as AkselLink,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Detail,
  Dialog,
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
  barriereForklaring,
  DRIVERE,
  driverForklaring,
  itemsInCell,
  type MatriseItem,
  matriseItems,
} from "@/lib/atferdsmatrise-model";
import { AnalyseNav } from "./AnalyseNav";

/** Klikkbart matrise-element → kort forklaring av hva steget/tiltaket er. */
function MatriseChip({
  item,
  barriere,
  driver,
}: {
  item: MatriseItem;
  barriere: string;
  driver: string;
}) {
  return (
    <Dialog>
      <Dialog.Trigger>
        <button
          type="button"
          className="bm__chip bm__chip--btn"
          aria-label={`Forklar ${item.id}: ${item.title}`}
        >
          <b>{item.id}</b> {item.title}
        </button>
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Header>
          <Detail uppercase>{item.id}</Detail>
          <Dialog.Title>{item.title}</Dialog.Title>
          {item.description && (
            <Dialog.Description>{item.description}</Dialog.Description>
          )}
        </Dialog.Header>
        <Dialog.Body>
          <dl className="dult-ref-dialog__meta">
            <div>
              <dt>Barriere det løser</dt>
              <dd>{barriere}</dd>
            </div>
            <div>
              <dt>Driver det spiller på</dt>
              <dd>{driver}</dd>
            </div>
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

/** Klikkbar kategori-overskrift (barriere/driver) → kort definisjon. */
function KategoriDialog({
  navn,
  kind,
  forklaring,
}: {
  navn: string;
  kind: string;
  forklaring?: string;
}) {
  return (
    <Dialog>
      <Dialog.Trigger>
        <button
          type="button"
          className="bm__head-btn"
          aria-label={`Forklar ${navn}`}
        >
          {navn}
        </button>
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Header>
          <Detail uppercase>{kind}</Detail>
          <Dialog.Title>{navn}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <BodyLong>{forklaring ?? "Forklaring kommer."}</BodyLong>
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
        <AnalyseNav />

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
                «Hvorfor»-fundamentet bak reisene: hvert tiltak plassert etter
                hvilken <strong>barriere</strong> det løser (rad) og hvilken{" "}
                <strong>motivasjonsdriver</strong> det spiller på (kolonne).
                Bytt aktør for å se mønsteret i hvert spor.
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
          {count} {aktor === "arbeidsgiver" ? "steg" : "tiltak"} plassert
        </Tag>
        <Tag variant="info" size="small">
          4 barrierer × 5 drivere
        </Tag>
      </HStack>

      <div className="bm-scroll">
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
                    kind="Motivasjonsdriver"
                    forklaring={driverForklaring[driver]}
                  />
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
                    kind="Barriere"
                    forklaring={barriereForklaring[barriere]}
                  />
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
                        <MatriseChip
                          key={item.id}
                          item={item}
                          barriere={barriere}
                          driver={driver}
                        />
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
        Kilde: <code>docs/dulting-atferdskartlegging.md</code> (motivasjon/
        barriere) + de bearbeidede tiltaksregistrene. Illustrativt og syntetisk.
      </BodyShort>
    </VStack>
  );
}
