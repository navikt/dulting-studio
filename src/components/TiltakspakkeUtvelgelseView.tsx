"use client";

import {
  ArrowLeftIcon,
  CheckmarkCircleIcon,
  ExclamationmarkTriangleIcon,
} from "@navikt/aksel-icons";
import {
  Link as AkselLink,
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Detail,
  Dialog,
  Heading,
  HStack,
  Tag,
  ToggleGroup,
  VStack,
} from "@navikt/ds-react";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import {
  type Aktor,
  aktorLabel,
  avvikFraModell,
  bangForBuck,
  effektLabels,
  hypoteseLabel,
  innsatsLabels,
  type KrId,
  krDekning,
  krFor,
  krGradertNote,
  krKort,
  krLabels,
  krMerknad,
  krUtkastNote,
  type Niva,
  pakke1,
  pakke1Kriterier,
  pakke1Ramme,
  prioritert,
  type SelectionTiltak,
  selectionTiltak,
  type Tier,
  tiltakAt,
  utkastNote,
} from "@/lib/tiltakspakke-utvelgelse-model";
import { AnalyseNav } from "./AnalyseNav";

type View = Aktor | "begge";

/** Felter fra DB-raden vi bryr oss om (superset av modellfeltene + version/updatedBy). */
type DbRow = {
  id: string;
  tier: Tier;
  effekt: Niva;
  innsats: Niva;
  kjerne: boolean;
  version: number;
  updatedBy: string;
};

const EFFEKT: Niva[] = [3, 2, 1];
const INNSATS: Niva[] = [1, 2, 3];

/** «Gjør først»-sonen: høy effekt relativt til innsats (effekt − innsats ≥ 1). */
function erGjorForst(innsats: Niva, effekt: Niva) {
  return effekt - innsats >= 1;
}

const tierStatus: Record<SelectionTiltak["tier"], string> = {
  pakke1: "Foreslått i pakke 1",
  vurder: "Vurderes",
  senere: "Senere",
};

function Chip({ t }: { t: SelectionTiltak }) {
  return (
    <TiltakDetailTag
      t={t}
      className={`tu__chip tu__chip--${t.aktor} tu__chip--${t.tier}${
        t.blokkertAv ? " tu__chip--blokkert" : ""
      } tu__chip--btn`}
    >
      {t.tier === "pakke1" && (
        <CheckmarkCircleIcon aria-hidden className="tu__chip-ic" />
      )}
      {t.blokkertAv && (
        <ExclamationmarkTriangleIcon aria-hidden className="tu__chip-ic" />
      )}
      <b>{t.id}</b> {t.title}
      {t.toveis && (
        <span className="tu__chip-link" aria-hidden>
          ↔
        </span>
      )}
    </TiltakDetailTag>
  );
}

function ForslagItem({ t }: { t: SelectionTiltak }) {
  return (
    <li className="tu-forslag__row">
      <span className={`tu-forslag__id tu-forslag__id--${t.aktor}`}>
        {t.id}
      </span>
      <span>
        <b>{t.title}</b>
        {t.hvorfor && <em> — {t.hvorfor}</em>}
        <span className="tu-forslag__meta">
          {t.hypotese?.map((h) => (
            <span key={h} className="tu-forslag__hyp" title={hypoteseLabel[h]}>
              {h}
            </span>
          ))}
          {t.toveis && <span className="tu-forslag__toveis">↔ {t.toveis}</span>}
        </span>
        {t.guardrail && (
          <span className="tu-forslag__guard">Guardrail: {t.guardrail}</span>
        )}
        {t.blokkertAv && (
          <span className="tu-forslag__blokkert">
            <ExclamationmarkTriangleIcon aria-hidden /> {t.blokkertAv}
          </span>
        )}
      </span>
    </li>
  );
}

/** Klikkbar tiltakskode → Aksel-dialog med full kontekst. Gjenbruker
 *  dult-ref-dialog__meta-stilen, og samme dialog-mønster som DultRefTag. */
