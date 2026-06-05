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
import { SEGMENT_LABEL, type Segment } from "./maling-data";
import { DatagrunnlagSection } from "./sections/DatagrunnlagSection";
import { ForsoksdesignSection } from "./sections/ForsoksdesignSection";
import { FunnelSection } from "./sections/FunnelSection";
import { LangHorisontSection } from "./sections/LangHorisontSection";
import { LumiSection } from "./sections/LumiSection";
import { PromptTimingSection } from "./sections/PromptTimingSection";
import { SegmentFilterSection } from "./sections/SegmentFilterSection";
import { StyringstallSection } from "./sections/StyringstallSection";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

export function MalingView() {
  const [segment, setSegment] = useState<Segment>("alle");

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
        <h1 className="mal__title">Virker pakka? Kontroll vs. tiltakspakke</h1>
        <p className="mal__lede">
          Ett forsøk med to armer: underenheter med tiltakspakka mot
          underenheter uten. Først sjekker vi om flere kommer i gang med
          oppfølgingsplanen i tide.
        </p>
        <p className="mal__frame">
          <b>Les tallene slik:</b> alle i tiltakspakka mot kontroll er
          hovedsvaret. Responsgruppene viser hvem som takket ja eller ikke
          svarte på påminnelsen.
        </p>
      </header>

      {/* aria-live: annonser segmentbytte til skjermleser */}
      <div aria-live="polite" className="sr-only">
        Filter: {SEGMENT_LABEL[segment]}.
      </div>

      <SegmentFilterSection segment={segment} onChange={setSegment} />
      <StyringstallSection onSegmentChange={setSegment} segment={segment} />
      <ForsoksdesignSection />
      <PromptTimingSection />
      <LumiSection segment={segment} />
      <FunnelSection segment={segment} />
      <LangHorisontSection />
      <DatagrunnlagSection />

      <p className="mal__foot">
        Dummy-dashboard · speiler <code>docs/maling-rammeverk.md</code> · alle
        tall er syntetiske
      </p>
    </div>
  );
}
