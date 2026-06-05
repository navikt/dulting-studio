import { Tag, ToggleGroup } from "@navikt/ds-react";
import {
  erResponsSegment,
  SEGMENT_FORKLARING,
  SEGMENT_LABEL,
  SEGMENTER,
  type Segment,
} from "../maling-data";

/**
 * Globalt responsfilter. Dette ligger før tallene, slik at brukeren ser hva som
 * styrer dashboardet.
 */
export function SegmentFilterSection({
  segment,
  onChange,
}: {
  segment: Segment;
  onChange: (s: Segment) => void;
}) {
  return (
    <section className="mal__filter-panel" aria-labelledby="mal-filter-h">
      <div className="mal__filterbar">
        <div className="mal__filter-intro">
          <span className="mal__filter-kicker">Velg visning</span>
          <h2 className="mal__filter-title" id="mal-filter-h">
            Hvem i tiltakspakka ser vi på?
          </h2>
          <p className="mal__filter-help">
            Dette er en visning for hele siden, ikke en ny forsøksarm. Standard
            er alle i tiltakspakka mot kontroll.
          </p>
        </div>

        <div className="mal__filter-controls">
          <ToggleGroup
            label="Filtrer tiltakspakka på respons"
            value={segment}
            onChange={(v) => onChange(v as Segment)}
            size="small"
            data-color="neutral"
          >
            {SEGMENTER.map((s) => (
              <ToggleGroup.Item key={s} value={s} label={SEGMENT_LABEL[s]} />
            ))}
          </ToggleGroup>
        </div>

        <p className="mal__filter-state">
          <span className="mal__filter-now">{SEGMENT_LABEL[segment]}</span>
          {erResponsSegment(segment) ? (
            <Tag variant="warning" size="small">
              Viser forskjell, ikke effekt
            </Tag>
          ) : (
            <Tag variant="neutral" size="small">
              Hovedtall
            </Tag>
          )}
          <span className="mal__filter-desc">
            {SEGMENT_FORKLARING[segment]}
          </span>
        </p>
      </div>
    </section>
  );
}
