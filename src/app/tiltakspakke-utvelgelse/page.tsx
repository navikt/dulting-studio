import type { Metadata } from "next";
import { TiltakspakkeUtvelgelseView } from "@/components/TiltakspakkeUtvelgelseView";

export const metadata: Metadata = {
  title: "Tiltakspakke-utvelgelse — dulting-studio",
  description:
    "Effekt × innsats: hvilke bearbeidede tiltak som bør med i den første tiltakspakken, med forslag og kriterier.",
};

/**
 * Referanseside for å identifisere og velge tiltak til FØRSTE tiltakspakke:
 * de bearbeidede tiltakene (T01–T14 / ST01–ST12) plottet på effekt × innsats,
 * med blokkert-flagg, toveis-koblinger og et kalibrerbart forslag. Additiv,
 * DB-fri — rører ingen eksisterende rute.
 */
export default function TiltakspakkeUtvelgelsePage() {
  return <TiltakspakkeUtvelgelseView />;
}