function TiltakDetailTag({
  t,
  className,
  children,
}: {
  t: SelectionTiltak;
  className?: string;
  children: React.ReactNode;
}) {
  const bang = bangForBuck(t);
  const krs = krFor(t.id);
  return (
    <Dialog>
      <Dialog.Trigger>
        <button
          type="button"
          className={className}
          aria-label={`Vis detaljer for ${t.id}: ${t.title}`}
        >
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Header>
          <Detail uppercase>
            {t.id} · {aktorLabel[t.aktor]}
          </Detail>
          <Dialog.Title>{t.title}</Dialog.Title>
          <Dialog.Description>
            {t.steg} · {tierStatus[t.tier]}
            {t.kjerne ? " · kjerne" : ""}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <dl className="dult-ref-dialog__meta">
            <div>
              <dt>Effekt × innsats</dt>
              <dd>
                {effektLabels[t.effekt]} / {innsatsLabels[t.innsats]} · bang{" "}
                {bang >= 1 ? bang.toFixed(1) : bang.toFixed(2)}
              </dd>
            </div>
            {krs.length > 0 && (
              <div>
                <dt>Overordnet mål</dt>
                <dd>{krs.map((k) => krLabels[k]).join(" · ")}</dd>
              </div>
            )}
            {t.hypotese && t.hypotese.length > 0 && (
              <div>
                <dt>Virkningshypotese</dt>
                <dd>
                  {t.hypotese
                    .map((h) => `${h}: ${hypoteseLabel[h]}`)
                    .join(" · ")}
                </dd>
              </div>
            )}
            {t.hvorfor && (
              <div>
                <dt>Hvorfor</dt>
                <dd>{t.hvorfor}</dd>
              </div>
            )}
            {t.toveis && (
              <div>
                <dt>Toveis kobling</dt>
                <dd>↔ {t.toveis}</dd>
              </div>
            )}
            {t.guardrail && (
              <div>
                <dt>Guardrail</dt>
                <dd>{t.guardrail}</dd>
              </div>
            )}
            {t.forgood && (
              <div>
                <dt>Etisk merknad (FORGOOD)</dt>
                <dd>{t.forgood}</dd>
              </div>
            )}
            {t.blokkertAv && (
              <div>
                <dt>Åpen avklaring</dt>
                <dd>{t.blokkertAv}</dd>
              </div>
            )}
          </dl>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseTrigger>
            <Button variant="secondary" size="small">
              Lukk
            </Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  );
}

const KR_ORDER: KrId[] = ["KR1", "KR2", "KR3", "KR4", "KR5"];
/** Høyest mulige bang for the buck (effekt 3 / innsats 1) — skalerer baren. */
const MAX_BANG = 3;

function BangRad({
  t,
  editMode,
  onTier,
}: {
  t: SelectionTiltak;
  editMode: boolean;
  onTier: (id: string, tier: Tier) => void;
}) {
  const bang = bangForBuck(t);
  const krs = krFor(t.id);
  return (
    <tr className={`tu-rang__row tu-rang__row--${t.tier}`}>
      <th scope="row" className="tu-rang__idcell">
        <span className="tu-rang__idinner">
          <TiltakDetailTag
            t={t}
            className={`tu-forslag__id tu-forslag__id--${t.aktor} tu-codebtn`}
          >
            {t.id}
          </TiltakDetailTag>
          <span className="tu-rang__title">{t.title}</span>
          <span className="tu-sr">— {tierStatus[t.tier]}</span>
        </span>
      </th>
      <td className="tu-rang__bangcell">
        <span className="tu-rang__banginner">
          <span className="tu-rang__bar" aria-hidden>
            <span
              className={`tu-rang__barfill tu-rang__barfill--${t.aktor}`}
              style={{ width: `${(bang / MAX_BANG) * 100}%` }}
            />
          </span>
          <b className="tu-rang__bangnum">
            {bang >= 1 ? bang.toFixed(1) : bang.toFixed(2)}
          </b>
        </span>
      </td>
      <td className="tu-rang__ei">
        E{t.effekt} / I{t.innsats}
      </td>
      <td className="tu-rang__krcell">
        <span className="tu-rang__krinner">
          {krs.length === 0 ? (
            <span className="muted">—</span>
          ) : (
            krs.map((k) => (
              <span key={k} className="tu-krchip" title={krLabels[k]}>
                {krKort[k]}
              </span>
            ))
          )}
        </span>
      </td>
      {editMode && (
        <td className="tu-rang__tiercell">
          <select
            className="tu-tier-select"
            aria-label={`Plassering for ${t.id} ${t.title}`}
            value={t.tier}
            onChange={(e) => onTier(t.id, e.target.value as Tier)}
          >
            <option value="pakke1">Pakke 1</option>
            <option value="vurder">Vurder</option>
            <option value="senere">Senere</option>
          </select>
        </td>
      )}
    </tr>
  );
}

