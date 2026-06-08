import { Tag } from "@navikt/ds-react";
import { LANG_HORISONT, type LangHorisontKort } from "../maling-data";
import { FravarsKurve } from "./FravarsKurve";
import { SectionHead } from "./SectionHead";

/**
 * Lang horisont: bekreftende, ikke et runde-1-løfte. Gradert som andel forløp
 * med minst én gradering + tid til første gradering. Fraværslengde er foreløpig
 * — forløpsdefinisjonen (v0.9) er ikke faggodkjent ennå.
 */
export function LangHorisontSection() {
  const { gradertAndel, tidTilGradering, fraværslengde } = LANG_HORISONT;
  const kompaktKort: LangHorisontKort[] = [gradertAndel, tidTilGradering];

  return (
    <section
      id="lang-horisont"
      className="mal__sec"
      aria-labelledby="mal-lang-h"
    >
      <SectionHead
        num={5}
        headingId="mal-lang-h"
        title="Bekreftes det på lang sikt?"
      >
        Dette er viktige sluttmål, men de kommer senere og må defineres av fag
        og Data Science før vi bruker dem som fasit.
      </SectionHead>

      {/* Øverste rad: to kompakte kort side om side */}
      <div className="mal__ripple mal__ripple--row">
        {kompaktKort.map((k) => {
          const venter = k.status === "venter";
          const enhetKort =
            k.enhet === "%"
              ? "%"
              : k.enhet === "uker (median)"
                ? "uker"
                : "dager";

          return (
            <div className="mal__ripple-card" key={k.tittel}>
              <span className="mal__ripple-label">{k.tittel}</span>
              <span className="mal__ripple-sub">{k.enhet}</span>

              {/* gradertAndel: operasjonalisering ikke avklart — rolig info */}
              {k === gradertAndel && (
                <Tag
                  variant="info"
                  size="xsmall"
                  className="mal__ripple-forbehold"
                  title="Vi må avklare med Nav om dette er andel eller grad-% før tallet er endelig."
                >
                  Operasjonalisering avklares med Nav
                </Tag>
              )}

              {venter ? (
                <div className="mal__ripple-locked">
                  <Tag variant="neutral" size="small">
                    Venter på faggodkjenning
                  </Tag>
                  <p className="mal__ripple-locked-txt">
                    {"venterPå" in k ? k.venterPå : ""}
                  </p>
                </div>
              ) : (
                <div
                  className="mal__ripple-vals"
                  role="img"
                  aria-label={`${k.tittel}: pakke ${k.pakke} ${enhetKort}, kontroll ${k.kontroll} ${enhetKort}.`}
                >
                  <span className="mal__ripple-pakke">
                    {k.pakke}
                    {enhetKort === "%" ? "%" : ""}
                    <i>pakke</i>
                  </span>
                  <span className="mal__ripple-vs" aria-hidden>
                    vs
                  </span>
                  <span className="mal__ripple-kontroll">
                    {k.kontroll}
                    {enhetKort === "%" ? "%" : ""}
                    <i>kontroll</i>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fraværslengde: bredere kort med median + survival-kurve */}
      <article
        className="mal__ripple-card mal__ripple-card--wide"
        aria-labelledby="fravarslengde-h"
      >
        <span className="mal__ripple-label" id="fravarslengde-h">
          {fraværslengde.tittel}
        </span>
        <span className="mal__ripple-sub">{fraværslengde.enhet}</span>

        {/* Rolig «foreløpig»-info — ikke advarsel */}
        <Tag
          variant="info"
          size="xsmall"
          className="mal__ripple-forbehold"
          title="Forløpsdefinisjonen (v0.9) er ikke faggodkjent ennå. Tallet kan endres."
        >
          Foreløpig — forløpsdef v0.9 ikke faggodkjent
        </Tag>

        {/* Median-sammenligning */}
        <div
          className="mal__ripple-vals"
          role="img"
          aria-label={`Fraværslengde: pakke ${fraværslengde.pakke} dager, kontroll ${fraværslengde.kontroll} dager (median). Lavere er bedre.`}
        >
          <span className="mal__ripple-pakke">
            {fraværslengde.pakke}
            <i>pakke · dager</i>
          </span>
          <span className="mal__ripple-vs" aria-hidden>
            vs
          </span>
          <span className="mal__ripple-kontroll">
            {fraværslengde.kontroll}
            <i>kontroll · dager</i>
          </span>
          <span className="mal__ripple-sub mal__ripple-sub--note">
            (lavere = kortere fravær)
          </span>
        </div>

        {/* Survival-kurve */}
        {fraværslengde.survivalUker &&
          fraværslengde.survivalPakke &&
          fraværslengde.survivalKontroll && (
            <div className="mal__fravars-kurve-wrap">
              <FravarsKurve
                survivalUker={fraværslengde.survivalUker}
                survivalPakke={fraværslengde.survivalPakke}
                survivalKontroll={fraværslengde.survivalKontroll}
              />
            </div>
          )}
      </article>
    </section>
  );
}
