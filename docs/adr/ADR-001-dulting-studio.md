# ADR-001: Egen intern app og eget repo for dulting-studio

**Dato:** 2026-05-22  
**Status:** Delvis erstattet av ADR-002 og ADR-003
**Beslutningstakere:** Team eSyfo, med råd fra berørte produkteiere og sikkerhet/personvern-roller (konkrete personer: TBD)

> Datagrense- og repo-beslutningen står fortsatt. Antakelsen om filbasert
> lagring som eneste MVP-datalag er erstattet av dataminimert Mural-import og
> Postgres/Drizzle-migrasjoner, se ADR-002 og ADR-003.

## Kontekst

Team eSyfo skal levere beslutningsgrunnlag og senere eksperimenter som kan bedre etterlevelsen i sykefraværsoppfølgingen under IA-avtalen 2025–2028. Arbeidet starter med oppfølgingsplanen, men skal senere kunne dekke dialogmøte 1, aktivitetskrav og andre kontaktflater.

Vi trenger et verktøy som kan samle forslag til dultingtiltak, dokumentere datagrunnlag, vise etisk og personvernmessig risiko, og gjøre det mulig å ta beslutninger om tiltakspakker. Brukeren har valgt app framfor GitHub Pages eller ren dokumentasjon fordi dette er et hovedspor for året og kan få stor effekt.

MVP-en skal være en intern beslutningsapp. Den skal ikke være en tung admin-app.
Den skal ikke ha produksjonsintegrasjoner eller bruke produksjonsdata.
Antakelsen om å ikke bygge database i første omgang er erstattet av ADR-003:
import, triage og klassifisering lagres i Postgres, mens godkjente
beslutningsgrunnlag fortsatt kan eksporteres til reviewbare Markdown- eller
JSON-filer.

## Beslutning

Vi har besluttet å etablere `dulting-studio` som en egen intern app i eget repo, med egen produktidentitet, egen CODEOWNERS og egen deploy til Nais.

MVP-en bygges som en intern Nav-app bak Azure AD-innlogging. Den bruker
Postgres/Drizzle til dataminimert Mural-import og arbeidsversjoner, og skal
fortsatt ikke koble seg til produksjonssystemer eller hente produksjonsdata.

## 3-perspektiv-review

### Arkitektur

Egen app og eget repo gir tydeligere ansvar, mindre kobling til oppfølgingsplan-appen og bedre rom for å utvide til flere kontaktflater. Løsningen gjenbruker Nais, Azure AD og GitHub-workflow, og unngår at et utforskende produkt blir skjult som dokumentasjon eller sidefunksjon i et annet repo.

### Sikkerhet

MVP-en kan holdes på dataklassifisering **intern** så lenge vi håndhever tydelige datagrenser og forbyr personopplysninger og saksnær fritekst. Azure AD og gruppestyrt tilgang er tilstrekkelig for intern bruk. Hvis løsningen senere skal bruke personopplysninger, må det tas ny ADR og DPIA-vurdering.

### Plattform

Nais er riktig plattform for en intern app med behov for tilgangsstyring, logging, CODEOWNERS og vanlig CI/CD. MVP-en kan starte uten outbound-integrasjoner og med enkel observerbarhet. Database- og migrasjonsvalg er senere presisert i ADR-003.

## Alternativer vurdert

### Alternativ A: Legge dette i `syfo-oppfolgingsplan-frontend`

**Beskrivelse:** Bygge dulting-studio som en intern del av eksisterende repo og app.

**Fordeler:**
- Gjenbruk av kjent stack og etablert deploy-løp.
- Mindre oppstartskostnad enn et helt nytt repo.
- Nærhet til første case oppfølgingsplan.

**Ulemper:**
- Blander et internt beslutningsprodukt med en brukerrettet løsning.
- Øker risiko for utilsiktet kobling til produksjonsdomene, data og release-planer.
- Gjør det vanskeligere å utvide til dialogmøte 1, aktivitetskrav og andre kontaktflater uten å trekke mer ansvar inn i feil repo.
- CODEOWNERS, backlog og arkitektur blir mindre tydelig.

