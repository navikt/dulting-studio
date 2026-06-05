import { Tag } from "@navikt/ds-react";
import {
  LUMI_MAX,
  LUMI_SKALA,
  LUMI_SPORSMAL,
  type LumiSpørsmål,
  lumiForSegment,
  lumiPosisjon,
  SEGMENT_LABEL,
  type Segment,
} from "../maling-data";
import { SectionHead } from "./SectionHead";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Gjennomsnitts-score for én aktørgruppe (ag+sm / 2). */
function snitt(score: { ag: number; sm: number }): number {
  return round1((score.ag + score.sm) / 2);
}

function LumiRad({
  s,
  segment,
  midtTick,
}: {
  s: LumiSpørsmål;
  segment: Segment;
  midtTick: number;
}) {
  const pakkeScore = lumiForSegment(s, segment);
  const pakkeSnitt = snitt(pakkeScore);
  const pakkePct = lumiPosisjon(pakkeSnitt);

  const ariaLabel = s.kunPakke
    ? `${s.q} — Pakke ${pakkeSnitt.toFixed(1)} av ${LUMI_MAX}. Kun pakke-armen svarer på dette spørsmålet.`
    : (() => {
        // biome-ignore lint/style/noNonNullAssertion: sammenlignbare har alltid kontroll
        const kontrollSnitt = snitt(s.kontroll!);
        return `${s.q} — Pakke ${pakkeSnitt.toFixed(1)} av ${LUMI_MAX}, kontroll ${kontrollSnitt.toFixed(1)} av ${LUMI_MAX}.`;
      })();

  return (
    <div className="mal__lk-rad" key={s.tag}>
      <div className="mal__lk-sporsmal-q">
        <span>{s.q}</span>
        <div className="mal__lk-q-meta">
          <Tag
            variant={s.status === "bra" ? "success" : "warning"}
            size="xsmall"
            className="mal__lk-status-tag"
          >
            {s.status === "bra" ? "Ser lovende ut" : "Følg med"}
          </Tag>
          {s.kunPakke && (
            <span className="mal__lk-kunpakke-note">
              Kun pakka — kontroll får ingen påminnelse
            </span>
          )}
        </div>
      </div>

      <div className="mal__lk-scale" role="img" aria-label={ariaLabel}>
        {/* Tick-merker */}
        <div className="mal__lk-ticks" aria-hidden="true">
          <span className="mal__lk-tick" style={{ left: "0%" }}>
            1
          </span>
          <span
            className="mal__lk-tick"
            style={{ left: `${lumiPosisjon(midtTick)}%` }}
          >
            {midtTick}
          </span>
          <span className="mal__lk-tick" style={{ left: "100%" }}>
            {LUMI_MAX}
          </span>
        </div>

        {/* Aksellinje */}
        <div className="mal__lk-axline" aria-hidden="true" />

        {/* Kontroll-prikk (grå) — kun for sammenlignbare spørsmål */}
        {!s.kunPakke && s.kontroll && (
          <span
            className="mal__lk-dot mal__lk-dot--kontroll"
            style={{ left: `${lumiPosisjon(snitt(s.kontroll))}%` }}
            aria-hidden="true"
          />
        )}

        {/* Pakke-prikk (blå) */}
        <span
          className="mal__lk-dot mal__lk-dot--pakke"
          style={{ left: `${pakkePct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/**
 * Mekanisme-lag: to subseksjoner:
 * 1. Sammenlignbare spørsmål — begge armer; grå prikk = kontroll, blå = pakke.
 * 2. Kun-pakka — om påminnelsen; kun blå (pakke) prikk — kontroll får ingen påminnelse.
 *
 * Prikk = snittscore (1–5) per arm, beregnet som gjennomsnitt av ag- og sm-score.
 */
export function LumiSection({ segment }: { segment: Segment }) {
  const midtTick = Math.ceil(LUMI_MAX / 2); // = 3

  const sammenlignbare = LUMI_SPORSMAL.filter((s) => !s.kunPakke);
  const kunPakke = LUMI_SPORSMAL.filter((s) => s.kunPakke);

  return (
    <section id="mekanisme" className="mal__sec" aria-labelledby="mal-lumi-h">
      <SectionHead
        num={2}
        headingId="mal-lumi-h"
        title="Bedres dialogen — eller lager vi bare papir?"
      >
        Lumi gir tidlige signaler fra arbeidsgiver og den sykmeldte. Vi vil se
        mer forståelse, tidligere kontakt og lite opplevd press.
      </SectionHead>

      <div className="mal__panel">
        <p className="mal__lumi-scale">
          Skala: {LUMI_SKALA}. Hver prikk er snittscore (1–5) per arm for{" "}
          {SEGMENT_LABEL[segment].toLowerCase()}.
        </p>

        <div className="mal__legend">
          <span className="mal__legend-item">
            <span
              className="mal__lk-dot mal__lk-dot--kontroll"
              aria-hidden="true"
            />
            Kontroll
          </span>
          <span className="mal__legend-item">
            <span
              className="mal__lk-dot mal__lk-dot--pakke"
              aria-hidden="true"
            />
            Tiltakspakke
          </span>
          <span className="mal__syn">Lumi · syntetiske tall</span>
        </div>

        {/* Subseksjon 1: Sammenlignbart — begge armer */}
        <div className="mal__lk-gruppe">
          <h3 className="mal__lk-gruppe-tittel">
            Sammenlignbart — pakke mot kontroll
          </h3>
          <div className="mal__lk-sporsmal">
            {sammenlignbare.map((s) => (
              <LumiRad
                key={s.tag}
                s={s}
                segment={segment}
                midtTick={midtTick}
              />
            ))}
          </div>
        </div>

        {/* Subseksjon 2: Kun pakka — om påminnelsen */}
        <div className="mal__lk-gruppe mal__lk-gruppe--kunpakke">
          <h3 className="mal__lk-gruppe-tittel">
            Kun pakka — om selve påminnelsen
          </h3>
          <div className="mal__lk-sporsmal">
            {kunPakke.map((s) => (
              <LumiRad
                key={s.tag}
                s={s}
                segment={segment}
                midtTick={midtTick}
              />
            ))}
          </div>
        </div>

        <p className="mal__gapnote">
          Lumi svarer på om tiltaket kjennes nyttig og trygt — dette er tidlige
          signaler, ikke bevis for effekt. Om AID faktisk når målene sine, leser
          vi i styringstallene over.
        </p>
      </div>
    </section>
  );
}
