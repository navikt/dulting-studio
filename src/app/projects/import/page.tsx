import { Heading, VStack } from "@navikt/ds-react";
import { ImportDropzone } from "@/components/ImportDropzone";

export const metadata = {
  title: "Importer Mural – dulting-studio",
};

export default function ImportPage() {
  return (
    <VStack gap="space-20">
      <Heading level="2" size="large">
        Importer Mural-eksport
      </Heading>
      <ImportDropzone />
    </VStack>
  );
}