### Alternativ B: GitHub Pages under `team-esyfo`

**Beskrivelse:** Lage et dokumentasjons- og visualiseringsoppsett i GitHub Pages eller tilsvarende statisk dokumentasjon.

**Fordeler:**
- Lav teknisk terskel.
- Egnet for ren dokumentasjon.
- Enkelt å publisere og versjonere tekst.

**Ulemper:**
- For svak modell for intern tilgangsstyring og videre produktutvikling.
- Dårlig egnet for statusflyt, strukturert arbeidsflyt og senere interaktiv visualisering.
- Skyver et viktig satsingsområde inn i et dokumentspor i stedet for et produktspor.
- Vanskeligere å bygge videre på når behovene blir mer operative.

### Alternativ C: Egen intern app og eget repo `dulting-studio` (valgt)

**Beskrivelse:** Etablere et eget repo og en egen intern app med strukturert datalag, AI-assistert arbeidsflyt og tydelig governance.

**Fordeler:**
- Tydelig produktgrense og tydelig eierskap.
- Kan starte smalt med oppfølgingsplan og utvides videre uten å arve feil domenekoblinger.
- Gir plass til egne CODEOWNERS, egen backlog og egne arkitekturbeslutninger.
- Passer godt med intern tilgang via Azure AD og deploy på Nais.
- SQL-migrasjoner og eksportbare beslutningsgrunnlag gjør endringer synlige i pull requests.

**Ulemper:**
- Krever nytt repo, ny CI/CD og ny grunnoppsett.
- Litt høyere startkostnad enn å legge dette i eksisterende repo.
- Krever bevisst styring for å unngå at appen vokser til en tung admin-app.

### Alternativ D: Gjøre ingenting

**Beskrivelse:** Fortsette med ad hoc-dokumenter, møter og enkeltstående vurderinger uten eget verktøy.

**Fordeler:**
- Ingen oppstartskostnad.
- Ingen ny plattform- eller forvaltningsbyrde.

**Ulemper:**
- Beslutninger blir vanskeligere å spore, sammenligne og gjenbruke.
- Høyere risiko for utydelige normative vurderinger og svakt grunnlag for tiltakspakker.
- FORGOOD- og personvernvurderinger blir lett fragmenterte.
- Teamet mister fart i et prioritert satsingsområde.

## Nav-spesifikke vurderinger

### Sikkerhet og personvern

- **Dataklassifisering:** MVP-en skal behandle data på nivå **intern**. Åpne kilder kan refereres, men den samlede arbeidsflaten er intern.
- **Auth-mekanisme:** Azure AD for Nav-ansatte, helst via Wonderwall/Oasis eller tilsvarende standardmønster for intern app.
- **PII-håndtering:** Ingen PII i lagring, input, eksport eller logger. Ingen diagnosegrupper, konkrete saker, små eller sårbare segmenter, produksjonsdata eller fritekst som kan beskrive enkeltsaker.
- **Tilgangsstyring:** Least privilege. Tilgang gis til avgrensede interne roller. MVP-en skal ikke ha produksjonsintegrasjoner og trenger derfor ikke outbound `accessPolicy` mot fagsystemer.
- **Personvern:** Teamet vurderer at DPIA sannsynligvis ikke utløses for MVP så lenge datagrensene holdes og løsningen ikke behandler personopplysninger, helseopplysninger, saksdata eller profilering av sårbare grupper. Dette er ikke en ferdig konklusjon og må bekreftes med juridisk, personvern og sikkerhetschampion før eventuell produksjonsdeploy. Hvis grensene senere utvides, må det gjøres ny vurdering.
- **Logging:** Kun strukturert teknisk logging uten innhold fra forslag, fritekstnotater eller personrelatert materiale. Auditlogg i CEF er ikke nødvendig i MVP fordi appen ikke skal vise personopplysninger. Hvis dette endres, må auditlogg på plass før bruk.

