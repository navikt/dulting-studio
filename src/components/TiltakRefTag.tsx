"use client";

import { Button, Detail, Dialog } from "@navikt/ds-react";
import { findTiltakProvenance } from "@/lib/tiltak-provenance";

type TiltakRefTagProps = {
  /** Tiltak-kode (T/ST). Ukjente koder rendres som passiv referanse. */
  id: string;
};

/**
 * Klikkbar referanse til et bearbeidet tiltak (T/ST). Åpner en dialog med hva
 * tiltaket er + de opprinnelige råkort-forslagene det er bearbeidet fra — så
 * man ser nøyaktig hva tiltaket er laget av. Ukjente koder rendres passivt.
 */
export function TiltakRefTag({ id }: TiltakRefTagProps) {
  const t = findTiltakProvenance(id);

  if (!t) {
    return <span className="br-ref">{id}</span>;
  }

  return (
    <Dialog>
      <Dialog.Trigger>
        <button
          type="button"
          className="dult-ref-tag"
          aria-label={`Vis tiltak ${t.id}: ${t.title}`}
        >
          {t.id}
        </button>
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Header>
          <Detail uppercase>Bearbeidet tiltak · {t.id}</Detail>
          <Dialog.Title>{t.title}</Dialog.Title>
          {t.description && (
            <Dialog.Description>{t.description}</Dialog.Description>
          )}
        </Dialog.Header>
        <Dialog.Body>
          <Detail uppercase className="tiltak-ref-raakort__label">
            Laget av disse råkort-forslagene
          </Detail>
          {t.raakort.length > 0 ? (
            <ul className="tiltak-ref-raakort">
              {t.raakort.map((r) => (
                <li key={r.id}>
                  <b>{r.id}</b>
                  {r.title ? ` — ${r.title}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="tiltak-ref-raakort__empty">
              Råkort-koblingen for dette støttetiltaket er ikke kartlagt i
              verktøyet ennå.
            </p>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseTrigger>
            <Button variant="secondary" size="small">
              Lukk
            </Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  );
}
