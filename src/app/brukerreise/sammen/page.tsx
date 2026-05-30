import type { Metadata } from "next";
import { BrukerreiseSammen } from "@/components/brukerreise/BrukerreiseSammen";

export const metadata: Metadata = {
  title: "Ett touchpoint, to sider — dulting-studio",
  description:
    "Arbeidsgiver- og sykmeldt-reisen side om side: samme touchpoints i sykefraværsoppfølgingen, sett fra to roller, med de toveis koblingene.",
};

/**
 * Split-view som viser begge brukerreisene (nærmeste leder + den sykmeldte)
 * side om side rundt én felles tidslinje. Additiv — rører ikke de to
 * frittstående reisene (/brukerreise/leder, /brukerreise/sykmeldt).
 */
export default function BrukerreiseSammenPage() {
  return <BrukerreiseSammen />;
}
