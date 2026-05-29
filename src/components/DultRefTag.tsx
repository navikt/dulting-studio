"use client";

import { Button, Detail, Dialog, Tag } from "@navikt/ds-react";
import { getDultReference } from "@/lib/dult-reference-registry";

type DultRefTagProps = {
  /** DULT-ID på formen `DULT-NN`. Ukjente IDer rendres som passiv tag. */
  id: string;
};

/**
 * Klikkbar referanse til et DULT-tiltak. Åpner en Aksel-dialog med kort
 * forklaring. Hvis IDen ikke finnes i registeret, rendres en passiv tag
 * uten interaksjon (slik at innholdet fortsatt er skannbart).
 */
export function DultRefTag({ id }: DultRefTagProps) {
  const ref = getDultReference(id);

  if (!ref) {
    return (
      <Tag variant="neutral" size="xsmall">
        {id}
      </Tag>
    );
  }

  return (
    <Dialog>
      <Dialog.Trigger>
        <button
          type="button"
          className="dult-ref-tag"
          aria-label={`Vis forklaring av ${ref.id}: ${ref.title}`}
        >
          {ref.id}
        </button>
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Header>
          <Detail uppercase>{ref.id}</Detail>
          <Dialog.Title>{ref.title}</Dialog.Title>
          <Dialog.Description>{ref.summary}</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <dl className="dult-ref-dialog__meta">
            <div>
              <dt>Klynge</dt>
              <dd>{ref.cluster}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{ref.status}</dd>
            </div>
          </dl>
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
