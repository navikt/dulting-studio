"use client";

import { ArrowLeftIcon, FloppydiskIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  Checkbox,
  Heading,
  HStack,
  Loader,
  Select,
  Tag,
  Textarea,
  TextField,
  VStack,
} from "@navikt/ds-react";
import NextLink from "next/link";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  aktor: "ag" | "sm";
  title: string;
  steg: string;
  innsats: number;
  effekt: number;
  tier: string;
  kjerne: boolean;
  hypotese: string[];
  blokkertAv: string | null;
  guardrail: string | null;
  forgood: string | null;
  toveis: string | null;
  hvorfor: string | null;
  updatedBy: string;
  version: number;
};

const AKTOR_LABEL: Record<string, string> = {
  ag: "Arbeidsgiver",
  sm: "Den sykmeldte",
};
const TIERS = [
  { value: "pakke1", label: "Pakke 1" },
  { value: "vurder", label: "Vurderes" },
  { value: "senere", label: "Senere" },
];

export function TiltakEditor() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pakke-tiltak")
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d) => setRows(d.tiltak))
      .catch(() =>
        setError("Kunne ikke laste tiltak. Er databasen tilgjengelig?"),
      );
  }, []);

  function patch(id: string, change: Partial<Row>) {
    setRows((prev) =>
      prev ? prev.map((r) => (r.id === id ? { ...r, ...change } : r)) : prev,
    );
    setSavedId(null);
  }

  async function save(row: Row) {
    setSavingId(row.id);
    setSavedId(null);
    setError(null);
    try {
      const res = await fetch("/api/pakke-tiltak", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { tiltak } = await res.json();
      setRows((prev) =>
        prev ? prev.map((r) => (r.id === row.id ? tiltak : r)) : prev,
      );
      setSavedId(row.id);
    } catch {
      setError(`Klarte ikke lagre ${row.id}.`);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <VStack gap="space-24" className="tu">
      <VStack gap="space-20" className="kidult-reference-header">
        <HStack gap="space-12" align="center" wrap>
          <Button
            as={NextLink}
            href="/tiltakspakke-utvelgelse"
            variant="tertiary-neutral"
            size="small"
            icon={<ArrowLeftIcon aria-hidden />}
          >
            Tilbake til utvelgelsen
          </Button>
        </HStack>
        <VStack gap="space-4">
          <HStack gap="space-8" wrap>
            <Tag variant="info" size="small">
              Rediger
            </Tag>
            <Tag variant="warning" size="small">
              Team-delt · lagres i database
            </Tag>
          </HStack>
          <Heading level="1" size="large">
            Kalibrer og bearbeid tiltakene
          </Heading>
          <BodyShort>
            Endringer her deles med hele teamet og brukes i
            utvelgelses-matrisen. Juster effekt/innsats, plassering (tier) og
            tekst per tiltak.
          </BodyShort>
        </VStack>
      </VStack>

      {error && <Alert variant="warning">{error}</Alert>}

      {rows === null && !error && (
        <HStack justify="center" padding="space-32">
          <Loader size="large" title="Laster tiltak …" />
        </HStack>
      )}

      {rows && (
        <VStack gap="space-12" className="tu-editor">
          {rows
            .slice()
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((r) => (
              <div key={r.id} className={`tu-edit-row tu-edit-row--${r.aktor}`}>
                <HStack
                  gap="space-8"
                  align="center"
                  wrap
                  justify="space-between"
                >
                  <HStack gap="space-8" align="center" wrap>
                    <span
                      className={`tu-forslag__id tu-forslag__id--${r.aktor}`}
                    >
                      {r.id}
                    </span>
                    <BodyShort size="small" className="muted">
                      {AKTOR_LABEL[r.aktor]} · {r.steg}
                    </BodyShort>
                  </HStack>
                  <BodyShort size="small" className="muted">
                    v{r.version} · sist: {r.updatedBy}
                  </BodyShort>
                </HStack>

                <TextField
                  label="Tittel"
                  size="small"
                  value={r.title}
                  onChange={(e) => patch(r.id, { title: e.target.value })}
                />

                <HStack gap="space-12" wrap>
                  <Select
                    label="Effekt"
                    size="small"
                    value={String(r.effekt)}
                    onChange={(e) =>
                      patch(r.id, { effekt: Number(e.target.value) })
                    }
                  >
                    <option value="1">1 · lav</option>
                    <option value="2">2 · middels</option>
                    <option value="3">3 · høy</option>
                  </Select>
                  <Select
                    label="Innsats"
                    size="small"
                    value={String(r.innsats)}
                    onChange={(e) =>
                      patch(r.id, { innsats: Number(e.target.value) })
                    }
                  >
                    <option value="1">1 · lav</option>
                    <option value="2">2 · middels</option>
                    <option value="3">3 · høy</option>
                  </Select>
                  <Select
                    label="Plassering"
                    size="small"
                    value={r.tier}
                    onChange={(e) => patch(r.id, { tier: e.target.value })}
                  >
                    {TIERS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                  <div className="tu-edit-row__kjerne">
                    <Checkbox
                      checked={r.kjerne}
                      onChange={(e) =>
                        patch(r.id, { kjerne: e.target.checked })
                      }
                    >
                      Kjernetiltak
                    </Checkbox>
                  </div>
                </HStack>

                <Textarea
                  label="Hvorfor (begrunnelse)"
                  size="small"
                  minRows={2}
                  value={r.hvorfor ?? ""}
                  onChange={(e) => patch(r.id, { hvorfor: e.target.value })}
                />

                <HStack gap="space-8" align="center">
                  <Button
                    size="small"
                    variant="secondary"
                    loading={savingId === r.id}
                    icon={<FloppydiskIcon aria-hidden />}
                    onClick={() => save(r)}
                  >
                    Lagre
                  </Button>
                  {savedId === r.id && (
                    <BodyShort size="small" className="tu-edit-row__saved">
                      Lagret ✓
                    </BodyShort>
                  )}
                </HStack>
              </div>
            ))}
        </VStack>
      )}
    </VStack>
  );
}
