// Brukerreise — presentasjonsmodus: full-skjerm scrollytelling (kinematisk).
"use client";

import {
  ArrowRightIcon,
  CheckmarkCircleIcon,
  ExclamationmarkTriangleIcon,
  XMarkIcon,
} from "@navikt/aksel-icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { KategoriDialog } from "@/components/KategoriDialog";
import { TiltakRefTag } from "@/components/TiltakRefTag";
import { DultBeats } from "./DultBeats";
import { PhaseIcon } from "./icons";
import type { JourneyData } from "./journey-data";
import { screenFor } from "./ScreenMock";

export function BrukerreisePresentasjon({ data }: { data: JourneyData }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { contrast, mission, overordnetMaal, persona, phases } = data;

  // a11y: full-skjerm-overlayet er en modal (role="dialog" + aria-modal). Gjør
  // appen bak inert, flytt fokus inn ved åpning, hold Tab innenfor (fokus-felle),
  // la Escape lukke, og gjenopprett fokus til det som var aktivt før.
  useEffect(() => {
    const root = rootRef.current;
    const header = document.querySelector(".app-header");
    const previouslyFocused = document.activeElement as HTMLElement | null;

    header?.setAttribute("inert", "");
    root?.focus();

    const focusablesIn = (el: HTMLElement) =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((n) => n.getClientRects().length > 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push(pathname, { scroll: false });
        return;
      }
      if (e.key !== "Tab" || !root) return;
      const f = focusablesIn(root);
      if (f.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = f[0];
      const last = f[f.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !root.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      header?.removeAttribute("inert");
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [router, pathname]);

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
    <div
      className="br-proto brC"
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${mission.title} — presentasjon`}
    >
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
              {p.underAvklaring && (
                <span className="brA__avklaringflag">
                  <ExclamationmarkTriangleIcon aria-hidden fontSize="0.85rem" />
                  {p.underAvklaring}
                </span>
              )}
              <p className="brC__phaselead">{p.actorGoal}</p>
              <div className="brC__today">
                <KategoriDialog
                  navn={p.barriere.kategori}
                  kind="barriere"
                  className="brC__tag brC__tag--barr brC__tag--btn"
                >
                  Barriere · {p.barriere.kategori}
                </KategoriDialog>
                <span className="lbl">Faktisk i dag</span>
                <p>{p.today.text}</p>
                <p className="brC__ideal">{p.lawIdeal}</p>
              </div>
            </div>
            <div className="brC__phaseright brC__reveal">
              <KategoriDialog
                navn={p.motivasjon.driver}
                kind="driver"
                className="brC__tag brC__tag--motiv brC__tag--btn"
              >
                Spiller på · {p.motivasjon.driver}
              </KategoriDialog>
              {(p.screenId ? screenFor(p.screenId) : null) ?? (
                <DultBeats dult={p.dult} time={p.time} />
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
                {p.dult.refs.map((r) => {
                  if (/^(ST|T)\d+$/.test(r))
                    return <TiltakRefTag key={r} id={r} />;
                  if (/^(AG|SYK)-/.test(r)) return null;
                  return (
                    <span key={r} className="br-ref">
                      {r}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          {/* the wall: today's 3-week silence, full-bleed dark beat */}
          {i === 0 && (
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
          Tilbake til reisen
          <ArrowRightIcon aria-hidden fontSize="0.9rem" />
        </Link>
      </section>
    </div>
  );
}
