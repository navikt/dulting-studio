import { Tag } from "@navikt/ds-react";
import {
  LUMI_MAX,
  LUMI_SKALA,
  LUMI_SPORSMAL,
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

/**
 * Mekanisme-lag: ett punktplott per Lumi-spørsmål på skala 1–5.
 * Grå prikk = kontroll, blå prikk = tiltakspakke for valgt segment.
 * Den synlige avstanden mellom prikkene er pakke-vs-kontroll-differansen.
 */
export function LumiSection({ segment }: { segment: Segment }) {
  const midtTick = Math.ceil(LUMI_MAX / 2); // = 3

  return (
    <section id="mekanisme" className="mal__sec" aria-labelledby="mal-lumi-h">
      <SectionHead
        num={4}
        headingId="mal-lumi-h"
        title="Bedres dialogen — eller lager vi bare papir?"
      >
        Lumi gir tidlige signaler fra arbeidsgiver og den sykmeldte. Vi vil se
        mer forståelse, tidligere kontakt og lite opplevd press.
      </SectionHead>

      <div className="mal__panel">
        <p className="mal__lumi-scale">
          Skala: {LUMI_SKALA}. Viser {SEGMENT_LABEL[segment].toLowerCase()} mot
          kontroll.
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

        <div className="mal__lk-sporsmal">
          {LUMI_SPORSMAL.map((s) => {
            const pakkeScore = lumiForSegment(s, segment);
            const pakkeSnitt = snitt(pakkeScore);
            const kontrollSnitt = snitt(s.kontroll);
            const pakkePct = lumiPosisjon(pakkeSnitt);
            const kontrollPct = lumiPosisjon(kontrollSnitt);

            return (
              <div className="mal__lk-rad" key={s.tag}>
                <div className="mal__lk-sporsmal-q">
                  <span>{s.q}</span>
                  <Tag
                    variant={s.status === "bra" ? "success" : "warning"}
                    size="xsmall"
                  >
                    {s.status === "bra" ? "Ser lovende ut" : "Følg med"}
                  </Tag>
                </div>

                <div
                  className="mal__lk-scale"
                  role="img"
                  aria-label={`${s.q} — Pakke ${pakkeSnitt.toFixed(1)} av ${LUMI_MAX}, kontroll ${kontrollSnitt.toFixed(1)} av ${LUMI_MAX}.`}
                >
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

                  {/* Kontroll-prikk (grå) */}
                  <span
                    className="mal__lk-dot mal__lk-dot--kontroll"
                    style={{ left: `${kontrollPct}%` }}
                    aria-hidden="true"
                  />

                  {/* Pakke-prikk (blå) */}
                  <span
                    className="mal__lk-dot mal__lk-dot--pakke"
                    style={{ left: `${pakkePct}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
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
