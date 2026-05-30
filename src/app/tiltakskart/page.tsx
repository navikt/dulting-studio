import { HStack, Loader } from "@navikt/ds-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { KidultInterventionMapView } from "@/components/KidultReferenceViews";

export const metadata: Metadata = {
  title: "Tiltakskart — dulting-studio",
  description:
    "Bearbeidede dulting-tiltak for arbeidsgiver, knyttet til brukerreisesteg og måletegn.",
};

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
