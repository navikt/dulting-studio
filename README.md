# dulting-studio

[![CI](https://github.com/navikt/dulting-studio/actions/workflows/build-and-deploy.yaml/badge.svg)](https://github.com/navikt/dulting-studio/actions/workflows/build-and-deploy.yaml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Biome](https://img.shields.io/badge/Biome-2-60a5fa?logo=biome&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)

## Formålet med repoet

`dulting-studio` er en intern beslutningsapp for Team eSyfo. Appen skal hjelpe
teamet og berørte produkteiere med å utvikle, vurdere og prioritere
dultingtiltak og tiltakspakker med tydelig datagrunnlag, synlige datagrenser og
klar etisk risiko.

Første case er oppfølgingsplan. MVP-en er bevisst avgrenset:

- ingen persondata eller produksjonsdata
- ingen database
- ingen produksjonsintegrasjoner eller GitHub API
- ingen admin-UI eller dashboards

## Arkitektur

```mermaid
graph LR
    Ansatt["Nav-ansatt"] --> Azure["Azure AD / Wonderwall"]
    Azure --> App["dulting-studio"]
    App --> Files["Filbasert data i repoet"]
    App --> Docs["ADR / PRD / README"]
```

## Miljøer

- 🛠️ [Utvikling](https://dulting-studio.intern.dev.nav.no)
- 🚫 Produksjon er ikke satt opp ennå

## Datagrenser

MVP-en skal kun bruke redaksjonelt bearbeidet, ikke-identifiserende innhold.
Repoet og appen skal ikke inneholde:

- personopplysninger
- diagnosegrupper
- konkrete saker
- små eller sårbare segmenter
- produksjonsdata

Filstrukturen under `data/` er opprettet for fremtidig YAML/JSON-basert innhold,
men denne første leveransen inneholder ikke seed-data.

## Dokumentasjon

- [ADR-001: Egen intern app og eget repo for dulting-studio](docs/adr/ADR-001-dulting-studio.md)
- [PRD: dulting-studio MVP](docs/PRD-dulting-studio-mvp.md)

## Utvikling

Installer avhengigheter med pnpm, og bruk `pnpm run` for å se oppdatert liste
over tilgjengelige skript. Appen kjører lokalt på
[http://localhost:3000](http://localhost:3000).

## For Nav-ansatte

Interne henvendelser kan sendes via Slack i kanalen
[#esyfo](https://nav-it.slack.com/archives/C012X796B4L).
