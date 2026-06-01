import {
  CheckmarkCircleIcon,
  ExclamationmarkTriangleIcon,
} from "@navikt/aksel-icons";
import {
  type Aktor,
  aktorLabel,
  effektLabels,
  innsatsLabels,
  type Niva,
  type SelectionTiltak,
  tiltakAt,
} from "@/lib/tiltakspakke-utvelgelse-model";
import { TiltakDialog } from "../TiltakDialog";
import type { View } from "./usePakkeTiltak";

const EFFEKT: Niva[] = [3, 2, 1];
const INNSATS: Niva[] = [1, 2, 3];

/** «Gjør først»-sonen: høy effekt relativt til innsats (effekt − innsats ≥ 1). */
function erGjorForst(innsats: Niva, effekt: Niva) {
  return effekt - innsats >= 1;
}

function Chip({ t }: { t: SelectionTiltak }) {
  const inn = t.tier === "pakke1";
  return (
    <TiltakDialog
      id={t.id}
      ariaLabel={`Vis detaljer for ${t.id}: ${t.title}`}
      className={`tu__chip tu__chip--${t.aktor} tu__chip--${t.tier}${
        t.blokkertAv ? " tu__chip--blokkert" : ""
      } tu__chip--btn`}
    >
      {inn && <CheckmarkCircleIcon aria-hidden className="tu__chip-ic" />}
      {t.blokkertAv && (
        <ExclamationmarkTriangleIcon aria-hidden className="tu__chip-ic" />
      )}
      <b>{t.id}</b> {t.title}
    </TiltakDialog>
  );
}

/**
 * Valgfri effekt×innsats-matrise (skjult som standard). Viser hvordan pakka
 * klynger seg i «gjør først»-hjørnet. Fikset fargesemantikk: medlemskap = fyll
 * + hak (aktørfarge), «gjør først» = nøytral stiplet sone (ikke grønn).
 */
export function MatriseView({
  tiltak,
  view,
}: {
  tiltak: SelectionTiltak[];
  view: View;
}) {
  const aktorFilter: Aktor | undefined = view === "begge" ? undefined : view;
  return (
    <section
      className="tu-scroll"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scroll-container må kunne fokuseres for tastatur-scroll
      tabIndex={0}
      aria-label="Effekt × innsats-matrise — bla horisontalt ved behov"
    >
      <table className="tu-matrix">
        <caption className="tu-matrix__caption">
          Effekt (rad) mot innsats (kolonne) for{" "}
          {view === "begge" ? "begge spor" : aktorLabel[view].toLowerCase()}.
          Fyll + hak = i pakke 1. Stiplet sone = «gjør først» (høy effekt, lav
          innsats).
        </caption>
        <thead>
          <tr>
            <td className="tu-matrix__corner" aria-hidden />
            {INNSATS.map((i) => (
              <th key={i} scope="col" className="tu-matrix__colhead">
                {innsatsLabels[i]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {EFFEKT.map((e) => (
            <tr key={e}>
              <th scope="row" className="tu-matrix__rowhead">
                {effektLabels[e]}
              </th>
              {INNSATS.map((i) => {
                const cell = tiltakAt(i, e, aktorFilter, tiltak);
                return (
                  <td
                    key={i}
                    className={`tu-matrix__cell${
                      erGjorForst(i, e) ? " tu-matrix__cell--first" : ""
                    }`}
                  >
                    {erGjorForst(i, e) && cell.length === 0 && (
                      <span className="tu-matrix__zone">Gjør først</span>
                    )}
                    {cell.map((t) => (
                      <Chip key={t.id} t={t} />
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
