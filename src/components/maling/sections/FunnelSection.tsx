import {
  FUNNEL,
  pakkeForSegment,
  SEGMENT_LABEL,
  type Segment,
} from "../maling-data";
import { SectionHead } from "./SectionHead";

/**
 * Funnelen er et DIAGNOSEVERKTØY — viser hvor i forløpet vi mister folk, ikke
 * hovedbeviset for effekt. Pakke (filtrert segment) mot kontroll, steg for
 * steg, alt som % av egen kohort.
 */
export function FunnelSection({ segment }: { segment: Segment }) {
  return (
    <section className="mal__sec" aria-labelledby="mal-funnel-h">
      <SectionHead
        num={5}
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
            <span className="mal__sw mal__sw--kontroll" /> Kontroll
          </span>
          <span className="mal__syn">Diagnose · syntetiske tall</span>
        </div>

        <div className="mal__funnel">
          {FUNNEL.map((step) => {
            const pakke = pakkeForSegment(
              { kontroll: step.kontroll, pakke: step.pakke },
              segment,
            );
            return (
              <div className="mal__step" key={step.label}>
                <div className="mal__step-label">
                  {step.label}
                  <span className="mal__step-sub">{step.sub}</span>
                </div>
                <div
                  className="mal__bars"
                  role="img"
                  aria-label={`${step.label}: pakke ${pakke} prosent, kontroll ${step.kontroll} prosent av kohorten.`}
                >
                  <div className="mal__bar">
                    <span className="mal__bar-seg" aria-hidden>
                      P
                    </span>
                    <div className="mal__track">
                      <div
                        className="mal__fill mal__fill--pakke"
                        style={{ width: `${pakke}%` }}
                      />
                    </div>
                    <span className="mal__val">
                      <span className="sr-only">Pakke: </span>
                      {pakke}%
                    </span>
                  </div>
                  <div className="mal__bar">
                    <span className="mal__bar-seg" aria-hidden>
                      K
                    </span>
                    <div className="mal__track">
                      <div
                        className="mal__fill mal__fill--kontroll"
                        style={{ width: `${step.kontroll}%` }}
                      />
                    </div>
                    <span className="mal__val">
                      <span className="sr-only">Kontroll: </span>
                      {step.kontroll}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
