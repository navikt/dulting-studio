import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-schibsted-lp",
  display: "swap",
});

// Forsiden = aktør-gruppert hub. To likestilte spor (arbeidsgiver / den
// sykmeldte), hver med sitt tiltakskart og sin brukerreise. Under sporene
// binder «Begge spor i én tidslinje» dem sammen (selve poenget), og en
// «på tvers»-rad gir analyseverktøyene (utvelgelse, atferdsmatrise). Leser som
// en fortelling man kan presentere ovenfra og ned — og fungerer som et
// verktøys hjem der alt er ett klikk unna.
const actors = [
  {
    key: "ag",
    label: "Arbeidsgiver",
    sub: "nærmeste leder",
    desc: "Tiltakskartet og brukerreisen for den som følger opp den sykmeldte.",
    links: [
      { href: "/tiltakskart", label: "Tiltakskart" },
      { href: "/brukerreise/leder", label: "Brukerreise" },
    ],
  },
  {
    key: "sm",
    label: "Den sykmeldte",
    sub: "den ansatte",
    desc: "Tiltakskartet og brukerreisen for den som er sykmeldt.",
    links: [
      { href: "/tiltakskart/sykmeldt", label: "Tiltakskart" },
      { href: "/brukerreise/sykmeldt", label: "Brukerreise" },
    ],
  },
];

const acrossLinks = [
  {
    href: "/tiltakspakke-utvelgelse",
    label: "Utvelgelse — hvilke tiltak først",
  },
  {
    href: "/atferdsmatrise",
    label: "Atferdsmatrise — barriere × motivasjon",
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
          den sykmeldtes medvirkning møtes.
        </p>
        <p className="lp__note">
          Bevisst avgrenset demo. Alt innhold er syntetisk — ingen reelle
          personer, saker eller personopplysninger.
        </p>
      </section>

      <section className="lp__pick" aria-labelledby="lp-pick-h">
        <h2 id="lp-pick-h" className="lp__section-label">
          Velg et spor
        </h2>
        <div className="lp__actors">
          {actors.map((a) => (
            <article
              className={`lp__actor lp__actor--${a.key}`}
              key={a.key}
              aria-labelledby={`lp-actor-${a.key}`}
            >
              <span className="lp__actor-eyebrow">Spor</span>
              <h3 className="lp__actor-label" id={`lp-actor-${a.key}`}>
                {a.label}
                <span className="lp__actor-sub">{a.sub}</span>
              </h3>
              <p className="lp__actor-desc">{a.desc}</p>
              <nav
                className="lp__actor-links"
                aria-label={`${a.label} — flater`}
              >
                {a.links.map((l) => (
                  <Link className="lp__actor-link" href={l.href} key={l.href}>
                    {l.label}
                    <ArrowRightIcon aria-hidden fontSize="0.9rem" />
                  </Link>
                ))}
              </nav>
            </article>
          ))}
        </div>
      </section>

      <Link className="lp__bridge" href="/brukerreise/sammen">
        <span className="lp__bridge-text">
          <span className="lp__bridge-title">Begge spor i én tidslinje</span>
          <span className="lp__bridge-sub">
            Samme touchpoints, side om side — slik arbeidsgiver og den sykmeldte
            møtes.
          </span>
        </span>
        <ArrowRightIcon aria-hidden fontSize="1.2rem" />
      </Link>

      <nav className="lp__refs" aria-label="På tvers">
        <span className="lp__refs-label">På tvers</span>
        {acrossLinks.map((l) => (
          <Link className="lp__cta-link" href={l.href} key={l.href}>
            {l.label}
            <ArrowRightIcon aria-hidden fontSize="0.9rem" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
