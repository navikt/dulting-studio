import {
  type KrId,
  krKort,
  krLabels,
  krMerknad,
  type SelectionTiltak,
} from "@/lib/tiltakspakke-utvelgelse-model";

const KR_ORDER: KrId[] = ["KR1", "KR2", "KR3", "KR4", "KR5"];

/**
 * Live måldekning øverst: treffer pakke 1 de overordnede målene? KR-ene i
 * klartekst (ikke «KR2»), med status som oppdateres når tiltak flyttes inn/ut.
 */
export function MaldekningStrip({
  dekning,
}: {
  dekning: Record<KrId, SelectionTiltak[]>;
}) {
  return (
    <div className="pb-maldekning">
      <span className="pb-maldekning__lab">Mål pakke 1 treffer:</span>
      <span className="pb-maldekning__chips">
        {KR_ORDER.map((kr) => {
          const tiltak = dekning[kr];
          const iPakke = tiltak.filter((t) => t.tier === "pakke1").length;
          const status = iPakke > 0 ? "ok" : tiltak.length > 0 ? "gap" : "none";
          const tekst =
            status === "ok"
              ? "✓"
              : krMerknad[kr]
                ? "— bevisst senere"
                : status === "gap"
                  ? "— utenfor pakke 1"
                  : "— ikke dekket";
          return (
            <span
              key={kr}
              className={`pb-kr pb-kr--${status}`}
              title={krLabels[kr]}
            >
              {krKort[kr]} {tekst}
            </span>
          );
        })}
      </span>
    </div>
  );
}
