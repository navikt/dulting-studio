import { Tag } from "@navikt/ds-react";
import {
  VARSEL_ETIKK,
  VARSEL_LEVERING,
  VARSEL_LEVERING_FORKLARING,
  VARSEL_VALG,
} from "../maling-data";
import { MetricExplainer } from "./MetricExplainer";
import { SectionHead } from "./SectionHead";

/**
 * Levering, adopsjon og guardrail for påminnelsen.
 *
 * Påminnelsen er deterministisk timet — den sendes når et forløp er på vei til
 * å passere uke 4 uten plan. Det som måles er derfor IKKE «når kom den», men:
 *   1. Ble den levert i tide? (nær 100 % by design; avvik = gap/bugs)
 *   2. Ble den brukt? (adopsjonssignal — faktisk dult)
 *   3. Ble urene varsler luket ut? (guardrail: for sene / duplikate)
 *
 * Opt-in/opt-out spores separat og påvirkes ikke av segmentfilteret over.
 * Opplevd press bor i VerdiktBand/VARSEL_ETIKK og kryssrefereres herfra.
 */
export function PromptTimingSection() {
  return (
    <section id="timing" className="mal__sec" aria-labelledby="mal-timing-h">
      <SectionHead
        num={3}
        headingId="mal-timing-h"
        title="Nådde påminnelsen fram — og blir den brukt?"
      >
        Levering, adopsjon og guardrail for påminnelsen (opt-in-segmentet).
      </SectionHead>

      <p className="mal__sec-note">
        <Tag variant="neutral" size="small">
          Bare for dem som takket ja
        </Tag>
        Tallene her gjelder påminnelsen. De endres derfor ikke når du velger
        «Ikke svart» i filteret.
      </p>

      <div className="mal__two">
        {/* levering + adopsjon + guardrail */}
        <div className="mal__mini">
          <h3 className="mal__mini-h">Levering og adopsjon</h3>
          <p className="mal__mini-lede">
            Av forløp som trengte et varsel — ble det levert, og ble det brukt?
          </p>
          <div
            className="mal__valg"
            role="img"
            aria-label={`Varsel-levering og adopsjon: ${VARSEL_LEVERING.map((r) => `${r.label} ${r.andel} prosent`).join(", ")}.`}
          >
            {VARSEL_LEVERING.map((r) => (
              <div className="mal__levering-row" key={r.label}>
                <span className="mal__levering-lbl">{r.label}</span>
                <span className="mal__valg-track" aria-hidden="true">
                  <span
                    className={`mal__levering-fill mal__levering-fill--${r.retning}`}
                    style={{ width: `${r.andel}%` }}
                    aria-hidden="true"
                  />
                </span>
                <span className="mal__levering-val">{r.andel}%</span>
                <Tag
                  variant={r.retning === "ok" ? "success" : "warning"}
                  size="xsmall"
                  className="mal__levering-tag"
                >
                  {r.retning === "ok" ? "ok" : "lukes ut"}
                </Tag>
                {r.retning === "guard" && (
                  <span className="mal__levering-guard-note">
                    Varsler som var for sene eller dupliserte — holdt utenfor,
                    ikke talt som dult.
                  </span>
                )}
              </div>
            ))}
          </div>
          <ul className="mal__valg-notes">
            {VARSEL_LEVERING.map((r) => (
              <li key={r.label}>
                <b>{r.label}:</b> {r.merknad}
              </li>
            ))}
          </ul>
          <p className="mal__press-xref">
            Opplevd press måles i Lumi (kun pakka) og er guardrail for
            verdiktet.
          </p>
          <div className="mal__curve-explain">
            <MetricExplainer forklaring={VARSEL_LEVERING_FORKLARING} />
          </div>
        </div>

        {/* standardvalg / varsling — etikkspor */}
        <div className="mal__mini">
          <h3 className="mal__mini-h">Svar på påminnelsen</h3>
          <p className="mal__mini-lede">
            Sporer hvem som velger påminnelse (opt-in) og hvem som ikke svarer
            eller melder seg av (opt-out).
          </p>
          <div
            className="mal__valg"
            role="img"
            aria-label={`Fordeling av varselvalg: ${VARSEL_VALG.map((v) => `${v.status} ${v.andel} prosent`).join(", ")}.`}
          >
            {VARSEL_VALG.map((v) => (
              <div className="mal__valg-row" key={v.status}>
                <span className="mal__valg-lbl">{v.status}</span>
                <span className="mal__valg-track" aria-hidden="true">
                  <span
                    className="mal__valg-fill"
                    style={{ width: `${v.andel}%` }}
                    aria-hidden="true"
                  />
                </span>
                <span className="mal__valg-val">{v.andel}%</span>
              </div>
            ))}
          </div>
          <ul className="mal__valg-notes">
            {VARSEL_VALG.map((v) => (
              <li key={v.status}>
                <b>{v.status}:</b> {v.forklaring}
              </li>
            ))}
          </ul>

          <div className="mal__guardstat">
            <div>
              <b className="mal__guardstat-num">
                {VARSEL_ETIKK.pressFelt.pakke}%
              </b>
              <span>opplevd press i pakka (Lumi)</span>
            </div>
            <div>
              <b className="mal__guardstat-num">
                {VARSEL_ETIKK.pressFelt.kontroll}%
              </b>
              <span>opplevd press i kontroll</span>
            </div>
          </div>
          <ul className="mal__guard">
            {VARSEL_ETIKK.punkter.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
