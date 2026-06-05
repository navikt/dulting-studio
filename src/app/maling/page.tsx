import type { Metadata } from "next";
import { MalingView } from "@/components/maling/MalingView";

export const metadata: Metadata = {
  title: "Måling — dulting-studio",
  description:
    "Dummy måle-dashboard for tiltakspakke 1: kontroll vs. tiltakspakke (to armer), KR1–KR3 som styringstall, og opt-in/opt-out som analyselag. Alle tall er syntetiske.",
};

/**
 * Dummy måle-dashboard som gjør målerammeverket (docs/maling-rammeverk.md)
 * konkret — hvordan målingene KUNNE sett ut. Fortellingen er kontroll vs.
 * tiltakspakke; opt-in/opt-out er et filter-/analyselag. Additiv, syntetisk,
 * DB-fri og uten rådata (trygt i demoen).
 */
export default function MalingPage() {
  return <MalingView />;
}
