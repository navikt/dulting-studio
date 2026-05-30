"use client";

import {
  ArrowLeftIcon,
  CheckmarkCircleIcon,
  ExclamationmarkTriangleIcon,
  TableIcon,
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
  type Aktor,
  aktorLabel,
  effektLabels,
  innsatsLabels,
  type Niva,
  pakke1,
  pakke1Kriterier,
  type SelectionTiltak,
  tiltakAt,
  utkastNote,
} from "@/lib/tiltakspakke-utvelgelse-model";

type View = Aktor | "begge";

const EFFEKT: Niva[] = [3, 2, 1];
const INNSATS: Niva[] = [1, 2, 3];

/** «Gjør først»-sonen: høy effekt relativt til innsats (effekt − innsats ≥ 1). */
function erGjorForst(innsats: Niva, effekt: Niva) {
  return effekt - innsats >= 1;
}

function Chip({ t }: { t: SelectionTiltak }) {
  const tip = [
    t.hvorfor,
    t.toveis ? `↔ ${t.toveis}` : null,
    t.blokkertAv ? `Blokkert: ${t.blokkertAv}` : null,
    t.forgood ? `FORGOOD: ${t.forgood}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <span
      className={`tu__chip tu__chip--${t.aktor} tu__chip--${t.tier}${
        t.blokkertAv ? " tu__chip--blokkert" : ""
      }`}
      title={tip || undefined}
    >
      {t.tier === "pakke1" && (
        <CheckmarkCircleIcon aria-hidden className="tu__chip-ic" />
      )}
      {t.blokkertAv && (
        <ExclamationmarkTriangleIcon aria-hidden className="tu__chip-ic" />
      )}
      <b>{t.id}</b> {t.title}
      {t.toveis && <span className="tu__chip-link">↔</span>}
    </span>
  );
}

export function TiltakspakkeUtvelgelseView() {
  const [view, setView] = useState<View>("ag");
  const aktorFilter = view === "begge" ? undefined : view;
  const valgte = pakke1(aktorFilter);
  const kjerne = valgte.filter((t) => t.kjerne);
  const stotte = valgte.filter((t) => !t.kjerne);

  return (
    <VStack gap="space-24" className="tu">
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
          <HStack gap="space-8" align="center" wrap>
            <Button
              as={NextLink}
              href="/atferdsmatrise"
              variant="tertiary"
              size="small"
              icon={<TableIcon aria-hidden />}
            >
              Atferdsmatrise
            </Button>
            <Button
              as={NextLink}
              href="/tiltakskart"
              variant="tertiary"
              size="small"
              icon={<TableIcon aria-hidden />}
            >
              Tiltakskart
            </Button>
          </HStack>
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
              <Heading level="2" size="large">
                Hvilke tiltak skal med i første pakke?
              </Heading>
              <BodyLong>
                De bearbeidede tiltakene plassert etter forventet{" "}
                <strong>effekt</strong> og <strong>innsats</strong>. Øvre
                venstre hjørne — høy effekt, lav innsats — er «gjør først».
                Forslaget til pakke 1 er uthevet og samler seg om det høyeste
                løftepunktet: stillheten før 4-ukers-fristen.
              </BodyLong>
            </VStack>
            <ToggleGroup
              label="Velg spor"
              value={view}
              onChange={(v) => setView(v as View)}
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
        {utkastNote}
      </Alert>

      <HStack gap="space-8" wrap>
        <Tag variant="success" size="small">
          {valgte.length} foreslått i pakke 1
        </Tag>
        <Tag variant="neutral" size="small">
          {kjerne.length} kjerne · {stotte.length} støtte
        </Tag>
        <Tag variant="warning" size="small">
          {valgte.filter((t) => t.blokkertAv).length} med åpen avklaring
        </Tag>
      </HStack>

      <div className="tu-scroll">
        <table className="tu-matrix">
          <caption className="tu-matrix__caption">
            Effekt (rad) mot innsats (kolonne) for{" "}
            {view === "begge" ? "begge spor" : aktorLabel[view].toLowerCase()}.
            Øvre venstre = høy effekt, lav innsats.
          </caption>
          <thead>
            <tr>
              <td className="tu-matrix__corner" aria-hidden />
              {INNSATS.map((i) => (
                <th key={i} scope="col" className="tu-matrix__colhead">
                  {innsatsLabels[i]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EFFEKT.map((e) => (
              <tr key={e}>
                <th scope="row" className="tu-matrix__rowhead">
                  {effektLabels[e]}
                </th>
                {INNSATS.map((i) => {
                  const cell = tiltakAt(i, e, aktorFilter);
                  return (
                    <td
                      key={i}
                      className={`tu-matrix__cell${
                        erGjorForst(i, e) ? " tu-matrix__cell--first" : ""
                      }`}
                    >
                      {erGjorForst(i, e) && cell.length === 0 && (
                        <span className="tu-matrix__zone">Gjør først</span>
                      )}
                      {cell.map((t) => (
                        <Chip key={t.id} t={t} />
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <HStack gap="space-16" wrap className="tu-legend">
        <span className="tu-legend__item">
          <i className="tu-legend__sw tu-legend__sw--ag" aria-hidden />
          Arbeidsgiver
        </span>
        <span className="tu-legend__item">
          <i className="tu-legend__sw tu-legend__sw--sm" aria-hidden />
          Den sykmeldte
        </span>
        <span className="tu-legend__item">
          <CheckmarkCircleIcon aria-hidden /> Foreslått i pakke 1
        </span>
        <span className="tu-legend__item">
          <ExclamationmarkTriangleIcon aria-hidden /> Åpen avklaring / blokkert
        </span>
        <span className="tu-legend__item">↔ Toveis kobling</span>
      </HStack>

      <Box
        className="tu-forslag"
        borderWidth="1"
        borderRadius="12"
        padding="space-24"
      >
        <VStack gap="space-16">
          <VStack gap="space-4">
            <Heading level="2" size="medium">
              Forslag: Tiltakspakke 1
            </Heading>
            <BodyShort size="small" className="muted">
              Konsentrert om tidlig signal + behovsvurdering — fra begge sider,
              før uke 4. Et utgangspunkt for kalibrering.
            </BodyShort>
          </VStack>

          <div className="tu-forslag__cols">
            <div>
              <Heading level="3" size="xsmall">
                Kjerne — bærer pakken
              </Heading>
              <ul className="tu-forslag__list">
                {kjerne.map((t) => (
                  <li key={t.id}>
                    <span
                      className={`tu-forslag__id tu-forslag__id--${t.aktor}`}
                    >
                      {t.id}
                    </span>
                    <span>
                      <b>{t.title}</b>
                      {t.hvorfor && <em> — {t.hvorfor}</em>}
                      {t.toveis && (
                        <span className="tu-forslag__toveis">↔ {t.toveis}</span>
                      )}
                      {t.blokkertAv && (
                        <span className="tu-forslag__blokkert">
                          <ExclamationmarkTriangleIcon aria-hidden />{" "}
                          {t.blokkertAv}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Heading level="3" size="xsmall">
                Støtte — billig forsterker
              </Heading>
              <ul className="tu-forslag__list">
                {stotte.map((t) => (
                  <li key={t.id}>
                    <span
                      className={`tu-forslag__id tu-forslag__id--${t.aktor}`}
                    >
                      {t.id}
                    </span>
                    <span>
                      <b>{t.title}</b>
                      {t.hvorfor && <em> — {t.hvorfor}</em>}
                      {t.blokkertAv && (
                        <span className="tu-forslag__blokkert">
                          <ExclamationmarkTriangleIcon aria-hidden />{" "}
                          {t.blokkertAv}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
                {stotte.length === 0 && (
                  <li className="muted">
                    Ingen rene støttetiltak i dette sporet.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <VStack gap="space-4">
            <Heading level="3" size="xsmall">
              Vurdert mot disse kriteriene
            </Heading>
            <ol className="tu-kriterier">
              {pakke1Kriterier.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ol>
          </VStack>
        </VStack>
      </Box>

      <Box borderWidth="1" borderRadius="8" padding="space-16">
        <VStack gap="space-8">
          <Heading level="3" size="small">
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
