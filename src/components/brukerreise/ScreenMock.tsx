// Illustrative produktskjermer som vises i presentasjonsmodus.
// Aksel-pregede mockups (NAV header, Dine sykmeldte, oppfølgingsplan,
// deling) rendered inside a faux browser frame, so the story shows roughly how
// the real pages would look. Synthetic content only.
import { ArrowRightIcon, CheckmarkIcon, XMarkIcon } from "@navikt/aksel-icons";

function BrowserFrame({
  url,
  app,
  children,
}: {
  url: string;
  app: string;
  children: React.ReactNode;
}) {
  return (
    <div className="scr">
      <div className="scr__chrome">
        <span className="scr__dots">
          <i /> <i /> <i />
        </span>
        <span className="scr__url">{url}</span>
      </div>
      <div className="scr__navbar">
        <span className="scr__logo">NAV</span>
        <span className="scr__app">{app}</span>
      </div>
      <div className="scr__body">{children}</div>
    </div>
  );
}

function DineSykmeldteScreen() {
  return (
    <BrowserFrame
      url="arbeidsgiver.nav.no/dine-sykmeldte"
      app="Min side – arbeidsgiver"
    >
      <div className="scr__h">Dine sykmeldte</div>
      <ul className="scr__list">
        <li className="scr__row scr__row--active">
          <span className="scr__avatar">JB</span>
          <span className="scr__rowmain">
            <b>Jonas Berg</b>
            <span className="scr__muted">Sykmeldt 50 % · uke 3 av 4</span>
          </span>
          <span className="scr__pill scr__pill--warn">Ta stilling</span>
        </li>
      </ul>
      <div className="scr__banner">
        <div className="scr__bannerhead">Trenger Jonas en oppfølgingsplan?</div>
        <p className="scr__bannertext">
          Fristen er 3. februar. Velg ett alternativ — det tar et par minutter.
        </p>
        <div className="scr__btnrow">
          <span className="scr__btn scr__btn--primary">
            Lag oppfølgingsplan{" "}
            <ArrowRightIcon aria-hidden fontSize="0.85rem" />
          </span>
          <span className="scr__btn scr__btn--ghost">Ikke behov nå</span>
        </div>
      </div>
      <ul className="scr__list scr__list--muted">
        <li className="scr__row">
          <span className="scr__avatar">SK</span>
          <span className="scr__rowmain">
            <b>Sara K.</b>
            <span className="scr__muted">Sykmeldt 100 % · uke 1</span>
          </span>
        </li>
      </ul>
    </BrowserFrame>
  );
}

function OppfolgingsplanScreen() {
  return (
    <BrowserFrame
      url="arbeidsgiver.nav.no/oppfolgingsplan"
      app="Oppfølgingsplan"
    >
      <div className="scr__steps">
        <span className="scr__step scr__step--on">1 Kartlegging</span>
        <span className="scr__step">2 Tiltak</span>
        <span className="scr__step">3 Oppsummering</span>
      </div>
      <div className="scr__h">Hva fungerer i jobben nå?</div>
      <div className="scr__field">
        <span className="scr__line" style={{ width: "92%" }} />
        <span className="scr__line" style={{ width: "70%" }} />
      </div>
      <div className="scr__label">Hva er vanskelig?</div>
      <div className="scr__field">
        <span className="scr__line" style={{ width: "85%" }} />
      </div>
      <div className="scr__label">Hva kan vi prøve?</div>
      <div className="scr__field">
        <span className="scr__line" style={{ width: "78%" }} />
        <span className="scr__line" style={{ width: "55%" }} />
      </div>
      <div className="scr__btnrow">
        <span className="scr__btn scr__btn--primary">
          Lagre og fortsett <ArrowRightIcon aria-hidden fontSize="0.85rem" />
        </span>
      </div>
    </BrowserFrame>
  );
}

function DelScreen() {
  return (
    <BrowserFrame
      url="arbeidsgiver.nav.no/oppfolgingsplan/del"
      app="Oppfølgingsplan"
    >
      <div className="scr__h">Del planen med fastlegen</div>
      <p className="scr__bannertext" style={{ margin: "0 0 0.8rem" }}>
        Velg hva som er nyttig for legen å vite. Du bestemmer.
      </p>
      <ul className="scr__check">
        <li>
          <span className="scr__cb scr__cb--on">
            <CheckmarkIcon aria-hidden fontSize="0.8rem" />
          </span>
          Arbeidsoppgaver og tilrettelegging
        </li>
        <li>
          <span className="scr__cb scr__cb--on">
            <CheckmarkIcon aria-hidden fontSize="0.8rem" />
          </span>
          Hva som er prøvd så langt
        </li>
        <li className="scr__check--off">
          <span className="scr__cb">
            <XMarkIcon aria-hidden fontSize="0.8rem" />
          </span>
          Diagnose og private forhold — deles ikke
        </li>
      </ul>
      <div className="scr__btnrow">
        <span className="scr__btn scr__btn--primary">Del med fastlegen</span>
      </div>
    </BrowserFrame>
  );
}

const screens: Record<string, () => React.ReactNode> = {
  behovsvurdering: DineSykmeldteScreen,
  "samtale-plan": OppfolgingsplanScreen,
  deling: DelScreen,
};

/** Returns a screen mock for the phase id, or null to fall back to the nudge card. */
export function screenFor(id: string): React.ReactNode | null {
  const Screen = screens[id];
  return Screen ? <Screen /> : null;
}
