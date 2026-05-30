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

const highlights = [
  {
    n: "01",
    title: "Dagens flyt mot endret flyt",
    text: "To spor side om side: det som faktisk skjer i dag, mot flyten med små, tidsriktige dult.",
  },
  {
    n: "02",
    title: "Forankret i datagrunnlaget",
    text: "Hvert steg er koblet til reelle barrierer, motivasjonsdrivere og dulting-tiltak fra atferdskartleggingen.",
  },
  {
    n: "03",
    title: "Måletegn og guardrails",
    text: "Hva vi vil oppnå per steg — og hvor vi holder igjen for ikke å presse eller skape varseltrøtthet.",
  },
];

export default function Home() {
  return (
    <div className={`lp ${schibsted.variable}`}>
      <section className="lp__hero">
        <span className="lp__eyebrow">
          Internt · syntetisk demo · IA-avtalen 2025–2028
        </span>
        <h1 className="lp__title">Dulting i sykefraværsoppfølgingen</h1>
        <p className="lp__lead">
          Et internt arbeidsverktøy som viser hvordan små, tidsriktige dult kan
          få nærmeste leder tidligere i gang med oppfølging — fra dagens
          faktiske flyt, mot flyten med tiltak.
        </p>
        <div className="lp__cta">
          <Button as="a" href="/brukerreise/leder" variant="primary">
            Åpne brukerreisen for nærmeste leder
          </Button>
          <nav className="lp__cta-also" aria-label="Andre innganger">
            <span className="lp__cta-also-label">Eller utforsk</span>
            <Link className="lp__cta-link" href="/brukerreise/sykmeldt">
              Den sykmeldtes reise
              <ArrowRightIcon aria-hidden fontSize="0.9rem" />
            </Link>
            <Link className="lp__cta-link" href="/brukerreise/sammen">
              Begge spor side om side
              <ArrowRightIcon aria-hidden fontSize="0.9rem" />
            </Link>
            <Link
              className="lp__cta-link"
              href="/brukerreise/leder?modus=presentasjon"
            >
              Presentasjonsmodus
              <ArrowRightIcon aria-hidden fontSize="0.9rem" />
            </Link>
          </nav>
        </div>
        <p className="lp__note">
          Bevisst avgrenset demo. Alt innhold er syntetisk — ingen reelle
          personer, saker eller personopplysninger.
        </p>
      </section>

      <section className="lp__grid" aria-label="Hva brukerreisen viser">
        {highlights.map((h) => (
          <article className="lp__card" key={h.n}>
            <span className="lp__card-num">{h.n}</span>
            <h2>{h.title}</h2>
            <p>{h.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
