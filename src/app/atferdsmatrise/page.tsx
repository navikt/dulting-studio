import type { Metadata } from "next";
import { AtferdsmatriseView } from "@/components/AtferdsmatriseView";

export const metadata: Metadata = {
  title: "Atferdsmatrise — dulting-studio",
  description:
    "Motivasjon × barriere: hvorfor dultene i brukerreisene virker, per aktør.",
};

/**
 * Referanseside som visualiserer «hvorfor»-fundamentet (Nudgelab-
 * atferdskartleggingen): motivasjonsdrivere mot barrierer, med de bearbeidede
 * tiltakene/stegene plottet i cellene. Additiv — rører ingen eksisterende rute.
 */
export default function AtferdsmatrisePage() {
  return <AtferdsmatriseView />;
}
