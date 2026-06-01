import { BodyLong, BodyShort, Heading } from "@navikt/ds-react";
import {
  hypoteseLabel,
  krGradertNote,
  krUtkastNote,
  pakke1Kriterier,
  pakke1Ramme,
  utkastNote,
} from "@/lib/tiltakspakke-utvelgelse-model";

/**
 * Den tette begrunnelsen — rammen, kriteriene, hypotesene og gradert-noten —
 * samlet i en sammenleggbar seksjon (lukket som standard). Slik holder
 * hovedflyten seg lett, mens metoden er ett klikk unna.
 */
export function OmUtvalget() {
  return (
    <details className="pb-about">
      <summary className="pb-about__summary">
        Om utvalget — metode, kriterier og hypoteser
      </summary>
      <div className="pb-about__body">
        <BodyLong size="small">{pakke1Ramme}</BodyLong>

        <Heading level="3" size="xsmall">
          Vurdert mot disse kriteriene
        </Heading>
        <ol className="pb-about__krit">
          {pakke1Kriterier.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ol>

        <BodyShort size="small">
          Virkningshypoteser: <b>H1</b> {hypoteseLabel.H1.toLowerCase()},{" "}
          <b>H2</b> {hypoteseLabel.H2.toLowerCase()}.
        </BodyShort>

        <BodyShort size="small" className="pb-about__note">
          {krGradertNote}
        </BodyShort>
        <BodyShort size="small" className="pb-about__note">
          {utkastNote} {krUtkastNote}
        </BodyShort>
      </div>
    </details>
  );
}
