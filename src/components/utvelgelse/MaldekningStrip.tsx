import { Tag } from "@navikt/ds-react";
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
 * klartekst (ikke «KR2»). Aksel Tag — fylt/grønn når dekket, dempet ellers.
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
          const dekket = tiltak.some((t) => t.tier === "pakke1");
          const tekst = dekket
            ? `${krKort[kr]} ✓`
            : krMerknad[kr]
              ? `${krKort[kr]} — bevisst senere`
              : tiltak.length > 0
                ? `${krKort[kr]} — utenfor`
                : `${krKort[kr]} — ikke dekket`;
          return (
            <Tag
              key={kr}
              size="small"
              variant={dekket ? "moderate" : "outline"}
              data-color={dekket ? "success" : "neutral"}
              title={krLabels[kr]}
            >
              {tekst}
            </Tag>
          );
        })}
      </span>
    </div>
  );
}
