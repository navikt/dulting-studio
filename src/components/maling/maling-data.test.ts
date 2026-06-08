import { describe, expect, it } from "vitest";
import {
  deltaForrigePeriode,
  erKausalKontekst,
  FUNNEL,
  guardrailOk,
  krSerie,
  krSerieForSegment,
  krStatus,
  LUMI_MAX,
  LUMI_SKALA,
  lumiPosisjon,
  mekanismeOk,
  PERIODER,
  parseSegmentParam,
  planHendelseById,
  SEGMENT_LABEL,
  STYRINGSTALL_FASTE,
  samletVerdikt,
  segmentToParam,
} from "./maling-data";

function forventetStyringstallForKr(id: "kr1" | "kr2" | "kr3") {
  if (id === "kr1") {
    return planHendelseById("opprettet").styringstall;
  }

  const styringstall = STYRINGSTALL_FASTE.find(
    (kandidat) => kandidat.id === id,
  );
  if (styringstall) {
    return styringstall;
  }

  throw new Error(`Mangler styringstall for ${id}`);
}

describe("segment-param", () => {
  it("parser gyldig respons-param", () => {
    expect(parseSegmentParam("respons:takket-ja")).toBe("takket-ja");
    expect(parseSegmentParam("respons:ikke-svart")).toBe("ikke-svart");
  });
  it("faller tilbake til 'alle' for null/ugyldig", () => {
    expect(parseSegmentParam(null)).toBe("alle");
    expect(parseSegmentParam("respons:tull")).toBe("alle");
    expect(parseSegmentParam("annet:ja")).toBe("alle");
  });
  it("serialiserer tilbake, 'alle' gir tom streng", () => {
    expect(segmentToParam("takket-ja")).toBe("respons:takket-ja");
    expect(segmentToParam("alle")).toBe("");
  });
  it("har lesbare etiketter", () => {
    expect(SEGMENT_LABEL["takket-ja"]).toBe("Takket ja");
  });
});

describe("funnel", () => {
  it("har behovsvurdering som pakke-only steg på index 1", () => {
    expect(FUNNEL[1]).toMatchObject({
      label: "Behovsvurdering",
      sub: "kun tiltakspakke",
      kontroll: null,
    });
  });

  it("har oppdatert siste steg-label", () => {
    expect(FUNNEL.at(-1)).toMatchObject({
      label: "Evaluerer og følger opp planen",
      sub: "valgt oppfølging",
    });
  });

  it("holder pakke-monotonitet for begge responsgrupper", () => {
    for (const segment of ["takket-ja", "ikke-svart"] as const) {
      for (let i = 1; i < FUNNEL.length; i++) {
        expect(FUNNEL[i - 1].pakke[segment]).toBeGreaterThanOrEqual(
          FUNNEL[i].pakke[segment],
        );
      }
    }
  });

  it("hopper over steg uten kontroll i kontroll-monotoniteten", () => {
    const kontrollSerie = FUNNEL.map((steg) => steg.kontroll).filter(
      (kontroll): kontroll is number => kontroll !== null,
    );

    for (let i = 1; i < kontrollSerie.length; i++) {
      expect(kontrollSerie[i - 1]).toBeGreaterThanOrEqual(kontrollSerie[i]);
    }
  });
});

