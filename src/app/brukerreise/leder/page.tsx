import { HStack, Loader } from "@navikt/ds-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Brukerreise } from "@/components/brukerreise/Brukerreise";
import { lederJourney } from "@/components/brukerreise/journey-data";

export const metadata: Metadata = {
  title: "Brukerreise for nærmeste leder — dulting-studio",
  description:
    "Dagens flyt mot endret flyt med dulting i oppfølgingsplan-arbeidet, sett fra nærmeste leder.",
};

/**
 * Frittstående, database-fri inngang til brukerreisen for nærmeste leder.
 * Samme komponent som inne i prosjektrommet (/projects/[id]/kontekst/brukerreise),
 * men uten prosjekt-sidebar — slik at artefakten er direkte delbar og nåbar
 * for alle, også når studioet kjører uten database.
 *
 * Presentasjonsmodus: /brukerreise/leder?modus=presentasjon
 */
export default function BrukerreiseLederPage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster brukerreise ..." />
        </HStack>
      }
    >
      <Brukerreise data={lederJourney} />
    </Suspense>
  );
}
