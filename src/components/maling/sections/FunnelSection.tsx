import { Tag } from "@navikt/ds-react";
import {
  FUNNEL,
  pakkeForSegment,
  SEGMENT_LABEL,
  type Segment,
} from "../maling-data";
import { SectionHead } from "./SectionHead";

/**
 * Funnelen er et DIAGNOSEVERKTØY — viser hvor i forløpet vi mister folk, ikke
 * hovedbeviset for effekt. Centret kile-form: pakke-søyle smalner nedover
 * (= funnel). Kontroll er en tynn referanselinje på hver rad.
 */
export function FunnelSection({ segment }: { segment: Segment }) {
  // Beregn pakke-% per steg
  const stegMedTall = FUNNEL.map((step) => ({
    ...step,
    pakke: pakkeForSegment(
      { kontroll: step.kontroll, pakke: step.pakke },
      segment,
    ),
  }));

  // Finn steget med STØRST fall mellom to påfølgende trinn (pakke-%)
  let størsteStegIndeks = -1;
  let størstefall = 0;
  for (let i = 1; i < stegMedTall.length; i++) {
    const fall = stegMedTall[i - 1].pakke - stegMedTall[i].pakke;
    if (fall > størstefall) {
      størstefall = fall;
      størsteStegIndeks = i;
    }
  }

  return (
    <section id="funnel" className="mal__sec" aria-labelledby="mal-funnel-h">
      <SectionHead
        num={4}
        headingId="mal-funnel-h"
        title="Hvor faller folk av?"
      >
        Bruk dette til å se hvor flyten stopper. Pakke følger filteret (
        {SEGMENT_LABEL[segment]}); kontroll er referanse.
      </SectionHead>

      <div className="mal__panel">
        <div className="mal__legend">
          <span className="mal__legend-item">
            <span className="mal__sw mal__sw--pakke" /> Pakke ·{" "}
            {SEGMENT_LABEL[segment]}
          </span>
          <span className="mal__legend-item">
            <span className="mal__sw mal__sw--kontroll mal__sw--line" />{" "}
            Kontroll
          </span>
          <span className="mal__syn">Diagnose · syntetiske tall</span>
        </div>

        <div className="mal__trakt">
          {stegMedTall.map((step, i) => (
            <div className="mal__trakt-steg" key={step.label}>
              {/* Marker største fall */}
              {i === størsteStegIndeks && (
                <div className="mal__trakt-fall-merke">
                  <Tag variant="warning" size="xsmall">
                    Største fall
                  </Tag>
                  <span className="mal__trakt-fall-pil" aria-hidden="true">
                    ▼
                  </span>
                </div>
              )}

              <div
                className="mal__trakt-rad"
                role="img"
                aria-label={`${step.label}: pakke ${step.pakke} prosent, kontroll ${step.kontroll} prosent av kohorten.`}
              >
                {/* Sentert pakke-søyle */}
                <div
                  className="mal__trakt-bar"
                  style={{ width: `${step.pakke}%` }}
                >
                  <span className="mal__trakt-bar-label">
                    {step.label}
                    <span className="mal__trakt-bar-sub">{step.sub}</span>
                  </span>
                  <span className="mal__trakt-bar-pct">{step.pakke}%</span>
                </div>

                {/* Kontroll-referanselinje (tynn, grå) */}
                <div
                  className="mal__trakt-kontroll"
                  style={{ width: `${step.kontroll}%` }}
                  aria-hidden="true"
                >
                  <span className="mal__trakt-kontroll-pct">
                    {step.kontroll}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mal__gapnote">
          <b>Les den som diagnose:</b> det største fallet mellom to steg er der
          innsatsen skal settes inn. Effekten av pakka avgjøres av
          styringstallene og lang horisont — ikke av funnel-formen alene.
        </p>
      </div>
    </section>
  );
}
