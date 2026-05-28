import { HStack, Loader } from "@navikt/ds-react";
import { Suspense } from "react";
import { KidultInterventionMapView } from "@/components/KidultReferenceViews";

export default function TiltakskartPage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster tiltakskart ..." />
        </HStack>
      }
    >
      <KidultInterventionMapView />
    </Suspense>
  );
}