describe("periode-delta", () => {
  it("regner differanse mot forrige periode", () => {
    expect(deltaForrigePeriode([30, 33, 36], 2)).toBe(3);
    expect(deltaForrigePeriode([30, 33, 36], 0)).toBe(0); // ingen forrige
  });
  it("har en uke-serie per KR med inneværende sist", () => {
    const s = krSerie("kr1");
    expect(s.length).toBe(PERIODER.length);
    expect(s.at(-1)).toBe(38); // matcher KR1 pakke-pool ved uke 4 (survival-kurve)
  });

  it("bruker samme serie for segmentet 'alle'", () => {
    for (const id of ["kr1", "kr2", "kr3"] as const) {
      const serieForAlle = krSerieForSegment(id, "alle");
      expect(serieForAlle).toEqual(krSerie(id));
      expect(serieForAlle).not.toBe(krSerie(id));
    }
  });

  it("returnerer segment-serier med samme lengde for alle segmenter", () => {
    for (const id of ["kr1", "kr2", "kr3"] as const) {
      for (const segment of ["alle", "takket-ja", "ikke-svart"] as const) {
        expect(krSerieForSegment(id, segment)).toHaveLength(krSerie(id).length);
      }
    }
  });

  it("lar responsgruppene ende på styringstallet og stige jevnt", () => {
    for (const id of ["kr1", "kr2", "kr3"] as const) {
      for (const segment of ["takket-ja", "ikke-svart"] as const) {
        const serie = krSerieForSegment(id, segment);
        expect(serie.at(-1)).toBe(
          forventetStyringstallForKr(id).metrikk.pakke[segment],
        );

        for (let i = 1; i < serie.length; i++) {
          expect(serie[i]).toBeGreaterThanOrEqual(serie[i - 1]);
        }
      }
    }
  });
});

describe("verdikt", () => {
  it("KR er på vei når margin >= terskel og trenden ikke faller", () => {
    expect(krStatus({ pakke: 56, kontroll: 34, forrigeDelta: 3 })).toBe(
      "paa-vei",
    );
  });
  it("følg-med ved liten margin eller fallende trend", () => {
    expect(krStatus({ pakke: 35, kontroll: 34, forrigeDelta: 2 })).toBe(
      "folg-med",
    );
    expect(krStatus({ pakke: 56, kontroll: 34, forrigeDelta: -2 })).toBe(
      "folg-med",
    );
  });
  it("ikke på vei når pakke ligger under kontroll", () => {
    expect(krStatus({ pakke: 30, kontroll: 34, forrigeDelta: 0 })).toBe(
      "ikke-paa-vei",
    );
  });
  it("samlet verdikt nedgraderes hvis mekanisme svikter (papir, ikke dult)", () => {
    const krer = ["paa-vei", "paa-vei", "paa-vei"] as const;
    expect(samletVerdikt(krer, { mekanismeOk: true, guardrailOk: true })).toBe(
      "paa-vei",
    );
    expect(samletVerdikt(krer, { mekanismeOk: false, guardrailOk: true })).toBe(
      "folg-med",
    );
  });
});

describe("lumi-skala", () => {
  it("bruker 1–5-skala (Lumi-native), via LUMI_MAX", () => {
    expect(LUMI_MAX).toBe(5);
    expect(LUMI_SKALA).toContain("1");
    expect(LUMI_SKALA).toContain("5");
  });
  it("plasserer score som prosent av 1..LUMI_MAX", () => {
    expect(lumiPosisjon(1)).toBe(0);
    expect(lumiPosisjon(3)).toBe(50);
    expect(lumiPosisjon(5)).toBe(100);
  });
});

describe("verdikt-vakter", () => {
  it("mekanismeOk: pakke må ligge minst MEKANISME_MARGIN (0.3) over kontroll", () => {
    expect(mekanismeOk(3.8, 3.0)).toBe(true); // gap 0.8 >= 0.3
    expect(mekanismeOk(3.05, 3.0)).toBe(false); // gap 0.05 < 0.3
  });
  it("guardrailOk: press (lavere=bedre) skal ikke øke mer enn PRESS_TOLERANSE (0)", () => {
    expect(guardrailOk(5, 6)).toBe(true); // press falt (5 - 6 = -1 <= 0)
    expect(guardrailOk(9, 6)).toBe(false); // press økte (9 - 6 = 3 > 0)
  });
});

describe("kausal kontekst", () => {
  it("er bare kausal for segmentet 'alle'", () => {
    expect(erKausalKontekst("alle")).toBe(true);
    expect(erKausalKontekst("takket-ja")).toBe(false);
    expect(erKausalKontekst("ikke-svart")).toBe(false);
  });
});
