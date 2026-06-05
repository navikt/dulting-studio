import { Tag } from "@navikt/ds-react";
import {
  LUMI_SKALA,
  LUMI_SPORSMAL,
  lumiForSegment,
  SEGMENT_LABEL,
  type Segment,
} from "../maling-data";
import { SectionHead } from "./SectionHead";

/**
 * Lumi viser om tiltaket oppleves riktig. Hold teksten enkel: dette er tidlige
 * signaler, ikke bevis for effekt.
 */
export function LumiSection({ segment }: { segment: Segment }) {
  return (
    <section className="mal__sec" aria-labelledby="mal-lumi-h">
      <SectionHead num={4} headingId="mal-lumi-h" title="Er vi på riktig vei?">
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
            <span className="mal__sw mal__sw--ag" /> Arbeidsgiver
          </span>
          <span className="mal__legend-item">
            <span className="mal__sw mal__sw--sm" /> Den sykmeldte
          </span>
          <span className="mal__syn">Lumi · syntetiske tall</span>
        </div>

        <div className="mal__lumi">
          {LUMI_SPORSMAL.map((s) => {
            const pakke = lumiForSegment(s, segment);
            return (
              <div className="mal__lumi-row" key={s.tag}>
                <div className="mal__lumi-q">
                  <span>{s.q}</span>
                  <Tag
                    variant={s.status === "bra" ? "success" : "warning"}
                    size="xsmall"
                  >
                    {s.status === "bra" ? "Ser lovende ut" : "Følg med"}
                  </Tag>
                </div>
                <dl
                  className="mal__lumi-scores"
                  aria-label={`${s.q} Pakke ${SEGMENT_LABEL[segment]}: arbeidsgiver ${pakke.ag}, sykmeldt ${pakke.sm}. Kontroll: arbeidsgiver ${s.kontroll.ag}, sykmeldt ${s.kontroll.sm}. Skala 1 til 5.`}
                >
                  <div className="mal__lumi-cell">
                    <dt>Pakke</dt>
                    <dd>
                      <b className="mal__lumi-ag">{pakke.ag.toFixed(1)}</b> /{" "}
                      <b className="mal__lumi-sm">{pakke.sm.toFixed(1)}</b>
                    </dd>
                  </div>
                  <div className="mal__lumi-cell mal__lumi-cell--ref">
                    <dt>Kontroll</dt>
                    <dd>
                      {s.kontroll.ag.toFixed(1)} / {s.kontroll.sm.toFixed(1)}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        <p className="mal__gapnote">
          Lumi svarer på om tiltaket kjennes nyttig og trygt. Om AID faktisk når
          målene sine, leser vi i styringstallene over.
        </p>
      </div>
    </section>
  );
}
