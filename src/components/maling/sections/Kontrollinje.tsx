"use client";
import { Select, Tag, ToggleGroup } from "@navikt/ds-react";
import {
  erResponsSegment,
  PERIODER,
  SEGMENT_LABEL,
  SEGMENTER,
  type Segment,
} from "../maling-data";

type KontrollinjeProps = {
  segment: Segment;
  onSegment: (s: Segment) => void;
  periode: number;
  onPeriode: (i: number) => void;
};

export function Kontrollinje({
  segment,
  onSegment,
  periode,
  onPeriode,
}: KontrollinjeProps) {
  return (
    <div className="mal__kontrollinje" role="region" aria-label="Kontroller">
      {/* sr-only live-region: annonser segmentbytte til skjermleser */}
      <span aria-live="polite" className="sr-only">
        Viser: {SEGMENT_LABEL[segment]}.
      </span>

      <span className="mal__kontrollinje-label">Hvem i tiltakspakka ser vi på?</span>

      <ToggleGroup
        value={segment}
        onChange={(v) => onSegment(v as Segment)}
        size="small"
        aria-label="Velg segment"
      >
        {SEGMENTER.map((s) => (
          <ToggleGroup.Item key={s} value={s}>
            {SEGMENT_LABEL[s]}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>

      <Select
        label="Periode"
        size="small"
        value={String(periode)}
        onChange={(e) => onPeriode(Number(e.target.value))}
        className="mal__kontrollinje-periode"
      >
        {PERIODER.map((p, i) => (
          <option key={p} value={i}>
            {p}
          </option>
        ))}
      </Select>

      {erResponsSegment(segment) ? (
        <Tag variant="warning" size="small">
          Viser forskjell, ikke effekt
        </Tag>
      ) : (
        <Tag variant="neutral" size="small">
          Hovedtall
        </Tag>
      )}
    </div>
  );
}
