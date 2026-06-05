import { Tag } from "@navikt/ds-react";
import { LANG_HORISONT } from "../maling-data";
import { SectionHead } from "./SectionHead";

/**
 * Lang horisont: bekreftende, ikke et runde-1-løfte. Gradert som andel forløp
 * med minst én gradering + tid til første gradering. Fraværslengde er låst til
 * fag/DS godkjenner forløpsdefinisjonen.
 */
export function LangHorisontSection() {
  const { gradertAndel, tidTilGradering, fraværslengde } = LANG_HORISONT;
  const kort = [gradertAndel, tidTilGradering, fraværslengde];

  return (
    <section className="mal__sec" aria-labelledby="mal-lang-h">
      <SectionHead
        num={6}
        headingId="mal-lang-h"
        title="Lang horisont — bekreftende"
      >
        Dette er viktige sluttmål, men de kommer senere og må defineres av fag
        og Data Science før vi bruker dem som fasit.
      </SectionHead>

      <div className="mal__ripple">
        {kort.map((k) => {
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
              {venter ? (
                <div className="mal__ripple-locked">
                  <Tag variant="warning" size="small">
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
      <p className="mal__gapnote">
        Gradering trianguleres mot Lumi «fant tilrettelegging som funket».
        Fraværslengde vises først når forløpsdefinisjonen er faggodkjent — den
        er bevisst låst til da.
      </p>
    </section>
  );
}
