import { FORSOKSDESIGN } from "../maling-data";
import { SectionHead } from "./SectionHead";

/**
 * Kort metodeforklaring. Detaljene ligger etter styringstallene, slik at
 * dashboardet starter med det brukeren faktisk skal lese av.
 */
export function ForsoksdesignSection() {
  return (
    <section className="mal__sec" aria-labelledby="mal-design-h">
      <SectionHead
        num={2}
        headingId="mal-design-h"
        title="Slik er forsøket satt opp"
      >
        To armer sammenlignes. {FORSOKSDESIGN.pilot}. Underenhet bestemmer arm,
        mens vi måler sykefraværsforløp over tid.
      </SectionHead>

      <div className="mal__arms">
        {FORSOKSDESIGN.armer.map((a) => (
          <div className={`mal__arm mal__arm--${a.arm}`} key={a.arm}>
            <span className="mal__arm-tag">
              {a.arm === "pakke" ? "Tiltaksarm" : "Kontrollarm"}
            </span>
            <span className="mal__arm-navn">{a.navn}</span>
            <span className="mal__arm-desc">{a.beskrivelse}</span>
          </div>
        ))}
      </div>

      <div className="mal__design-grid">
        <div className="mal__design-card">
          <h3 className="mal__design-h">
            {FORSOKSDESIGN.tildelingsenhet.tittel}
          </h3>
          <ul className="mal__design-list">
            {FORSOKSDESIGN.tildelingsenhet.punkter.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="mal__design-card">
          <h3 className="mal__design-h">{FORSOKSDESIGN.maleenhet.tittel}</h3>
          <ul className="mal__design-list">
            {FORSOKSDESIGN.maleenhet.punkter.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="mal__design-card mal__design-card--segment">
          <h3 className="mal__design-h">{FORSOKSDESIGN.segment.tittel}</h3>
          <ul className="mal__design-list">
            {FORSOKSDESIGN.segment.punkter.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
