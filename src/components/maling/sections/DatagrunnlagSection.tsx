import { Tag } from "@navikt/ds-react";
import { DATAGRUNNLAG } from "../maling-data";
import { SectionHead } from "./SectionHead";

/**
 * Datagrunnlag og aggregatkontrakt. Studio konsumerer godkjente aggregater fra
 * datamarkedsplassen — aldri rådata eller persondata. Beskriver minste
 * celletall, suppresjon, usikkerhet og definisjonsversjon.
 */
export function DatagrunnlagSection() {
  return (
    <section className="mal__sec" aria-labelledby="mal-data-h">
      <SectionHead
        num={7}
        headingId="mal-data-h"
        title="Datagrunnlag og aggregatkontrakt"
      >
        Hvor tallene kommer fra, og hvilke regler de leveres under.
      </SectionHead>

      <div className="mal__panel">
        <div className="mal__datatop">
          <div className="mal__srcrow">
            <span className="mal__tag mal__tag--reg">Produkt</span>
            <span>{DATAGRUNNLAG.produkt}</span>
          </div>
          <div className="mal__srcrow">
            <span className="mal__tag mal__tag--sur">Eier</span>
            <span>{DATAGRUNNLAG.eier}</span>
          </div>
        </div>

        <p className="mal__data-rolle">
          <Tag variant="info" size="small">
            Studio = konsument
          </Tag>{" "}
          {DATAGRUNNLAG.rolleStudio}
        </p>

        <dl className="mal__contract">
          {DATAGRUNNLAG.kontrakt.map((c) => (
            <div className="mal__contract-card" key={c.tittel}>
              <dt className="mal__contract-h">{c.tittel}</dt>
              <dd>
                <b className="mal__contract-v">{c.verdi}</b>
                <span className="mal__contract-t">{c.tekst}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
