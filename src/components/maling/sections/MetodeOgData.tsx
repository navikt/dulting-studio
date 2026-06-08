import { ReadMore, Tag } from "@navikt/ds-react";
import { DATAGRUNNLAG, FORSOKSDESIGN } from "../maling-data";
import { SectionHead } from "./SectionHead";

// Arbeidsgiver-boksar per region. Armen bestemmes av REGION (heile T&F = pakke,
// resten av Norge = kontroll), ikkje innad i eit fylke.
const REGION_ARBEIDSGIVERE = [
  { id: "tf-a", x: 16, arm: "pakke" as const },
  { id: "tf-b", x: 122, arm: "pakke" as const },
  { id: "no-a", x: 256, arm: "kontroll" as const },
  { id: "no-b", x: 362, arm: "kontroll" as const },
];

/**
 * Metode og datagrunnlag — samlet seksjon bak ein ReadMore-utvider.
 * Innheld forsøksdesign (to armer, tildelingsenhet, måleenhet, segment) og
 * aggregatkontrakt (datagrunnlag). Plassert sist fordi det er fagdetaljar
 * heller enn hovudforteljinga.
 */
export function MetodeOgData() {
  return (
    <section
      id="metode-data"
      className="mal__sec"
      aria-labelledby="mal-metode-h"
    >
      <SectionHead
        num={6}
        headingId="mal-metode-h"
        title="Slik er forsøket satt opp og hvor tallene kommer fra"
      >
        Detaljer om forsøksdesign og datagrunnlag — skjult som standard for å
        holde dashboardet fokusert.
      </SectionHead>

      <ReadMore header="Metode &amp; datagrunnlag" defaultOpen={false}>
        {/* ---- Region → arbeidsgiver → forløp ---- */}
        <div className="mal__panel" style={{ marginBottom: "20px" }}>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "13.5px",
              fontWeight: 700,
              color: "var(--mal-ink)",
            }}
          >
            Slik tildeles arm: region → arbeidsgiver → forløp
          </p>
          <svg
            className="mal__nivaa-svg"
            viewBox="0 0 480 216"
            aria-label="To-region-diagram: hele Troms og Finnmark får tiltakspakka (alle arbeidsgivere blå), resten av Norge er kontroll (alle grå). Forløp (sykmeldte) er nøstet under hver arbeidsgiver."
            role="img"
            width="480"
            height="216"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            {/* Region: Troms og Finnmark = tiltakspakke */}
            <rect
              x="4"
              y="22"
              width="228"
              height="190"
              rx="12"
              ry="12"
              fill="var(--pakke-soft)"
              stroke="var(--pakke)"
              strokeWidth="1.5"
            />
            <text
              x="16"
              y="40"
              fontSize="11.5"
              fontWeight="700"
              fill="var(--pakke-ink)"
              fontFamily="var(--mal-body)"
            >
              Troms og Finnmark
            </text>
            <text
              x="16"
              y="55"
              fontSize="9.5"
              fontWeight="700"
              fill="var(--pakke-ink)"
              fontFamily="var(--mal-body)"
            >
              → Tiltakspakke (alle arbeidsgivere)
            </text>

            {/* Region: Resten av Norge = kontroll */}
            <rect
              x="244"
              y="22"
              width="232"
              height="190"
              rx="12"
              ry="12"
              fill="var(--kontroll-soft)"
              stroke="var(--kontroll)"
              strokeWidth="1.5"
            />
            <text
              x="256"
              y="40"
              fontSize="11.5"
              fontWeight="700"
              fill="var(--kontroll-ink)"
              fontFamily="var(--mal-body)"
            >
              Resten av Norge
            </text>
            <text
              x="256"
              y="55"
              fontSize="9.5"
              fontWeight="700"
              fill="var(--kontroll-ink)"
              fontFamily="var(--mal-body)"
            >
              → Kontroll
            </text>

            {/* Arbeidsgiver-boksar (alle same arm som regionen) + forløp */}
            {REGION_ARBEIDSGIVERE.map((e) => {
              const col =
                e.arm === "pakke" ? "var(--pakke)" : "var(--kontroll)";
              const ink =
                e.arm === "pakke" ? "var(--pakke-ink)" : "var(--kontroll-ink)";
              return (
                <g key={e.id}>
                  <rect
                    x={e.x}
                    y="64"
                    width="100"
                    height="138"
                    rx="9"
                    ry="9"
                    fill="#fff"
                    stroke={col}
                    strokeWidth="1.25"
                  />
                  <text
                    x={e.x + 10}
                    y="81"
                    fontSize="9.5"
                    fontWeight="700"
                    fill={ink}
                    fontFamily="var(--mal-body)"
                  >
                    Arbeidsgiver
                  </text>
                  {[0, 1, 2].map((d) => (
                    <g key={`${e.id}-${d}`}>
                      <circle
                        cx={e.x + 50}
                        cy={104 + d * 32}
                        r="11"
                        fill={col}
                        fillOpacity="0.22"
                        stroke={col}
                        strokeWidth="1.4"
                      />
                      <text
                        x={e.x + 50}
                        y={108 + d * 32}
                        fontSize="8.5"
                        textAnchor="middle"
                        fontWeight="600"
                        fill={ink}
                        fontFamily="var(--mal-body)"
                      >
                        Sm
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: "12px",
              color: "var(--mal-ink-faint)",
              fontFamily: "var(--mal-body)",
              lineHeight: 1.5,
            }}
          >
            Armen bestemmes av <b>region</b>: hele Troms og Finnmark får
            tiltakspakka, resten av Norge er kontroll. Allokeringen registreres
            på arbeidsgiver (underenhet) — så <b>alle</b> arbeidsgivere i
            T&amp;F er i pakka — og forløp (sykmeldte, «Sm») er nøstet under.
            Regionene sammenlignes som diff-in-diff. (Lisa eier allokeringen.)
          </p>
          <p
            style={{
              margin: "10px 0 0",
              padding: "10px 14px",
              fontSize: "12px",
              color: "var(--mal-ink-2)",
              fontFamily: "var(--mal-body)",
              lineHeight: 1.5,
              background: "rgba(0, 103, 197, 0.04)",
              borderRadius: "8px",
              border: "1px solid var(--mal-line-soft)",
            }}
          >
            <b>Regionalt forbehold:</b> Det finnes baseline-forskjeller i
            sykefravær mellom Troms og Finnmark og resten av landet.
            Diff-in-diff sammenligner <em>endring over tid</em> — ikke nivå — og
            demper dermed baseline-forskjellene. Eventuell vekting, normering og
            en T&amp;F-spesifikk «nåsituasjon»-baseline er en Data
            Science-beslutning.
          </p>
        </div>

        {/* ---- Forsøksdesign: to armer ---- */}
        <div className="mal__arms" style={{ marginBottom: "14px" }}>
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

        {/* ---- Forsøksdesign: kortgrid ---- */}
        <div className="mal__design-grid" style={{ marginBottom: "20px" }}>
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

        {/* ---- Datagrunnlag og aggregatkontrakt ---- */}
        <div className="mal__panel">
          <div className="mal__datatop">
            <div className="mal__srcrow">
              <span className="mal__tag mal__tag--reg">Produkt</span>
              <span>{DATAGRUNNLAG.produkt}</span>
            </div>
            <div className="mal__srcrow">
              <span className="mal__tag mal__tag--sur">Eier</span>
              <span>{DATAGRUNNLAG.eier}</span>
            </div>
          </div>

          <p className="mal__data-rolle">
            <Tag variant="info" size="small">
              Studio = konsument
            </Tag>{" "}
            {DATAGRUNNLAG.rolleStudio}
          </p>

          <dl className="mal__contract">
            {DATAGRUNNLAG.kontrakt.map((c) => (
              <div className="mal__contract-card" key={c.tittel}>
                <dt className="mal__contract-h">{c.tittel}</dt>
                <dd>
                  <b className="mal__contract-v">{c.verdi}</b>
                  <span className="mal__contract-t">{c.tekst}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </ReadMore>
    </section>
  );
}
