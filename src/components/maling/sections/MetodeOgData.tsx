import { ReadMore, Tag } from "@navikt/ds-react";
import { DATAGRUNNLAG, FORSOKSDESIGN } from "../maling-data";
import { SectionHead } from "./SectionHead";

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
        {/* ---- Flernivå-figur ---- */}
        <div className="mal__panel" style={{ marginBottom: "20px" }}>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "13.5px",
              fontWeight: 700,
              color: "var(--mal-ink)",
            }}
          >
            Allokeringshierarki
          </p>
          <svg
            className="mal__nivaa-svg"
            viewBox="0 0 480 210"
            aria-label="Tre-nivå-diagram: Fylke (Troms og Finnmark) inneheld to arbeidsgiver-boksar — éin pakke-blå og éin kontroll-grå — kvar med fleire sykmeldte-sirklar."
            role="img"
            width="480"
            height="210"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            {/* Fylke-boks */}
            <rect
              x="4"
              y="4"
              width="472"
              height="202"
              rx="12"
              ry="12"
              fill="none"
              stroke="var(--mal-line)"
              strokeWidth="1.5"
            />
            <text
              x="16"
              y="22"
              fontSize="11"
              fontWeight="700"
              fill="var(--mal-ink-faint)"
              fontFamily="var(--mal-body)"
            >
              Fylke (Troms og Finnmark)
            </text>

            {/* Tiltaksarm — arbeidsgiver 1 */}
            <rect
              x="20"
              y="34"
              width="210"
              height="158"
              rx="10"
              ry="10"
              fill="var(--pakke-soft)"
              stroke="var(--pakke)"
              strokeWidth="1.5"
            />
            <text
              x="32"
              y="54"
              fontSize="11"
              fontWeight="700"
              fill="var(--pakke-ink)"
              fontFamily="var(--mal-body)"
            >
              Arbeidsgiver A
            </text>
            <text
              x="32"
              y="68"
              fontSize="9.5"
              fill="var(--pakke-ink)"
              fontFamily="var(--mal-body)"
            >
              Tiltaksarm
            </text>
            {/* Sykmeldte-prikkar (pakke) */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle
                key={`p${i}`}
                cx={50 + (i % 3) * 52}
                cy={108 + Math.floor(i / 3) * 48}
                r="14"
                fill="var(--pakke)"
                fillOpacity="0.22"
                stroke="var(--pakke)"
                strokeWidth="1.5"
              />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <text
                key={`pt${i}`}
                x={50 + (i % 3) * 52}
                y={112 + Math.floor(i / 3) * 48}
                fontSize="9"
                textAnchor="middle"
                fill="var(--pakke-ink)"
                fontWeight="600"
                fontFamily="var(--mal-body)"
              >
                Sm
              </text>
            ))}

            {/* Kontrollarm — arbeidsgiver 2 */}
            <rect
              x="250"
              y="34"
              width="210"
              height="158"
              rx="10"
              ry="10"
              fill="var(--kontroll-soft)"
              stroke="var(--kontroll)"
              strokeWidth="1.5"
            />
            <text
              x="262"
              y="54"
              fontSize="11"
              fontWeight="700"
              fill="var(--kontroll-ink)"
              fontFamily="var(--mal-body)"
            >
              Arbeidsgiver B
            </text>
            <text
              x="262"
              y="68"
              fontSize="9.5"
              fill="var(--kontroll-ink)"
              fontFamily="var(--mal-body)"
            >
              Kontrollarm
            </text>
            {/* Sykmeldte-prikkar (kontroll) */}
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={`k${i}`}
                cx={280 + (i % 3) * 52}
                cy={108 + Math.floor(i / 3) * 48}
                r="14"
                fill="var(--kontroll)"
                fillOpacity="0.22"
                stroke="var(--kontroll)"
                strokeWidth="1.5"
              />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <text
                key={`kt${i}`}
                x={280 + (i % 3) * 52}
                y={112 + Math.floor(i / 3) * 48}
                fontSize="9"
                textAnchor="middle"
                fill="var(--kontroll-ink)"
                fontWeight="600"
                fontFamily="var(--mal-body)"
              >
                Sm
              </text>
            ))}
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
            Allokering skjer på arbeidsgiver-nivå; forløp (sykmeldte) er nøstet
            under. (Lisa eier allokeringen.)
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
