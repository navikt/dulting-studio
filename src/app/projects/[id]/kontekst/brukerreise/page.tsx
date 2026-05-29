import { HStack, Loader } from "@navikt/ds-react";
import { Suspense } from "react";
import { Brukerreise } from "@/components/brukerreise/Brukerreise";

export default function ProjectKontekstBrukerreisePage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster brukerreise ..." />
        </HStack>
      }
    >
      <Brukerreise />
    </Suspense>
  );
}
