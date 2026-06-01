"use client";

import { TiltakDialog } from "./TiltakDialog";

type TiltakRefTagProps = {
  /** Tiltak-kode (T/ST). Ukjente koder rendres som passiv referanse. */
  id: string;
};

/**
 * Klikkbar referanse til et bearbeidet tiltak (T/ST) i brukerreisen. Åpner det
 * delte, kanoniske tiltak-kortet — samme innhold som i tiltakskart/utvelgelse/
 * matrise, inkl. råkortene tiltaket er laget av.
 */
export function TiltakRefTag({ id }: TiltakRefTagProps) {
  return (
    <TiltakDialog id={id} className="dult-ref-tag">
      {id}
    </TiltakDialog>
  );
}