function KrRad({ kr, tiltak }: { kr: KrId; tiltak: SelectionTiltak[] }) {
  const iPakke1 = tiltak.filter((t) => t.tier === "pakke1");
  const status =
    iPakke1.length > 0
      ? { cls: "ok", label: `I pakke 1 (${iPakke1.length})` }
      : tiltak.length > 0
        ? { cls: "gap", label: "Utenfor pakke 1" }
        : { cls: "none", label: "Ikke dekket" };
  return (
    <div className={`tu-mal__row tu-mal__row--${status.cls}`}>
      <div className="tu-mal__head">
        <span className="tu-mal__krcode">{kr}</span>
        <span className="tu-mal__krlabel">{krLabels[kr]}</span>
        <span className={`tu-mal__status tu-mal__status--${status.cls}`}>
          {status.label}
        </span>
      </div>
      <div className="tu-mal__tiltak">
        {tiltak.length === 0 ? (
          <span className="muted">
            Ingen tiltak i dette sporet treffer dette målet.
          </span>
        ) : (
          tiltak.map((t) => (
            <TiltakDetailTag
              key={t.id}
              t={t}
              className={`tu-krtag tu-krtag--${t.tier} tu-codebtn`}
            >
              {t.id}
            </TiltakDetailTag>
          ))
        )}
      </div>
      {krMerknad[kr] && (
        <BodyShort size="small" className="muted tu-mal__merknad">
          {krMerknad[kr]}
        </BodyShort>
      )}
    </div>
  );
}

