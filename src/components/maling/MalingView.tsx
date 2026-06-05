"use client";

// Dummy måle-dashboard for tiltakspakke 1 — gjør målerammeverket
// (docs/maling-rammeverk.md) konkret. ALLE TALL ER SYNTETISKE. Ingen live
// data, ingen personer, ingen DB. Studio viser godkjente aggregater fra
// datamarkedsplassen, ikke rådata.
//
// Fortellingen er kontroll vs. tiltakspakke (to armer). Respons på påminnelse
// er et filterlag inni pakke-armen, ikke en tredje arm.
import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import "./maling.css";
import { PERIODER } from "./maling-data";
import { FunnelSection } from "./sections/FunnelSection";
import { Kontrollinje } from "./sections/Kontrollinje";
import { KrBevisSection } from "./sections/KrBevisSection";
import { LangHorisontSection } from "./sections/LangHorisontSection";
import { LumiSection } from "./sections/LumiSection";
import { MetodeOgData } from "./sections/MetodeOgData";
import { PromptTimingSection } from "./sections/PromptTimingSection";
import { VerdiktBand } from "./sections/VerdiktBand";
import { useSegmentFilter } from "./useSegmentFilter";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

export function MalingView() {
  const { segment, setSegment } = useSegmentFilter();
  const [periode, setPeriode] = useState(PERIODER.length - 1);

  return (
    <div className={`mal ${schibsted.variable}`}>
      <Link className="mal__back" href="/">
        <ArrowLeftIcon aria-hidden fontSize="0.9rem" /> Forsiden
      </Link>

      <div className="mal__dummy" role="note">
        <b>Dummy-dashboard.</b> Alle tall er syntetiske — en skisse av hvordan
        målingene <i>kunne</i> sett ut. Ingen live data, ingen reelle personer,
        ingen rådata.
      </div>

      <header>
        <span className="mal__eyebrow">
          Måling · tiltakspakke 1 · pilot Troms og Finnmark
        </span>
        <h1 className="mal__title">Er vi på rett vei?</h1>
        <p className="mal__lede">
          Pakke vs. kontroll: ser vi de tidlige endringene vi hadde håpet på?
        </p>
        <p className="mal__frame">
          <b>Les tallene slik:</b> pakke vs. kontroll er hovedsvaret;
          responsgrupper viser mønster, ikke effekt.
        </p>
      </header>

      <VerdiktBand segment={segment} periode={periode} />
      <Kontrollinje
        segment={segment}
        onSegment={setSegment}
        periode={periode}
        onPeriode={setPeriode}
      />
      <KrBevisSection segment={segment} periode={periode} />
      <LumiSection segment={segment} />
      <PromptTimingSection />
      <FunnelSection segment={segment} />
      <LangHorisontSection />
      <MetodeOgData />

      <p className="mal__foot">
        Dummy-dashboard · speiler <code>docs/maling-rammeverk.md</code> · alle
        tall er syntetiske
      </p>
    </div>
  );
}
