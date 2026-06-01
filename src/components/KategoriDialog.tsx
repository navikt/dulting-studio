"use client";

import { BodyLong, Button, Detail, Dialog } from "@navikt/ds-react";
import type { ReactNode } from "react";
import {
  barriereForklaring,
  driverForklaring,
} from "@/lib/atferdsmatrise-model";

/**
 * Klikkbar barriere-/driver-kategori → kort definisjon. Delt mellom
 * atferdsmatrisen og brukerreisene, så «Manglende rutiner» / «Autonomi og
 * eierskap» betyr det samme uansett hvor man klikker. Ukjent kategori → passiv.
 */
export function KategoriDialog({
  navn,
  kind,
  className,
  children,
}: {
  navn: string;
  kind: "barriere" | "driver";
  className?: string;
  children: ReactNode;
}) {
  const forklaring =
    kind === "barriere" ? barriereForklaring[navn] : driverForklaring[navn];
  if (!forklaring) {
    return <span className={className}>{children}</span>;
  }
  return (
    <Dialog>
      <Dialog.Trigger>
        <button
          type="button"
          className={className}
          aria-label={`Forklar ${navn}`}
        >
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Header>
          <Detail uppercase>
            {kind === "barriere" ? "Barriere" : "Motivasjonsdriver"}
          </Detail>
          <Dialog.Title>{navn}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <BodyLong>{forklaring}</BodyLong>
          <Detail className="bm__dialog-utkast">
            Kort forklaring lagt til av oss (utkast) — ikke Nudgelabs offisielle
            definisjon.
          </Detail>
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
