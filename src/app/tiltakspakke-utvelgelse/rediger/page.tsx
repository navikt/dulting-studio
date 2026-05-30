import type { Metadata } from "next";
import { TiltakEditor } from "@/components/TiltakEditor";

export const metadata: Metadata = {
  title: "Rediger tiltak — dulting-studio",
  description:
    "Team-delt redigering og kalibrering av tiltakene (effekt/innsats, plassering, tekst) som brukes i utvelgelsen.",
};

/**
 * Team-delt editor for tiltakene i utvelgelsen. DB-backed (krever DATABASE_URL);
 * additiv rute — den offentlige utvelgelses-visningen forblir TS-statisk.
 */
export default function RedigerTiltakPage() {
  return <TiltakEditor />;
}
