import type { Niva } from "@/lib/tiltakspakke-utvelgelse-model";

const NIVA_ORD: Record<Niva, string> = { 1: "lav", 2: "middels", 3: "høy" };

const dots = (n: Niva) => "●".repeat(n) + "○".repeat(3 - n);

/**
 * Leselig effekt×innsats: «Effekt ●●● · Innsats ●●○» med skjult tekst-versjon
 * for skjermleser. Erstatter den kryptiske «E3/I2».
 */
export function EffektInnsatsMaler({
  effekt,
  innsats,
}: {
  effekt: Niva;
  innsats: Niva;
}) {
  return (
    <span className="pb-maler">
      <span aria-hidden>
        <span className="pb-maler__lab">Effekt</span>{" "}
        <span className="pb-maler__dots">{dots(effekt)}</span>
        {" · "}
        <span className="pb-maler__lab">Innsats</span>{" "}
        <span className="pb-maler__dots">{dots(innsats)}</span>
      </span>
      <span className="tu-sr">
        Effekt {NIVA_ORD[effekt]}, innsats {NIVA_ORD[innsats]}
      </span>
    </span>
  );
}
