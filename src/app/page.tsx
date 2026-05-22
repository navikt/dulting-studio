import {
  Alert,
  BodyLong,
  BodyShort,
  Heading,
  HStack,
  Tag,
  VStack,
} from "@navikt/ds-react";
import { loadStudioCaseBundle } from "@/lib/studio-data/repository";

const focusAreas = [
  {
    title: "Beslutningsgrunnlag",
    text: "Samle problem, hypotese, datagrunnlag og åpne spørsmål i én intern arbeidsflate.",
  },
  {
    title: "Tiltakspakker",
    text: "Sammenligne enkelttiltak og pakker uten å koble til produksjonsdata eller database.",
  },
  {
    title: "Datagrenser",
    text: "Stoppe bruk av persondata, diagnosegrupper, konkrete saker og små sårbare segmenter i MVP.",
  },
];

const boundaries = [
  "Ingen persondata eller produksjonsdata i repoet eller appen",
  "Kun illustrative seed-data på konseptnivå, aldri Mural-data eller enkeltsaker",
  "Ingen produksjonsintegrasjoner, database eller GitHub API i MVP",
];

export default async function Home() {
  const studioCase = await loadStudioCaseBundle("oppfolgingsplan");
  const firstPackage = studioCase.tiltakspakker[0];

  return (
    <main className="page-shell">
      <div className="page-container">
        <VStack gap="space-32">
          <section className="hero-card">
            <VStack gap="space-16">
              <HStack gap="space-8" wrap>
                <Tag data-color="neutral" variant="moderate" size="small">
                  Intern app
                </Tag>
                <Tag data-color="success" variant="moderate" size="small">
                  Fase 0-skjelett
                </Tag>
              </HStack>

              <div>
                <Heading level="1" size="xlarge" spacing>
                  dulting-studio
                </Heading>
                <BodyLong size="large" spacing>
                  En intern beslutningsapp for dulting og tiltakspakker i
                  sykefraværsoppfølgingen.
                </BodyLong>
                <BodyLong>
                  Første leveranse etablerer repo, dokumentasjon, dev-deploy og
                  et minimalt appskjelett. Første case er oppfølgingsplan.
                </BodyLong>
              </div>

              <Alert variant="info">
                Denne versjonen er bevisst avgrenset: Appen viser rammer og
                retning, men inneholder ikke reelle tiltak, saker eller
                personopplysninger.
              </Alert>
            </VStack>
          </section>

          <section className="section-grid" aria-label="Fokusområder">
            {focusAreas.map((area) => (
              <article className="info-card" key={area.title}>
                <Heading level="2" size="medium" spacing>
                  {area.title}
                </Heading>
                <BodyLong size="medium">{area.text}</BodyLong>
              </article>
            ))}
          </section>

          <section className="info-card">
            <Heading level="2" size="medium" spacing>
              Tydelige grenser for MVP
            </Heading>
            <BodyLong spacing>
              dulting-studio er en intern beslutningsflate, ikke en admin-app og
              ikke en analyseplattform. All videre utvikling skal holde seg
              innenfor datagrenser og governance fra ADR og PRD.
            </BodyLong>
            <ul>
              {boundaries.map((boundary) => (
                <li key={boundary}>
                  <BodyShort size="medium">{boundary}</BodyShort>
                </li>
              ))}
            </ul>
          </section>

          <section className="info-card">
            <Heading level="2" size="medium" spacing>
              Neste steg
            </Heading>
            <BodyLong spacing>
              Videre arbeid skjer via start-issues i GitHub: teknologivalg og
              stack, sikkerhetsramme, filbasert domeneformat og
              observability/driftsminimum.
            </BodyLong>
            <BodyLong className="muted">
              Se README og dokumentasjonen i <code>docs/</code> for mer
              kontekst.
            </BodyLong>
          </section>

          <section
            className="section-grid"
            aria-label="Illustrative eksempeldata"
          >
            <article className="info-card">
              <Heading level="2" size="medium" spacing>
                Domenemodell i repoet
              </Heading>
              <BodyLong spacing>
                Oppfølgingsplan er nå lagt inn som første case i et validert,
                filbasert datalag.
              </BodyLong>
              <ul>
                <li>
                  <BodyShort size="medium">
                    Case: {studioCase.case.name}
                  </BodyShort>
                </li>
                <li>
                  <BodyShort size="medium">
                    Tiltak: {studioCase.tiltak.length}
                  </BodyShort>
                </li>
                <li>
                  <BodyShort size="medium">
                    Tiltakspakker: {studioCase.tiltakspakker.length}
                  </BodyShort>
                </li>
              </ul>
            </article>

            <article className="info-card">
              <Heading level="2" size="medium" spacing>
                Illustrativ pakke
              </Heading>
              <BodyLong spacing>{firstPackage?.name}</BodyLong>
              <BodyLong className="muted">
                Seed-dataene er kun ment for struktur, validering og tidlig UI.
                De beskriver ikke reelle tiltak, konkrete saker eller sårbare
                grupper.
              </BodyLong>
            </article>
          </section>
        </VStack>
      </div>
    </main>
  );
}
