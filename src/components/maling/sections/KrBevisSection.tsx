"use client";

import { Switch, ToggleGroup } from "@navikt/ds-react";
import { useState } from "react";
import {
  deltaForrigePeriode,
  erResponsSegment,
  krSerie,
  PLAN_HENDELSER,
  type PlanHendelseId,
  PURRING_ANDEL,
  pakkeForSegment,
  pakkeKurveForSegment,
  SEGMENT_LABEL,
  type Segment,
  STYRINGSTALL_FASTE,
} from "../maling-data";
import { MetricExplainer } from "./MetricExplainer";
import { SectionHead } from "./SectionHead";
import { SurvivalKurve } from "./SurvivalKurve";

export function KrBevisSection({
  segment,
  periode,
}: {
  segment: Segment;
  periode: number;
}) {
  const [valgtHendelseId, setValgtHendelseId] =
    useState<PlanHendelseId>("opprettet");
  const [visOptInSplitt, setVisOptInSplitt] = useState(false);

  const pakkeLabel =
    segment === "alle" ? "Tiltakspakke samlet" : SEGMENT_LABEL[segment];

  // KPI-listene: KR1 fra valgt hendelse (for kontekst), men compare-kortene
  // bruker PLAN_HENDELSER[0] for KR1 + STYRINGSTALL_FASTE for KR2/KR3
  const kr1Styringstall = PLAN_HENDELSER[0].styringstall;
  const alleKpier = [kr1Styringstall, ...STYRINGSTALL_FASTE];

  // Hendelse-velger
  const valgtHendelse =
    PLAN_HENDELSER.find((h) => h.id === valgtHendelseId) ?? PLAN_HENDELSER[0];

  const pakkeKurve = pakkeKurveForSegment(valgtHendelse.id, segment);
  const kontrollKurve = valgtHendelse.kurve.kontroll;

  // Binær frist-callout for uke 4 (index 3 i TID_TIL_PLAN_UKER = uke 4)
  const pakkeVedFrist = pakkeKurve[3];
  const kontrollVedFrist = kontrollKurve[3];
  const fristDelta = pakkeVedFrist - kontrollVedFrist;

  return (
    <section className="mal__sec" id="kr-bevis" aria-labelledby="kr-bevis-h">
      <SectionHead
        num={1}
        headingId="kr-bevis-h"
        title="Kommer planene i gang i tide?"
      >
        Sammenlign tiltakspakka mot kontroll per KR. Velg hendelse for å se
        forløpet over tid.
      </SectionHead>

      {/* KPI compare-kort */}
      <div className="mal__kpis">
        {alleKpier.map((s) => {
          const pakkeVerdi = pakkeForSegment(s.metrikk, segment);
          const delta = pakkeVerdi - s.metrikk.kontroll;
          const visRespons = erResponsSegment(segment);
          const pd = deltaForrigePeriode(krSerie(s.id), periode);

          return (
            <article
              className={`mal__kpi ${visRespons ? "mal__kpi--filtered" : ""}`}
              key={s.id}
            >
              <span className="mal__kpi-sub">{s.kr}</span>
              <span className="mal__kpi-label">{s.tittel}</span>

              <div
                className="mal__cmp"
                role="img"
                aria-label={`${s.tittel}: ${pakkeLabel} ${pakkeVerdi} prosent mot kontroll ${s.metrikk.kontroll} prosent, forskjell ${delta >= 0 ? "pluss" : "minus"} ${Math.abs(delta)} prosentpoeng.`}
              >
                <div className="mal__cmp-row">
                  <span className="mal__cmp-name">{pakkeLabel}</span>
                  <span className="mal__cmp-track">
                    <span
                      className="mal__cmp-fill mal__cmp-fill--pakke"
                      style={{ width: `${pakkeVerdi}%` }}
                      aria-hidden="true"
                    />
                  </span>
                  <b className="mal__cmp-val">{pakkeVerdi}%</b>
                </div>
                <div className="mal__cmp-row">
                  <span className="mal__cmp-name">Kontroll</span>
                  <span className="mal__cmp-track">
                    <span
                      className="mal__cmp-fill mal__cmp-fill--kontroll"
                      style={{ width: `${s.metrikk.kontroll}%` }}
                      aria-hidden="true"
                    />
                  </span>
                  <b className="mal__cmp-val">{s.metrikk.kontroll}%</b>
                </div>
              </div>

              <span className="mal__kpi-delta">
                <span className="mal__kpi-delta-lbl">vs. kontroll</span>{" "}
                {delta >= 0 ? "+" : ""}
                {delta} pp
              </span>

              <span className="mal__kpi-trend-chip">
                vs. forrige uke {pd >= 0 ? "▲" : "▼"} {Math.abs(pd)}
              </span>

              {s.id === "kr3" && (
                <span className="mal__kpi-sekundar">
                  Får purring: {pakkeLabel.toLowerCase()}{" "}
                  <b>{pakkeForSegment(PURRING_ANDEL, segment)}%</b> vs. kontroll{" "}
                  <b>{PURRING_ANDEL.kontroll}%</b> (lavere er bedre)
                </span>
              )}

              <MetricExplainer forklaring={s.forklaring} />
            </article>
          );
        })}
      </div>

      {/* Hendelse-velger + kurve-panel */}
      <div className="mal__panel mal__panel--curve">
        <div className="mal__sec-head mal__sec-head--inner">
          <div>
            <h3 className="mal__h3" id="mal-curve-h">
              Forløp over tid: velg hendelse
            </h3>
            <p className="mal__sec-sub">
              Kumulativ andel der hendelsen har skjedd, uke for uke. Pakke
              følger filteret ({SEGMENT_LABEL[segment]}); kontroll er fast
              referanse.
            </p>
          </div>
        </div>

        {/* Hendelse-velger */}
        <div className="mal__event-selector">
          <ToggleGroup
            value={valgtHendelseId}
            onChange={(v) => setValgtHendelseId(v as PlanHendelseId)}
            size="small"
            aria-label="Velg plan-hendelse"
          >
            {PLAN_HENDELSER.map((h) => (
              <ToggleGroup.Item key={h.id} value={h.id}>
                {h.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </div>

        {/* Binær frist-callout */}
        <p className="mal__frist-callout">
          <b>Ved uke 4-frist:</b> {pakkeLabel}{" "}
          <b>
            {pakkeVedFrist}% ({fristDelta >= 0 ? "+" : ""}
            {fristDelta} prosentpoeng)
          </b>{" "}
          vs. kontroll <b>{kontrollVedFrist}%</b>
        </p>

        {/* Opt-in-splitt toggle */}
        <div className="mal__split-toggle">
          <Switch
            size="small"
            checked={visOptInSplitt}
            onChange={(e) => setVisOptInSplitt(e.target.checked)}
          >
            Del opp i «takket ja» og «ikke svart»
          </Switch>
        </div>

        {/* Survival curve */}
        <SurvivalKurve
          pakkeKurve={pakkeKurve}
          kontrollKurve={kontrollKurve}
          pakkeLabel={pakkeLabel}
          kortLabel={valgtHendelse.kortLabel}
          visOptInSplitt={visOptInSplitt}
          takketJaKurve={valgtHendelse.kurve.pakke["takket-ja"]}
          ikkeSvartKurve={valgtHendelse.kurve.pakke["ikke-svart"]}
        />

        <div className="mal__curve-explain">
          <MetricExplainer forklaring={valgtHendelse.forklaring} />
        </div>
      </div>
    </section>
  );
}
