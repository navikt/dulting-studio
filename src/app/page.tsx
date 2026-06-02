import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import { Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-schibsted-lp",
  display: "swap",
});

// Guidet fortelling i kronologisk rekkefølge: først tiltakskartene (fundamentet),
// så brukerreisene (tiltakene i tid), så utvelgelsen. Sammenslått reise og
// atferdsmatrise er bevisst nedtonet som «mer å utforske». Hvert steg viser
// arbeidsgiver- og sykmeldt-sporet side om side der det henger sammen.
const steps = [
  {
    n: "01",
    kicker: "Fundamentet",
    title: "Tiltakskartene",
    text: "Råkortene fra atferdskartleggingen — slått sammen og gruppert til konkrete dulting-tiltak. Ett kart for arbeidsgiver, ett for den sykmeldte.",
    links: [
      { href: "/tiltakskart", label: "Arbeidsgivers tiltakskart" },
      { href: "/tiltakskart/sykmeldt", label: "Den sykmeldtes tiltakskart" },
    ],
  },
  {
    n: "02",
    kicker: "Tiltakene i tid",
    title: "Brukerreisene",
    text: "Tiltakene satt inn i en tidslinje — det som faktisk skjer i dag, mot flyten med små, tidsriktige dult. Hvert spor for seg, side om side.",
    links: [
      { href: "/brukerreise/leder", label: "Arbeidsgiver · nærmeste leder" },
      { href: "/brukerreise/sykmeldt", label: "Den sykmeldte" },
    ],
  },
  {
    n: "03",
    kicker: "Prioritering",
    title: "Utvelgelsen",
    text: "Slik prioriterer teamet hvilke tiltak vi tar først — vurdert etter forventet effekt og innsats.",
    links: [
      { href: "/tiltakspakke-utvelgelse", label: "Tiltakspakke-utvelgelse" },
    ],
  },
];

export default function Home() {
  return (
    <div className={`lp ${schibsted.variable}`}>
      <section className="lp__hero">
        <span className="lp__eyebrow">
          Internt · syntetisk demo · AID / IA-avtalen 2025–2028
        </span>
        <h1 className="lp__title">Dulting i sykefraværsoppfølgingen</h1>
        <p className="lp__lead">
          Et internt arbeidsverktøy for å styrke dialogen i
          sykefraværsoppfølgingen — der arbeidsgivers tilretteleggingsplikt og
          den sykmeldtes medvirkning møtes. Vi går fra tiltakskartene, via
          brukerreisene, til utvelgelsen.
        </p>
        <div className="lp__cta">
          <Button as="a" href="/tiltakskart" variant="primary">
            Start her: tiltakskartene
          </Button>
        </div>
        <p className="lp__note">
          Bevisst avgrenset demo. Alt innhold er syntetisk — ingen reelle
          personer, saker eller personopplysninger.
        </p>
      </section>

      <section className="lp__steps" aria-label="Slik henger det sammen">
        {steps.map((s) => (
          <article className="lp__step" key={s.n}>
            <span className="lp__step-num" aria-hidden>
              {s.n}
            </span>
            <div className="lp__step-body">
              <span className="lp__step-kicker">{s.kicker}</span>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
              <nav className="lp__step-links" aria-label={`Åpne ${s.title}`}>
                {s.links.map((l) => (
                  <Link className="lp__cta-link" href={l.href} key={l.href}>
                    {l.label}
                    <ArrowRightIcon aria-hidden fontSize="0.9rem" />
                  </Link>
                ))}
              </nav>
            </div>
          </article>
        ))}
      </section>

      <nav className="lp__refs" aria-label="Mer å utforske">
        <span className="lp__refs-label">Mer å utforske</span>
        <Link className="lp__cta-link" href="/brukerreise/sammen">
          Begge spor i én tidslinje
          <ArrowRightIcon aria-hidden fontSize="0.9rem" />
        </Link>
        <Link className="lp__cta-link" href="/atferdsmatrise">
          Atferdsmatrise — rådata bak kartene
          <ArrowRightIcon aria-hidden fontSize="0.9rem" />
        </Link>
      </nav>
    </div>
  );
}
