// Split-view: arbeidsgiver- og sykmeldt-reisen side om side rundt én felles
// tidslinje — «ett touchpoint, to sider». Additiv visning; gjenbruker de to
// eksisterende datagrunnlagene (lederJourney + sykmeldtJourney) og NudgeCard.
// De to reisene er bygd AG-parallelt (6 steg, samme uker), så de zippes på indeks.
import {
  ArrowRightIcon,
  ExclamationmarkTriangleIcon,
} from "@navikt/aksel-icons";
import { Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import { lederJourney } from "./journey-data";
import { sykmeldtJourney } from "./journey-data-sykmeldt";
import { NudgeCard } from "./NudgeCard";
import "./brukerreise.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

type Moment = { title: string; coupling: string; key?: boolean };

// Det felles øyeblikket bak hvert par av steg + den toveis koblingen.
const moments: Moment[] = [
  {
    title: "Sykmeldingen kommer",
    coupling:
      "Samme hendelse, to innganger — leder i «Dine sykmeldte», Jonas på «Min side for sykmeldte».",
  },
  {
    title: "Tidlig signal før fristen",
    coupling:
      "I dag: stillhet for begge. Med dulting: et tidsriktig varsel til hver part — samtidig.",
  },
  {
    title: "Behovsvurdering rundt uke 4",
    coupling:
      "Svarer Jonas «ja» på egen vurdering, utløses et varsel til arbeidsgiver. Ett valg, begge parter i gang.",
    key: true,
  },
  {
    title: "Samtale og planarbeid",
    coupling:
      "Begge forberedes til samme samtale — leder med miniguide, Jonas med forberedelsesskjema.",
  },
  {
    title: "Deling med lege og Nav",
    coupling: "Planen kan deles fra begge sider — av leder eller av Jonas.",
  },
  {
    title: "Evaluering og justering",
    coupling: "Begge minnes på evalueringen, og markerer hva som virker.",
  },
];

export function BrukerreiseSammen() {
  const leder = lederJourney.phases;
  const sykmeldt = sykmeldtJourney.phases;

  return (
    <div className={`br-proto ${schibsted.variable}`}>
      <div className="brS">
        <header className="brS__hero">
          <div className="brA__track">Begge spor · oppfølging av sykmeldte</div>
          <h1 className="brS__title">Ett touchpoint, to sider</h1>
          <p className="brS__lead">
            Samme seks øyeblikk i sykefraværsoppfølgingen — sett fra nærmeste
            leder og fra den sykmeldte samtidig. Dulting på begge sider, koblet
            sammen.
          </p>
          <div className="brS__legend">
            <span className="leder">
              <i aria-hidden />
              Arbeidsgiver
            </span>
            <span className="sykmeldt">
              <i aria-hidden />
              Den sykmeldte
            </span>
          </div>
          <div className="brS__nav">
            <Link className="brS__navlink" href="/brukerreise/leder">
              Bare arbeidsgiver-reisen →
            </Link>
            <Link className="brS__navlink" href="/brukerreise/sykmeldt">
              Bare sykmeldt-reisen →
            </Link>
          </div>
        </header>

        <div className="brS__rows">
          {moments.map((moment, i) => {
            const l = leder[i];
            const s = sykmeldt[i];
            return (
              <div
                className="brS__row"
                key={moment.title}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="brS__moment">
                  <span className="brS__momentnum br-num">{i + 1}</span>
                  <span className="brS__momenttime br-num">{l.time}</span>
                  <h2 className="brS__momenttitle">{moment.title}</h2>
                  <p
                    className={`brS__coupling${
                      moment.key ? " brS__coupling--key" : ""
                    }`}
                  >
                    <b>
                      {moment.key ? "↔ Toveis kobling" : "Felles touchpoint"}
                    </b>
                    {moment.coupling}
                  </p>
                </div>

                <div className="brS__side brS__side--leder">
                  <span className="brS__sidelabel brS__sidelabel--leder">
                    Arbeidsgiver
                  </span>
                  <div className="brS__tags">
                    <span className="brA__tag brA__tag--barr">
                      Barriere · {l.barriere.kategori}
                    </span>
                    <span className="brA__tag brA__tag--motiv">
                      Spiller på · {l.motivasjon.driver}
                    </span>
                  </div>
                  <p className="brS__today">
                    <b>I dag</b> {l.today.barrier}
                  </p>
                  <NudgeCard nudge={l.dult.nudge} time={l.time} />
                  <p className="brS__behav">
                    <ArrowRightIcon aria-hidden fontSize="1rem" />
                    {l.dult.desiredBehavior}
                  </p>
                </div>

                <div className="brS__side brS__side--sykmeldt">
                  <span className="brS__sidelabel brS__sidelabel--sykmeldt">
                    Den sykmeldte
                  </span>
                  {s.underAvklaring && (
                    <span className="brA__avklaringflag brS__avklaringflag">
                      <ExclamationmarkTriangleIcon
                        aria-hidden
                        fontSize="0.8rem"
                      />
                      {s.underAvklaring}
                    </span>
                  )}
                  <div className="brS__tags">
                    <span className="brA__tag brA__tag--barr">
                      Barriere · {s.barriere.kategori}
                    </span>
                    <span className="brA__tag brA__tag--motiv">
                      Spiller på · {s.motivasjon.driver}
                    </span>
                  </div>
                  <p className="brS__today">
                    <b>I dag</b> {s.today.barrier}
                  </p>
                  <NudgeCard nudge={s.dult.nudge} time={s.time} />
                  <p className="brS__behav">
                    <ArrowRightIcon aria-hidden fontSize="1rem" />
                    {s.dult.desiredBehavior}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <section className="brS__closer">
          <h2>To roller, samme mål</h2>
          <p>
            Begge sporene lader opp til de samme målene i IA-avtalen — flere og
            tidligere oppfølgingsplaner, mer gradert sykmelding, kortere fravær.
            Dulting virker best når begge parter dultes mot det samme, samtidig.
          </p>
          <div className="brS__closerlinks">
            <Link className="brS__closerlink" href="/brukerreise/leder">
              Se hele arbeidsgiver-reisen
              <ArrowRightIcon aria-hidden fontSize="0.9rem" />
            </Link>
            <Link className="brS__closerlink" href="/brukerreise/sykmeldt">
              Se hele den sykmeldtes reise
              <ArrowRightIcon aria-hidden fontSize="0.9rem" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
