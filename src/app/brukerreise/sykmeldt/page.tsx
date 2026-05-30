import { HStack, Loader } from "@navikt/ds-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Brukerreise } from "@/components/brukerreise/Brukerreise";
import { sykmeldtJourney } from "@/components/brukerreise/journey-data-sykmeldt";

export const metadata: Metadata = {
  title: "Brukerreise for den sykmeldte — dulting-studio",
  description:
    "Dagens passive flyt mot en flyt med dulting der den sykmeldte forstår pliktene sine, vurderer behov tidlig og medvirker i planen.",
};

/**
 * Frittstående, database-fri inngang til brukerreisen for den sykmeldte —
 * motstykket til /brukerreise/leder. Presentasjonsmodus:
 * /brukerreise/sykmeldt?modus=presentasjon
 */
export default function BrukerreiseSykmeldtPage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster brukerreise ..." />
        </HStack>
      }
    >
      <Brukerreise data={sykmeldtJourney} />
    </Suspense>
  );
}