### Plattform (Nais/GCP)

- **Infrastrukturkrav:** Nais-app for intern bruk. Cloud SQL for Postgres er aktuelt når datalaget deployes, se ADR-003. Ingen Kafka, Redis eller bucket i MVP med mindre et konkret behov oppstår og dokumenteres.
- **Ressursbehov:** Lavt. Appen kan starte med standard requests og minnegrense. Ingen CPU-limits.
- **Observerbarhet:** Strukturert logging, grunnleggende helsesjekker og enkel metrikk for sidevisninger og statusfordeling. Ingen logging av innholdsfelt.
- **CI/CD-endringer:** Eget repo med standard GitHub Actions, deploy til dev først, senere prod når governance og tilgang er klare.
- **CODEOWNERS:** Eget CODEOWNERS fra første commit for appkode, innholdsstruktur og beslutningsdokumentasjon.

### Team og organisasjon

- **Berørte team:** Team eSyfo, produkteiere for oppfølgingsplan og senere berørte kontaktflater, samt sikkerhet/personvern/juridisk ved behov.
- **Architecture Advice:** Utkast til ADR bør deles med berørte produkteiere og relevante fagroller før repoet opprettes. Team eSyfo eier beslutningen.
- **Migrasjonsstrategi:** Ingen teknisk migrering i MVP. Arbeidet starter grønt i nytt repo.
- **Tilbakerulling:** Enkelt. Appen kan tas ned uten effekt på produksjon fordi MVP-en ikke skal integrere mot produksjonssystemer.
- **Tidsramme:** Fase 0 nå. Tiltakspakke 1 kan først besluttes når MVP-kriterier og governance er oppfylt.

## Konsekvenser

### Positive

- Dulting-studio får tydelig mandat og egen produktflate.
- Arkitektur, tilgang og governance kan formes for intern beslutningsstøtte fra start.
- Teamet unngår å binde satsingen til oppfølgingsplan-repoet eller GitHub Pages-formatet.
- SQL-migrasjoner, eksportbare beslutningsgrunnlag og pull requests gjør vurderinger enkle å se over og kvalitetssikre.

### Negative

- Nytt repo gir mer oppstartsarbeid.
- Flere repos gir litt mer forvaltningskostnad.
- Et app- og databasedrevet datalag kan bli tungvint hvis teamet senere prøver å bruke appen som driftsverktøy eller bred dataplattform.

### Risiko

| Risiko | Sannsynlighet | Konsekvens | Mitigering |
|--------|--------------|------------|-----------|
| MVP-en glir over i admin-app | Middels | Høy | Lås MVP-en til beslutningsstøtte, dataminimert datalag og tydelige ikke-mål |
| Fritekst brukes til å beskrive enkeltsaker | Middels | Høy | Validering, tydelige skrivefeltgrenser og manuell review i pull request |
| Uklare roller stopper beslutninger | Middels | Middels | Definer beslutningseier, veto-roller og statusflyt før første eksperiment |
| For sterk kobling til første case | Middels | Middels | Modellér oppfølgingsplan som første case, ikke som hele produktet |

## Aksjonspunkter

- [ ] Bekreft beslutning om eget repo og egen app i teamet (eier: Team eSyfo, frist: TBD)
- [ ] Pek ut beslutningseier og veto-roller på rollenivå (eier: produktledelse, frist: TBD)
- [ ] Opprett repo med CODEOWNERS, README og standard Nais-oppsett (eier: teamet, frist: TBD)
- [ ] Beskriv datamodell, statusflyt og valideringsregler før første implementasjon (eier: teamet, frist: TBD)
- [ ] Del ADR-utkastet med berørte produkteiere og sikkerhet/personvern for råd (eier: teamet, frist: TBD)
