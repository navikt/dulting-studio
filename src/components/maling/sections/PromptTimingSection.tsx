import { Tag } from "@navikt/ds-react";
import {
  PROMPT_TIMING,
  PROMPT_TIMING_FORKLARING,
  VARSEL_ETIKK,
  VARSEL_VALG,
} from "../maling-data";
import { MetricExplainer } from "./MetricExplainer";
import { SectionHead } from "./SectionHead";

/**
 * Prompt-timing og standardvalg/varsling. Viser om påminnelsen traff mens det
 * fortsatt var tid før uke 4, og behandler varselvalget som etikkspor
 * (takket ja / ikke svart, tidspunkt, kobling til tidligere plan,
 * Lumi-guardrail for press).
 *
 * Dette er et fast opt-in-/etikkspor: bare opt-in-segmentet får påminnelsen, så
 * tallene gjelder alltid opt-in og påvirkes ikke av segmentfilteret over.
 * Derfor tar seksjonen ikke imot `segment`.
 */
export function PromptTimingSection() {
  const iTide = PROMPT_TIMING.filter((b) => b.iTide).reduce(
    (sum, b) => sum + b.andel,
    0,
  );

  return (
    <section className="mal__sec" aria-labelledby="mal-timing-h">
      <SectionHead
        num={3}
        headingId="mal-timing-h"
        title="Påminnelse og timing"
      >
        Traff påminnelsen mens det fortsatt var tid til å handle?
      </SectionHead>

      <p className="mal__sec-note">
        <Tag variant="neutral" size="small">
          Bare for dem som takket ja
        </Tag>
        Tallene her gjelder påminnelsen. De endres derfor ikke når du velger
        «Ikke svart» i filteret.
      </p>

      <div className="mal__two">
        {/* prompt-timing */}
        <div className="mal__mini">
          <h3 className="mal__mini-h">Når kom påminnelsen?</h3>
          <p className="mal__mini-lede">
            <b className="mal__big">{iTide}%</b> av opt-in-segmentet fikk
            påminnelsen i tide til behovsvurdering og plan før uke 4.
          </p>
          <div
            className="mal__timing"
            role="img"
            aria-label={`Fordeling av når påminnelsen traff: ${PROMPT_TIMING.map((b) => `${b.label} ${b.andel} prosent${b.iTide ? " i tide" : " for sent"}`).join(", ")}.`}
          >
            {PROMPT_TIMING.map((b) => (
              <div className="mal__timing-row" key={b.label}>
                <span className="mal__timing-lbl">{b.label}</span>
                <span className="mal__timing-track">
                  <span
                    className={`mal__timing-fill mal__timing-fill--${b.iTide ? "ok" : "late"}`}
                    style={{ width: `${b.andel}%` }}
                  />
                </span>
                <span className="mal__timing-val">{b.andel}%</span>
                <Tag
                  variant={b.iTide ? "success" : "error"}
                  size="xsmall"
                  className="mal__timing-tag"
                >
                  {b.iTide ? "i tide" : "for sent"}
                </Tag>
              </div>
            ))}
          </div>
          <ul className="mal__timing-notes">
            {PROMPT_TIMING.map((b) => (
              <li key={b.label}>
                <b>{b.label}:</b> {b.merknad}
              </li>
            ))}
          </ul>
          <div className="mal__curve-explain">
            <MetricExplainer forklaring={PROMPT_TIMING_FORKLARING} />
          </div>
        </div>

        {/* standardvalg / varsling — etikkspor */}
        <div className="mal__mini">
          <h3 className="mal__mini-h">Svar på påminnelsen</h3>
          <div
            className="mal__valg"
            role="img"
            aria-label={`Fordeling av varselvalg: ${VARSEL_VALG.map((v) => `${v.status} ${v.andel} prosent`).join(", ")}.`}
          >
            {VARSEL_VALG.map((v) => (
              <div className="mal__valg-row" key={v.status}>
                <span className="mal__valg-lbl">{v.status}</span>
                <span className="mal__valg-track">
                  <span
                    className="mal__valg-fill"
                    style={{ width: `${v.andel}%` }}
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
