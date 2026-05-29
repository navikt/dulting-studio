"use client";

import { Schibsted_Grotesk } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { BrukerreisePresentasjon } from "./BrukerreisePresentasjon";
import { BrukerreiseTospor } from "./BrukerreiseTospor";
import "./brukerreise.css";

// Schibsted Grotesk lastes via next/font (self-hosted, ingen runtime-<link>,
// ingen layout-shift). Eksponeres som --font-schibsted og plukkes opp av
// --font-display i brukerreise.css.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

/**
 * Brukerreise for nærmeste leder. To visninger på samme rute:
 *  - standard: tospor (arbeidsverktøy) — «I dag» mot «Med dulting»
 *  - `?modus=presentasjon`: full-skjerm scrollytelling (presentasjonsmodus)
 *
 * Tospor-visningen har en «Vis som presentasjon»-knapp; presentasjonen en «Lukk».
 */
export function Brukerreise() {
  const searchParams = useSearchParams();
  const erPresentasjon =
    (searchParams.get("modus") ?? "").toLowerCase() === "presentasjon";

  return (
    <div className={schibsted.variable}>
      {erPresentasjon ? <BrukerreisePresentasjon /> : <BrukerreiseTospor />}
    </div>
  );
}
