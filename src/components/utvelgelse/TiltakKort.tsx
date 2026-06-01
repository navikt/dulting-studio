import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import { Button, Tag } from "@navikt/ds-react";
import {
  type KrId,
  krFor,
  krKort,
  krLabels,
  type SelectionTiltak,
} from "@/lib/tiltakspakke-utvelgelse-model";
import { TiltakDialog } from "../TiltakDialog";
import { EffektInnsatsMaler } from "./EffektInnsatsMaler";

/** Hvert overordnet mål får sin egen, stabile farge så det er gjenkjennelig. */
const KR_COLOR = {
  KR1: "brand-blue",
  KR2: "meta-lime",
  KR3: "brand-magenta",
  KR4: "brand-beige",
  KR5: "meta-purple",
} as const satisfies Record<KrId, string>;

function fallbackHvorfor(t: SelectionTiltak): string {
  if (t.hvorfor) return t.hvorfor;
  return t.tier === "vurder"
    ? "God kandidat til en senere pakke."
    : "Lavere prioritet nå — venter.";
}

/**
 * Ett tiltak som et kort: kode + tittel på én linje (klikk → kanonisk tiltak-
 * kort), effekt×innsats-måler, én linje hvorfor, fargede mål-merker (Aksel
 * Tag), og inn/ut-knappen som er hovedhandlingen. Likt i begge kolonner.
 */
export function TiltakKort({
  t,
  inn,
  onToggle,
}: {
  t: SelectionTiltak;
  inn: boolean;
  onToggle: (id: string, inn: boolean) => void;
}) {
  const krs = krFor(t.id);
  return (
    <div
      className={`pb-kort pb-kort--${t.aktor} ${
        inn ? "pb-kort--inn" : "pb-kort--ute"
      }`}
    >
      <div className="pb-kort__head">
        <span className="pb-kort__label">
          <TiltakDialog
            id={t.id}
            className="pb-kort__code"
            ariaLabel={`Vis detaljer for ${t.id}: ${t.title}`}
          >
            {t.id}
          </TiltakDialog>{" "}
          <span className="pb-kort__title">{t.title}</span>
        </span>
        <Button
          size="xsmall"
          variant={inn ? "tertiary" : "secondary"}
          className="pb-kort__tog"
          onClick={() => onToggle(t.id, !inn)}
        >
          {inn ? "− ta ut" : "+ ta inn"}
        </Button>
      </div>

      <div className="pb-kort__meta">
        <EffektInnsatsMaler effekt={t.effekt} innsats={t.innsats} />
        {inn &&
          (t.kjerne ? (
            <Tag size="xsmall" variant="strong" data-color="neutral">
              kjerne
            </Tag>
          ) : (
            <Tag size="xsmall" variant="outline" data-color="neutral">
              støtte
            </Tag>
          ))}
        {t.blokkertAv && (
          <Tag
            size="xsmall"
            variant="moderate"
            data-color="warning"
            icon={<ExclamationmarkTriangleIcon aria-hidden />}
          >
            åpen avklaring
          </Tag>
        )}
      </div>

      <p className="pb-kort__why">{fallbackHvorfor(t)}</p>

      {krs.length > 0 && (
        <div className="pb-kort__kr">
          {krs.map((k) => (
            <Tag
              key={k}
              size="xsmall"
              variant="moderate"
              data-color={KR_COLOR[k]}
              title={krLabels[k]}
            >
              {krKort[k]}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
