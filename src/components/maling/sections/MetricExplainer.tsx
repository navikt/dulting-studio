import { ReadMore } from "@navikt/ds-react";
import type { MetrikkForklaring } from "../maling-data";

/**
 * Hver viktig metrikk forklarer seg selv: kort definisjon synlig, dypere
 * forklaring bak en ReadMore (tilgjengelig disclosure). Dekker KR-kobling,
 * datakilde, tidsvindu, segmenter, tolkning, usikkerhet og guardrail.
 */
export function MetricExplainer({
  forklaring,
}: {
  forklaring: MetrikkForklaring;
}) {
  const rader: { k: string; v: string }[] = [
    { k: "KR-kobling", v: forklaring.krKobling },
    { k: "Datakilde", v: forklaring.datakilde },
    { k: "Tidsvindu", v: forklaring.tidsvindu },
    { k: "Segmenter", v: forklaring.segmenter },
    { k: "Tolkning", v: forklaring.tolkning },
    { k: "Usikkerhet", v: forklaring.usikkerhet },
  ];
  if (forklaring.guardrail) {
    rader.push({ k: "Guardrail", v: forklaring.guardrail });
  }

  return (
    <div className="mal__explain">
      <p className="mal__explain-def">{forklaring.definisjon}</p>
      <ReadMore header="Slik er målet definert" size="small">
        <dl className="mal__explain-dl">
          {rader.map((r) => (
            <div className="mal__explain-row" key={r.k}>
              <dt>{r.k}</dt>
              <dd>{r.v}</dd>
            </div>
          ))}
        </dl>
      </ReadMore>
    </div>
  );
}
