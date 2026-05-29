// Brukerreise for nærmeste leder — tospor (arbeidsverktøy): «I dag» mot «Med dulting».
"use client";

import {
  ArrowRightIcon,
  ExclamationmarkTriangleIcon,
} from "@navikt/aksel-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DultRefTag } from "@/components/DultRefTag";
import { isRegisteredDultId } from "@/lib/dult-reference-registry";
import { PhaseIcon } from "./icons";
import {
  contrast,
  mission,
  overordnetMaal,
  persona,
  phases,
} from "./journey-data";
import { NudgeCard } from "./NudgeCard";

export function BrukerreiseTospor() {
  const pathname = usePathname();

  return (
    <div className="br-proto">
      <div className="brA">
        <header className="brA__hero">
          <Link
            className="brA__present"
            href={`${pathname}?modus=presentasjon`}
            scroll={false}
          >
            Vis som presentasjon
            <ArrowRightIcon aria-hidden fontSize="0.9rem" />
          </Link>
          <div className="brA__track">{mission.track}</div>
          <h1 className="brA__title">{mission.title}</h1>
          <p className="brA__lead">{mission.lead}</p>

          <div className="brA__statbar">
            <div className="brA__statrow">
              <div className="brA__stat brA__stat--now">
                <b className="br-num">{contrast.todayTouchpoints}</b>
                <span>kontaktpunkter fra Nav i dag</span>
              </div>
              <div
                style={{
                  alignSelf: "center",
                  color: "var(--ink-faint)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ArrowRightIcon aria-hidden fontSize="1.4rem" />
              </div>
              <div className="brA__stat brA__stat--dult">
                <b className="br-num">{contrast.dultTouchpoints}</b>
                <span>tidsriktige dult om oppfølging</span>
              </div>
            </div>
            <p className="brA__statcaption">
              I dag er kontakten generell (sykmelding mottatt) eller sen (når
              Nav ber om plan) — sjelden et tidsriktig signal om oppfølging. Med
              dulting blir hvert steg et lite dult som gjør neste steg enkelt.
            </p>
          </div>
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
                </div>

                <div className="brA__panels">
                  <section
                    className="brA__panel brA__panel--now"
                    aria-label="I dag"
                  >
                    <span className="brA__tag brA__tag--barr">
                      Barriere · {p.barriere.kategori}
                    </span>
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
                    <span className="brA__tag brA__tag--motiv">
                      Spiller på · {p.motivasjon.driver}
                    </span>
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
                      {p.dult.refs.map((r) =>
                        isRegisteredDultId(r) ? (
                          <DultRefTag key={r} id={r} />
                        ) : (
                          <span key={r} className="br-ref">
                            {r}
                          </span>
                        ),
                      )}
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
                        {p.measurements.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
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
      </div>
    </div>
  );
}
