"use client";

import { FolderIcon, UploadIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  Heading,
  HStack,
  Tag,
  VStack,
} from "@navikt/ds-react";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <VStack gap="space-24">
      <HStack justify="space-between" align="center" wrap>
        <Heading level="2" size="large">
          Prosjekter
        </Heading>
        <Button
          as={Link}
          href="/projects/import"
          variant="primary"
          size="small"
          icon={<UploadIcon aria-hidden />}
        >
          Importer Mural
        </Button>
      </HStack>

      {/* Ærlig tomtilstand: ingen prosjektlisting-API finnes ennå */}
      <Box
        padding="space-32"
        borderRadius="12"
        borderColor="neutral-subtle"
        borderWidth="1"
        background="sunken"
      >
        <VStack gap="space-16" align="center">
          <FolderIcon aria-hidden fontSize="3rem" className="muted" />
          <VStack gap="space-8" align="center">
            <Heading level="3" size="medium">
              Ingen prosjekter ennå
            </Heading>
            <BodyLong align="center">
              Prosjekter opprettes automatisk når du importerer en
              Mural-eksport. Start med å importere din første fil.
            </BodyLong>
          </VStack>
          <HStack gap="space-8" align="center">
            <Tag variant="moderate" data-color="neutral" size="small">
              Prosjektlisting kommer i neste fase
            </Tag>
          </HStack>
          <Button
            as={Link}
            href="/projects/import"
            variant="secondary"
            size="small"
          >
            Gå til import
          </Button>
        </VStack>
      </Box>

      <Box padding="space-16" borderRadius="8" background="info-soft">
        <BodyShort size="small">
          Prosjektoversikten vil vise importerte Mural-brett med status, antall
          widgets og lenke til innholdsvisning når backend-endepunktet for
          prosjektlisting er klart.
        </BodyShort>
      </Box>
    </VStack>
  );
}
