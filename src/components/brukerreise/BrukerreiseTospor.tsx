// Brukerreise for nærmeste leder — tospor (arbeidsverktøy): «I dag» mot «Med dulting».
"use client";

import {
  ArrowRightIcon,
  CheckmarkCircleIcon,
  ExclamationmarkTriangleIcon,
} from "@navikt/aksel-icons";
import Link from "next/link";
import { KategoriDialog } from "@/components/KategoriDialog";
import { TiltakRefTag } from "@/components/TiltakRefTag";
import { PhaseIcon } from "./icons";
import type { JourneyData } from "./journey-data";
import { NudgeCard } from "./NudgeCard";

export function BrukerreiseTospor({ data }: { data: JourneyData }) {
  const { mission, overordnetMaal, persona, phases, contrast } = data;

  return (
    <div className="br-proto">
      <div className="brA">
        <header className="brA__hero">
          <div className="brA__track">{mission.track}</div>
          <h1 className="brA__title">{mission.title}</h1>
          <p className="brA__lead">{mission.lead}</p>
          <p
            className="br-eyebrow"
            style={{
              marginTop: "0.6rem",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {persona.note}
          </p>

          <section className="brA__goals" aria-label="Mål bak reisen">
            <span className="br-eyebrow">{overordnetMaal.eyebrow}</span>
            <p className="brA__goals-oppdrag">{overordnetMaal.oppdrag}</p>
            <div className="brA__goals-kr">
              {overordnetMaal.kr.map((k) => (
                <span key={k} className="brA__krchip">
                  {k}
                </span>
              ))}
            </div>
            <p className="brA__goals-dm1">{overordnetMaal.dialogmote1Note}</p>
          </section>

          <aside className="brA__legend" aria-label="Slik leser du reisen">
            <span className="brA__legend-title">Slik leser du reisen</span>
            <ul>
              <li>
                <span
                  className="brA__legend-key brA__legend-key--barr"
                  aria-hidden
                />
                Barriere i dag
              </li>
              <li>
                <span
                  className="brA__legend-key brA__legend-key--motiv"
                  aria-hidden
                />
                Driver vi spiller på
              </li>
              <li>
                <span
                  className="brA__legend-key brA__legend-key--silence"
                  aria-hidden
                />
                Stillhet / dødsone
              </li>
              <li>
                <span
                  className="brA__legend-key brA__legend-key--nudge"
                  aria-hidden
                />
                Dultet — varsel/oppgave
              </li>
            </ul>
            <p className="brA__legend-track">
              Hvert steg: <b>I dag</b> mot <b>Med dulting</b>
            </p>
          </aside>
        </header>

        <div className="brA__cols" aria-hidden>
          <div />
          <div className="brA__colgroup">
            <div className="brA__colhead brA__colhead--now">
              <span className="dot" /> I dag
            </div>
            <div className="brA__colhead brA__colhead--dult">
              <span className="dot" /> Med dulting
            </div>
          </div>
        </div>

        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {phases.map((p, i) => (
            <li
              key={p.id}
              className="brA__row"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="brA__time">
                <div className="n br-num">{p.n}</div>
                <div className="t">{p.time}</div>
                <div className="d br-num">{p.date}</div>
              </div>

              <div className="brA__main">
                <div className="brA__rowtitle">
                  <span className="brA__icon">
                    <PhaseIcon icon={p.icon} fontSize="1.1rem" />
                  </span>
                  <h2>{p.title}</h2>
                  {p.scope === "first-track" && (
                    <span className="brA__firstflag">Første spor</span>
                  )}
                  {p.sharedWithAg && (
                    <span className="brA__sharedflag">↔ {p.sharedWithAg}</span>
                  )}
                  {p.underAvklaring && (
                    <span className="brA__avklaringflag">
                      <ExclamationmarkTriangleIcon
                        aria-hidden
                        fontSize="0.85rem"
                      />
                      {p.underAvklaring}
                    </span>
                  )}
                </div>

                <div className="brA__panels">
                  <section
                    className="brA__panel brA__panel--now"
                    aria-label="I dag"
                  >
                    <span
                      className="brA__panellabel brA__panellabel--now"
                      aria-hidden
                    >
                      I dag
                    </span>
                    <KategoriDialog
                      navn={p.barriere.kategori}
                      kind="barriere"
                      className="brA__tag brA__tag--barr brA__tag--btn"
                    >
                      Barriere · {p.barriere.kategori}
                    </KategoriDialog>
                    <p className="lead">{p.today.text}</p>
                    <p className="sub">{p.today.barrier}</p>
                    {p.today.silence && (
                      <div className="brA__silence">
                        <b>
                          <span aria-hidden="true">🔇 </span>
                          {p.today.silence.label}
                        </b>
                        <span>{p.today.silence.detail}</span>
                      </div>
                    )}
                    <p className="brA__ideal">{p.lawIdeal}</p>
                  </section>

                  <section
                    className="brA__panel brA__panel--dult"
                    aria-label="Med dulting"
                  >
                    <span
                      className="brA__panellabel brA__panellabel--dult"
                      aria-hidden
                    >
                      Med dulting
                    </span>
                    <KategoriDialog
                      navn={p.motivasjon.driver}
                      kind="driver"
                      className="brA__tag brA__tag--motiv brA__tag--btn"
                    >
                      Spiller på · {p.motivasjon.driver}
                    </KategoriDialog>
                    <p className="lead" style={{ fontWeight: 600 }}>
                      {p.dult.intervention}
                    </p>
                    <div style={{ margin: "0.7rem 0 0.2rem" }}>
                      <NudgeCard nudge={p.dult.nudge} time={p.time} />
                    </div>
                    <p className="brA__behav">
                      <ArrowRightIcon aria-hidden fontSize="1rem" />
                      {p.dult.desiredBehavior}
                    </p>
                    <div className="brA__refs">
                      {p.dult.refs.map((r) => {
                        // Bearbeidet tiltak (T/ST) → klikkbart, med råkortene inni.
                        if (/^(ST|T)\d+$/.test(r))
                          return <TiltakRefTag key={r} id={r} />;
                        // Råkort (DULT-/SYK-) vises nå inne i tiltak-dialogen, ikke løst.
                        if (/^(AG|SYK)-/.test(r)) return null;
                        // Øvrige kilde-pekere (f.eks. «Målmodell H2») beholdes som tekst.
                        return (
                          <span key={r} className="br-ref">
                            {r}
                          </span>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {p.consideration && (
                  <div className="brA__avveining">
                    <ExclamationmarkTriangleIcon aria-hidden fontSize="1rem" />
                    <span>
                      <b>Avveining</b> {p.consideration}
                    </span>
                  </div>
                )}

                <dl className="brA__metarow">
                  <div className="br-meta brA__meta--measure">
                    <dt>Måletegn</dt>
                    <dd>
                      <ul className="brA__measures">
                        {p.measurements.primary.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                      {p.measurements.proxy &&
                        p.measurements.proxy.length > 0 && (
                          <p className="brA__measures-proxy">
                            <span className="brA__measures-proxy-label">
                              Støttemål
                            </span>
                            {p.measurements.proxy.join(" · ")}
                          </p>
                        )}
                    </dd>
                  </div>
                  <div className="br-meta">
                    <dt>Guardrail</dt>
                    <dd>{p.guardrail}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>

        <section
          className="brA__summary"
          aria-label="Slik endrer dulting flyten"
        >
          <h2 className="brA__summary-title">Slik endrer dulting flyten</h2>
          <div className="brA__summarystats">
            <div>
              <b className="br-num">
                {contrast.todayTouchpoints} → {contrast.dultTouchpoints}
              </b>
              <span>kontaktpunkter → tidsriktige dult</span>
            </div>
            <div>
              <b className="br-num">{contrast.silenceWeeks} → 0</b>
              <span>uker stillhet</span>
            </div>
            <div>
              <b>
                <CheckmarkCircleIcon aria-hidden fontSize="1.6rem" />
              </b>
              <span>plan i gang før frist</span>
            </div>
          </div>
          <Link className="brA__summary-cta" href="/brukerreise/sammen">
            Se begge spor side om side
            <ArrowRightIcon aria-hidden fontSize="0.9rem" />
          </Link>
        </section>
      </div>
    </div>
  );
}
