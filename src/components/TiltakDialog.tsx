"use client";

import { Button, Detail, Dialog } from "@navikt/ds-react";
import type { ReactNode } from "react";
import { getTiltakProfil, type TiltakProfil } from "@/lib/tiltak-provenance";
import {
  aktorLabel,
  effektLabels,
  hypoteseLabel,
  innsatsLabels,
  krLabels,
} from "@/lib/tiltakspakke-utvelgelse-model";

const tierStatus: Record<TiltakProfil["tier"], string> = {
  pakke1: "Foreslått i pakke 1",
  vurder: "Vurderes",
  senere: "Senere",
};

function Rad({ dt, children }: { dt: string; children: ReactNode }) {
  return (
    <div>
      <dt>{dt}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Seksjon({
  tittel,
  children,
}: {
  tittel: string;
  children: ReactNode;
}) {
  return (
    <section className="tp__sec">
      <h3 className="tp__h">{tittel}</h3>
      {children}
    </section>
  );
}

/** Det kanoniske tiltak-kortet — samme innhold uansett hvor tiltaket åpnes. */
function ProfilKort({ p }: { p: TiltakProfil }) {
  const bang = p.bang >= 1 ? p.bang.toFixed(1) : p.bang.toFixed(2);
  const harAtferd = p.beskrivelse || (p.barriere && p.motivasjon) || p.dult;
  const harMaaling = p.maaletegn || p.stoppunkt || p.eastFogg || p.forgood;
  const harKobling = p.toveis || p.delt || p.blokkertAv;
  return (
    <>
      <Dialog.Header>
        <Detail uppercase>
          {p.id} · {aktorLabel[p.aktor]} · {tierStatus[p.tier]}
          {p.kjerne ? " · kjerne" : ""}
        </Detail>
        <Dialog.Title>{p.title}</Dialog.Title>
        {(p.hvorfor || p.beskrivelse) && (
          <Dialog.Description>{p.hvorfor ?? p.beskrivelse}</Dialog.Description>
        )}
      </Dialog.Header>
      <Dialog.Body>
        <div className="tp">
          <Seksjon tittel="Effekt og prioritering">
            <dl className="dult-ref-dialog__meta">
              <Rad dt="Effekt × innsats">
                {effektLabels[p.effekt]} / {innsatsLabels[p.innsats]} · bang{" "}
                {bang}
              </Rad>
              {p.kr.length > 0 && (
                <Rad dt="Overordnet mål">
                  {p.kr.map((k) => krLabels[k]).join(" · ")}
                </Rad>
              )}
              {p.hypotese && p.hypotese.length > 0 && (
                <Rad dt="Virkningshypotese">
                  {p.hypotese
                    .map((h) => `${h}: ${hypoteseLabel[h]}`)
                    .join(" · ")}
                </Rad>
              )}
            </dl>
          </Seksjon>

          {harAtferd && (
            <Seksjon tittel="Atferd — hvorfor det virker">
              <dl className="dult-ref-dialog__meta">
                {p.beskrivelse && <Rad dt="Hva det er">{p.beskrivelse}</Rad>}
                {p.barriere && p.motivasjon && (
                  <Rad dt="Barriere → driver">
                    {p.barriere} → {p.motivasjon}
                  </Rad>
                )}
                {p.dult && <Rad dt="Dult">{p.dult}</Rad>}
              </dl>
            </Seksjon>
          )}

          {harMaaling && (
            <Seksjon tittel="Måling og vakt">
              <dl className="dult-ref-dialog__meta">
                {p.maaletegn && <Rad dt="Måletegn">{p.maaletegn}</Rad>}
                {p.stoppunkt && <Rad dt="Stoppunkt">{p.stoppunkt}</Rad>}
                {p.eastFogg && <Rad dt="EAST/Fogg (utkast)">{p.eastFogg}</Rad>}
                {p.forgood && <Rad dt="FORGOOD (utkast)">{p.forgood}</Rad>}
              </dl>
            </Seksjon>
          )}

          {harKobling && (
            <Seksjon tittel="Kobling og avklaring">
              <dl className="dult-ref-dialog__meta">
                {p.toveis && <Rad dt="Toveis kobling">↔ {p.toveis}</Rad>}
                {p.delt && <Rad dt="Delt touchpoint">{p.delt}</Rad>}
                {p.blokkertAv && <Rad dt="Åpen avklaring">{p.blokkertAv}</Rad>}
              </dl>
            </Seksjon>
          )}

          {p.raakort.length > 0 && (
            <Seksjon tittel="Laget av disse råkortene">
              <ul className="tiltak-ref-raakort">
                {p.raakort.map((r) => (
                  <li key={r.id}>
                    <b>{r.id}</b>
                    {r.tekst ? ` — ${r.tekst}` : ""}
                  </li>
                ))}
              </ul>
            </Seksjon>
          )}
        </div>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.CloseTrigger>
          <Button variant="secondary" size="small">
            Lukk
          </Button>
        </Dialog.CloseTrigger>
      </Dialog.Footer>
    </>
  );
}

/**
 * Delt tiltak-dialog. Triggeren (knappens innhold + stil) varierer per flate;
 * selve kortet er kanonisk og likt overalt. Ukjent kode → passiv tekst.
 */
export function TiltakDialog({
  id,
  className,
  ariaLabel,
  children,
}: {
  id: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const p = getTiltakProfil(id);
  if (!p) {
    return <span className={className}>{children}</span>;
  }
  return (
    <Dialog>
      <Dialog.Trigger>
        <button
          type="button"
          className={className}
          aria-label={ariaLabel ?? `Vis tiltak ${p.id}: ${p.title}`}
        >
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Popup>
        <ProfilKort p={p} />
      </Dialog.Popup>
    </Dialog>
  );
}
