import { HStack, Loader } from "@navikt/ds-react";
import { Suspense } from "react";
import { Brukerreise } from "@/components/brukerreise/Brukerreise";
import { lederJourney } from "@/components/brukerreise/journey-data";

export default function ProjectKontekstBrukerreisePage() {
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