export function TiltakspakkeUtvelgelseView() {
  const [view, setView] = useState<View>("ag");
  const [editMode, setEditMode] = useState(false);
  const [tiltak, setTiltak] = useState<SelectionTiltak[]>(() =>
    selectionTiltak.map((t) => ({ ...t })),
  );
  // Lukk loopen, trygt: modellen er alltid autoritativ (riktig sett + grunninnhold).
  // DB-en legger bare på EKTE team-redigeringer (updatedBy != "seed"), så en utdatert
  // seed er ufarlig. Feiler DB → behold modellen (klient-side what-if).
  const [persistEnabled, setPersistEnabled] = useState(false);
  const [versions, setVersions] = useState<Record<string, number>>({});
  // hvem som sist endret hvert tiltak (kun ekte team-redigeringer, ikke seed)
  const [redigertAv, setRedigertAv] = useState<Record<string, string>>({});
  const [saveMsg, setSaveMsg] = useState("");
  const aktorFilter = view === "begge" ? undefined : view;
  const valgte = pakke1(aktorFilter, tiltak);
  const kjerne = valgte.filter((t) => t.kjerne);
  const stotte = valgte.filter((t) => !t.kjerne);
  const rangert = prioritert(aktorFilter, tiltak);
  const dekning = krDekning(aktorFilter, tiltak);
  // avvik mot den kalibrerte modellen (baseline) — kjernen i datasikkerheten
  const avvik = avvikFraModell(tiltak);

  useEffect(() => {
    let aktiv = true;
    fetch("/api/pakke-tiltak")
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { tiltak?: DbRow[] }) => {
        if (!aktiv || !Array.isArray(d.tiltak)) return;
        const byId = new Map(d.tiltak.map((r) => [r.id, r]));
        setVersions(Object.fromEntries(d.tiltak.map((r) => [r.id, r.version])));
        setRedigertAv(
          Object.fromEntries(
            d.tiltak
              .filter((r) => r.updatedBy && r.updatedBy !== "seed")
              .map((r) => [r.id, r.updatedBy]),
          ),
        );
        setTiltak((prev) =>
          prev.map((m) => {
            const r = byId.get(m.id);
            // overlay BARE ekte redigeringer (ikke seed) på kjente tiltak
            return r && r.updatedBy !== "seed"
              ? {
                  ...m,
                  tier: r.tier,
                  effekt: r.effekt,
                  innsats: r.innsats,
                  kjerne: r.kjerne,
                }
              : m;
          }),
        );
        setPersistEnabled(true);
      })
      .catch(() => {
        /* DB utilgjengelig → behold modellen (what-if). Visningen er trygg. */
      });
    return () => {
      aktiv = false;
    };
  }, []);

  function setTier(id: string, tier: Tier) {
    setTiltak((prev) => prev.map((t) => (t.id === id ? { ...t, tier } : t)));
    if (!persistEnabled) return; // klient-side what-if — ingen lagring
    const t = tiltak.find((x) => x.id === id);
    if (!t) return;
    setSaveMsg(`Lagrer ${id} …`);
    fetch("/api/pakke-tiltak", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, tier, version: versions[id] }),
    })
      .then((r) => r.json().then((d) => ({ status: r.status, d })))
      .then(({ status, d }) => {
        const saved = d?.tiltak as (DbRow & { updatedBy: string }) | undefined;
        if (status === 409 && saved) {
          // noen andre lagret i mellomtiden — ta inn deres verdi
          setTiltak((prev) =>
            prev.map((x) =>
              x.id === id
                ? {
                    ...x,
                    tier: saved.tier,
                    effekt: saved.effekt,
                    innsats: saved.innsats,
                    kjerne: saved.kjerne,
                  }
                : x,
            ),
          );
          setVersions((v) => ({ ...v, [id]: saved.version }));
          setRedigertAv((p) => ({ ...p, [id]: saved.updatedBy }));
          setSaveMsg(`${id}: en annen lagret nettopp — viser deres verdi.`);
          return;
        }
        if (saved) {
          setVersions((v) => ({ ...v, [id]: saved.version }));
          setRedigertAv((p) => ({ ...p, [id]: saved.updatedBy }));
          setSaveMsg(`${id} lagret · ${saved.updatedBy}`);
        } else {
          setSaveMsg(`${id}: kunne ikke lagre (beholdt lokalt).`);
        }
      })
      .catch(() => setSaveMsg(`${id}: kunne ikke lagre (beholdt lokalt).`));
  }
  function resetPakke() {
    const diverging = avvikFraModell(tiltak);
    setTiltak(selectionTiltak.map((t) => ({ ...t })));
    if (!persistEnabled || diverging.length === 0) {
      setRedigertAv({});
      setSaveMsg("");
      return;
    }
    // skriv modell-verdiene tilbake til DB for de tiltakene som avvek
    setSaveMsg("Tilbakestiller til kalibrert modell …");
    const byId = new Map(selectionTiltak.map((t) => [t.id, t]));
    Promise.allSettled(
      diverging.map((d) =>
        fetch("/api/pakke-tiltak", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...byId.get(d.id), version: versions[d.id] }),
        }),
      ),
    ).then(() => {
      setRedigertAv({});
      setSaveMsg("Tilbakestilt til kalibrert modell.");
    });
  }

  return (
    <VStack gap="space-24" className="tu">
      <VStack gap="space-20" className="kidult-reference-header">
        <HStack gap="space-12" align="center" wrap>
          <Button
            as={NextLink}
            href="/"
            variant="tertiary-neutral"
            size="small"
            icon={<ArrowLeftIcon aria-hidden />}
          >
            Forsiden
          </Button>
        </HStack>
        <AnalyseNav />

        <Box background="info-soft" borderRadius="12" padding="space-24">
          <VStack gap="space-12">
            <HStack gap="space-8" wrap>
              <Tag variant="info" size="small">
                Utvelgelse
              </Tag>
              <Tag variant="neutral" size="small">
                Effekt × innsats · første tiltakspakke
              </Tag>
            </HStack>
            <VStack gap="space-4">
              <Heading level="1" size="large">
                Hvilke tiltak skal med i første pakke?
              </Heading>
              <BodyLong>
                De bearbeidede tiltakene er plassert etter forventet{" "}
                <strong>effekt</strong> og <strong>innsats</strong>. Øvre
                venstre — der effekten er høy i forhold til innsatsen — er «gjør
                først». Alle tiltak vises; de uthevede er forslaget til pakke 1,
                de nedtonede venter. Forslaget samler seg om det høyeste
                løftepunktet: stillheten før 4-ukers-fristen.{" "}
                <strong>Klikk en tiltak-kode</strong> (her, i rangeringen eller
                måldekningen) for full forklaring.
              </BodyLong>
            </VStack>
            <ToggleGroup
              label="Velg spor"
              value={view}
              onChange={(v) => setView(v as View)}
              data-color="neutral"
              size="small"
            >
              <ToggleGroup.Item value="ag" label="Arbeidsgiver" />
              <ToggleGroup.Item value="sm" label="Den sykmeldte" />
              <ToggleGroup.Item value="begge" label="Begge" />
            </ToggleGroup>
            <HStack gap="space-8" wrap align="center">
              <Button
                variant={editMode ? "primary" : "secondary"}
                size="small"
                onClick={() => setEditMode((v) => !v)}
                aria-pressed={editMode}
              >
                {editMode ? "Ferdig" : "Bygg pakke (live)"}
              </Button>
              {editMode && (
                <Button variant="tertiary" size="small" onClick={resetPakke}>
                  Nullstill
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>
      </VStack>

      <Alert variant="info" size="small">
        {utkastNote}{" "}
        <AkselLink as={NextLink} href="/tiltakspakke-utvelgelse/rediger">
          Rediger og kalibrer tiltakene (team-delt) →
        </AkselLink>
      </Alert>

      {editMode && (
        <Alert variant={persistEnabled ? "info" : "warning"} size="small">
          {persistEnabled ? (
            <>
              <strong>Bygg pakke (lagres)</strong> — endringer lagres og deles
              med teamet. Juster i <strong>«Plassering»</strong>-kolonnen i
              rangerings-tabellen lenger ned; matrise, måldekning, bang og
              forslag oppdateres live.
            </>
          ) : (
            <>
              <strong>Live what-if</strong> — databasen er ikke tilgjengelig, så
              endringer er midlertidige. Juster i <strong>«Plassering»</strong>
              -kolonnen i rangerings-tabellen lenger ned; alt oppdateres live.
            </>
          )}
          <span className="tu-save-status muted" aria-live="polite">
            {saveMsg}
          </span>
        </Alert>
      )}

      <HStack gap="space-8" wrap>
        <Tag variant="success" size="small">
          {valgte.length} foreslått i pakke 1
        </Tag>
        <Tag variant="neutral" size="small">
          {kjerne.length} kjerne · {stotte.length} støtte
        </Tag>
        <Tag variant="warning" size="small">
          {valgte.filter((t) => t.blokkertAv).length} med åpen avklaring
        </Tag>
      </HStack>

      {avvik.length === 0 ? (
        <Alert variant="success" size="small" className="tu-avvik tu-avvik--ok">
          Samsvarer med teamets kalibrerte baseline — settet og rekkefølgen er
          slik vi sist kalibrerte dem (effekt/innsats-skårene er fortsatt
          utkast).
        </Alert>
      ) : (
        <Alert variant="warning" size="small" className="tu-avvik">
          <HStack gap="space-12" align="center" wrap justify="space-between">
            <span>
              <strong>
                {avvik.length} tiltak avviker fra den kalibrerte modellen.
              </strong>{" "}
              {persistEnabled
                ? "Dette er lagrede team-endringer."
                : "Dette er en lokal what-if (ikke lagret)."}
            </span>
            <Button variant="secondary" size="xsmall" onClick={resetPakke}>
              Tilbakestill til kalibrert
            </Button>
          </HStack>
          <ul className="tu-avvik__liste">
            {avvik.map((t) => {
              const m = selectionTiltak.find((x) => x.id === t.id);
              const tierEndret = m && m.tier !== t.tier;
              const av = redigertAv[t.id];
              return (
                <li key={t.id}>
                  <b>{t.id}</b> {t.title} —{" "}
                  {tierEndret && m
                    ? `${tierStatus[m.tier]} → ${tierStatus[t.tier]}`
                    : "effekt/innsats endret fra baseline"}
                  {av ? ` · endret av ${av}` : ""}
                </li>
              );
            })}
          </ul>
        </Alert>
      )}

      <section
        className="tu-scroll"
        aria-label="Effekt × innsats-matrise — bla horisontalt ved behov"
      >
        <table className="tu-matrix">
          <caption className="tu-matrix__caption">
            Effekt (rad) mot innsats (kolonne) for{" "}
            {view === "begge" ? "begge spor" : aktorLabel[view].toLowerCase()}.
            Øvre venstre = høy effekt i forhold til innsats.
          </caption>
          <thead>
            <tr>
              <td className="tu-matrix__corner" aria-hidden />
              {INNSATS.map((i) => (
                <th key={i} scope="col" className="tu-matrix__colhead">
                  {innsatsLabels[i]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EFFEKT.map((e) => (
              <tr key={e}>
                <th scope="row" className="tu-matrix__rowhead">
                  {effektLabels[e]}
                </th>
                {INNSATS.map((i) => {
                  const cell = tiltakAt(i, e, aktorFilter, tiltak);
                  return (
                    <td
                      key={i}
                      className={`tu-matrix__cell${
                        erGjorForst(i, e) ? " tu-matrix__cell--first" : ""
                      }`}
                    >
                      {erGjorForst(i, e) && cell.length === 0 && (
                        <span className="tu-matrix__zone">Gjør først</span>
                      )}
                      {cell.map((t) => (
                        <Chip key={t.id} t={t} />
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <HStack gap="space-16" wrap className="tu-legend">
        <span className="tu-legend__item">
          <i className="tu-legend__sw tu-legend__sw--ag" aria-hidden />
          Arbeidsgiver (T-tiltak)
        </span>
        <span className="tu-legend__item">
          <i className="tu-legend__sw tu-legend__sw--sm" aria-hidden />
          Den sykmeldte (ST-tiltak)
        </span>
        <span className="tu-legend__item">
          <CheckmarkCircleIcon aria-hidden /> Foreslått i pakke 1
        </span>
        <span className="tu-legend__item">
          <ExclamationmarkTriangleIcon aria-hidden /> Åpen avklaring / blokkert
        </span>
        <span className="tu-legend__item">
          <i className="tu-legend__sw tu-legend__sw--senere" aria-hidden />
          Nedtonet = senere (ikke i denne pakken)
        </span>
        <span className="tu-legend__item">↔ Toveis kobling</span>
      </HStack>

      <Box
        className="tu-forslag"
        borderWidth="1"
        borderRadius="12"
        padding="space-24"
      >
        <VStack gap="space-16">
          <VStack gap="space-4">
            <Heading level="2" size="medium">
              Forslag: Tiltakspakke 1
            </Heading>
            <BodyShort size="small" className="muted">
              Konsentrert om tidlig signal + behovsvurdering — fra begge sider,
              før uke 4. Et utgangspunkt for kalibrering.
            </BodyShort>
          </VStack>

          <BodyShort size="small" className="tu-ramme">
            {pakke1Ramme}
          </BodyShort>

          <div className="tu-forslag__cols">
            <div>
              <Heading level="3" size="xsmall">
                Kjerne — bærer pakken
              </Heading>
              <ul className="tu-forslag__list">
                {kjerne.map((t) => (
                  <ForslagItem key={t.id} t={t} />
                ))}
              </ul>
            </div>
            <div>
              <Heading level="3" size="xsmall">
                Støtte — billig forsterker
              </Heading>
              <ul className="tu-forslag__list">
                {stotte.map((t) => (
                  <ForslagItem key={t.id} t={t} />
                ))}
                {stotte.length === 0 && (
                  <li className="tu-forslag__row muted">
                    Ingen rene støttetiltak i dette sporet.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <VStack gap="space-4">
            <Heading level="3" size="xsmall">
              Vurdert mot disse kriteriene
            </Heading>
            <ol className="tu-kriterier">
              {pakke1Kriterier.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ol>
            <BodyShort size="small" className="muted">
              Hypotese-merkene viser hvilken virkningshypotese hvert tiltak
              lader opp til: <b>H1</b> {hypoteseLabel.H1.toLowerCase()},{" "}
              <b>H2</b> {hypoteseLabel.H2.toLowerCase()}.
            </BodyShort>
          </VStack>
        </VStack>
      </Box>

      <Box
        className="tu-prio"
        borderWidth="1"
        borderRadius="12"
        padding="space-24"
      >
        <VStack gap="space-20">
          <VStack gap="space-4">
            <Heading level="2" size="medium">
              Prioritering: bang for the buck × måldekning
            </Heading>
            <BodyShort size="small" className="muted">
              Kombinerer effektivitet (effekt ÷ innsats) med hvilke overordnede
              mål (KR) hvert tiltak lader opp til — så vi ser hva pakke 1
              dekker, og hva den bevisst lar stå åpent.
            </BodyShort>
          </VStack>

          <VStack gap="space-8">
            <Heading level="3" size="xsmall">
              Bang for the buck —{" "}
              {view === "begge" ? "begge spor" : aktorLabel[view].toLowerCase()}
            </Heading>
            <div className="tu-scroll">
              <table className="tu-rang">
                <caption className="tu-sr">
                  Tiltak sortert etter effekt delt på innsats, synkende. Uthevet
                  rad = foreslått i pakke 1.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Tiltak</th>
                    <th scope="col" aria-sort="descending">
                      Effekt ÷ innsats
                    </th>
                    <th scope="col">E / I</th>
                    <th scope="col">Overordnet mål</th>
                    {editMode && <th scope="col">Plassering</th>}
                  </tr>
                </thead>
                <tbody>
                  {rangert.map((t) => (
                    <BangRad
                      key={t.id}
                      t={t}
                      editMode={editMode}
                      onTier={setTier}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </VStack>

          <VStack gap="space-8">
            <Heading level="3" size="xsmall">
              Måldekning — hva pakke 1 treffer, og hullene
            </Heading>
            <div className="tu-mal">
              {KR_ORDER.map((kr) => (
                <KrRad key={kr} kr={kr} tiltak={dekning[kr]} />
              ))}
            </div>
            <Alert variant="warning" size="small">
              {krGradertNote}
            </Alert>
          </VStack>

          <BodyShort size="small" className="muted">
            {krUtkastNote}
          </BodyShort>
        </VStack>
      </Box>

      <Box borderWidth="1" borderRadius="8" padding="space-16">
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Slik henger det sammen
          </Heading>
          <BodyShort size="small">
            Utvelgelsen bygger på de samme tiltakene som i kartene — her sortert
            etter hva som bør med først:
          </BodyShort>
          <HStack gap="space-12" wrap>
            <AkselLink as={NextLink} href="/atferdsmatrise">
              Atferdsmatrise — hvorfor de virker
            </AkselLink>
            <AkselLink as={NextLink} href="/tiltakskart">
              Tiltakskart — arbeidsgiver
            </AkselLink>
            <AkselLink as={NextLink} href="/tiltakskart/sykmeldt">
              Tiltakskart — sykmeldt
            </AkselLink>
            <AkselLink as={NextLink} href="/brukerreise/sammen">
              Begge reiser side om side
            </AkselLink>
          </HStack>
        </VStack>
      </Box>

      <BodyShort size="small" className="muted">
        Kilde: bearbeidede tiltaksregistre (<code>T01–T14</code>,{" "}
        <code>ST01–ST12</code>) + <code>docs/dulting-scoping-status.md</code>.
        Effekt/innsats er et kalibrerbart utkast. Illustrativt og syntetisk.
      </BodyShort>
    </VStack>
  );
}
