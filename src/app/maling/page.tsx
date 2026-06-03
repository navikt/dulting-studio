import type { Metadata } from "next";
import { MalingView } from "@/components/maling/MalingView";

export const metadata: Metadata = {
  title: "Måling — dulting-studio",
  description:
    "Dummy måle-dashboard for tiltakspakke 1: KPI-er, trend og funnel med A/B/C-segmentering. Alle tall er syntetiske.",
};

/**
 * Dummy måle-dashboard som gjør målerammeverket (docs/maling-rammeverk.md)
 * konkret — hvordan målingene KUNNE sett ut, med opt-in-segmentering. Additiv,
 * syntetisk, DB-fri (trygt i demoen).
 */
export default function MalingPage() {
  return <MalingView />;
}
