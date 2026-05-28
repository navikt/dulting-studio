import { HStack, Loader } from "@navikt/ds-react";
import { Suspense } from "react";
import { KidultJourneyView } from "@/components/KidultReferenceViews";

export default function BrukerreisePage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster brukerreise ..." />
        </HStack>
      }
    >
      <KidultJourneyView />
    </Suspense>
  );
}
