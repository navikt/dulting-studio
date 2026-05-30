// Brukerreise — presentasjonsmodus: full-skjerm scrollytelling (kinematisk).
"use client";

import {
  ArrowRightIcon,
  CheckmarkCircleIcon,
  XMarkIcon,
} from "@navikt/aksel-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { DultRefTag } from "@/components/DultRefTag";
import { isRegisteredDultId } from "@/lib/dult-reference-registry";
import { PhaseIcon } from "./icons";
import type { JourneyData } from "./journey-data";
import { NudgeCard } from "./NudgeCard";
import { screenFor } from "./ScreenMock";

export function BrukerreisePresentasjon({ data }: { data: JourneyData }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pathname = usePathname();
  const { contrast, mission, overordnetMaal, persona, phases } = data;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reveals = root.querySelectorAll<HTMLElement>(".brC__reveal");
    const revealObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("in");
        }
      },
      { threshold: 0.25 },
    );
    for (const el of reveals) revealObs.observe(el);

    const sections = root.querySelectorAll<HTMLElement>("[data-phase-index]");
    const activeObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number(
              (e.target as HTMLElement).dataset.phaseIndex ?? "0",
            );
            setActive(idx);
          }
        }
      },
      { threshold: 0.5 },
    );
    for (const el of sections) activeObs.observe(el);

    return () => {
      revealObs.disconnect();
      activeObs.disconnect();
    };
  }, []);

  return (
    <div className="br-proto brC" ref={rootRef}>
      <Link
        className="brC__close"
        href={pathname}
        scroll={false}
        aria-label="Lukk presentasjon"
      >
        <XMarkIcon aria-hidden fontSize="0.9rem" /> Lukk
      </Link>
      <nav className="brC__progress" aria-label="Faser">
        {phases.map((p, i) => (
          <a
            key={p.id}
            href={`#c-${p.id}`}
            className={i === active ? "on" : ""}
            aria-current={i === active ? "true" : undefined}
            title={p.title}
          >
            <span className="br-vh">{`${p.n} ${p.title}`}</span>
          </a>
        ))}
      </nav>

      <header className="brC__hero br-bleed">
        <div className="brC__track">{mission.track}</div>
        <h1 className="brC__title">{mission.title}</h1>
        <p className="brC__lead">{mission.lead}</p>
        <div className="brC__scrollcue">SCROLL FOR Å SE REISEN ↓</div>
      </header>

      {phases.map((p, i) => (
        <Fragment key={p.id}>
          <section
            id={`c-${p.id}`}
            className="brC__phase br-bleed"
            data-phase-index={i}
          >
            <div className="brC__phaseleft brC__reveal">
              <div className="brC__bignum br-num">{p.n}</div>
              <div className="brC__phasetime br-num">
                {p.time} · {p.date}
              </div>
              <h2 className="brC__phasetitle">{p.title}</h2>
              <p className="brC__phaselead">{p.actorGoal}</p>
              <div className="brC__today">
                <span className="brC__tag brC__tag--barr">
                  Barriere · {p.barriere.kategori}
                </span>
                <span className="lbl">Faktisk i dag</span>
                <p>{p.today.text}</p>
                <p className="brC__ideal">{p.lawIdeal}</p>
              </div>
            </div>
            <div className="brC__phaseright brC__reveal">
              <span className="brC__tag brC__tag--motiv">
                Spiller på · {p.motivasjon.driver}
              </span>
              {screenFor(p.id) ?? (
                <NudgeCard nudge={p.dult.nudge} time={p.time} />
              )}
              <p className="brA__behav" style={{ marginTop: "0.9rem" }}>
                <PhaseIcon icon={p.icon} fontSize="1rem" />
                {p.dult.desiredBehavior}
              </p>
              {p.consideration && (
                <p className="brC__consideration">
                  <b>Avveining:</b> {p.consideration}
                </p>
              )}
              <div className="brA__refs" style={{ marginTop: "0.6rem" }}>
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
            </div>
          </section>

          {/* the wall: today's 3-week silence, full-bleed dark beat */}
          {p.id === "sykmelding" && (
            <section className="brC__wall br-bleed" aria-label="Stillhet i dag">
              <div className="brC__wallnum br-num brC__reveal">
                {contrast.silenceWeeks} uker
              </div>
              <div className="brC__wallcap brC__reveal">
                Her stopper det opp
              </div>
              <p className="brC__wallsub brC__reveal">
                I dag er det stille fra sykmelding til fristen nærmer seg. Andre
                Nav-varsler kommer, men ingen påminnelse om oppfølging. Det er
                her dulting gjør størst forskjell.
              </p>
            </section>
          )}
        </Fragment>
      ))}

      <section className="brC__closer br-bleed">
        <h2>Slik kan dulting endre flyten</h2>
        <div className="brC__closerstats">
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
              <CheckmarkCircleIcon aria-hidden />
            </b>
            <span>plan i gang før frist</span>
          </div>
        </div>
        <p className="brC__goals">{overordnetMaal.oppdrag}</p>
        <p className="brC__goals brC__goals--dm1">
          {overordnetMaal.dialogmote1Note}
        </p>
        <p
          style={{
            color: "#b9cbe6",
            display: "inline-flex",
            gap: "0.4rem",
            alignItems: "center",
          }}
        >
          {persona.note}
        </p>
        <Link
          className="br-nudge__cta"
          href={pathname}
          scroll={false}
          style={{
            background: "#2176d4",
            marginTop: "0.5rem",
            textDecoration: "none",
          }}
        >
          Se tiltakene bak reisen
          <ArrowRightIcon aria-hidden fontSize="0.9rem" />
        </Link>
      </section>
    </div>
  );
}
