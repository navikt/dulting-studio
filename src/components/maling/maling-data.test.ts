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
  PURRING_ANDEL,
  parseSegmentParam,
  planHendelseById,
  SEGMENT_LABEL,
  STYRINGSTALL_FASTE,
  samletVerdikt,
  segmentToParam,
  VARSEL_LEVERING,
  VARSEL_LEVERING_FORKLARING,
  VARSEL_VALG,
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
    expect(SEGMENT_LABEL["takket-ja"]).toBe("Ønsker påminnelse");
    expect(SEGMENT_LABEL["ikke-svart"]).toBe("Ikke svart");
  });
});

describe("funnel", () => {
  it("har behovsvurdering som pakke-only steg på index 1", () => {
    expect(FUNNEL[1]).toMatchObject({
      label: "Behovsvurdering",
      sub: "kun Ønsker påminnelse",
      kontroll: null,
      pakke: { "takket-ja": 88, "ikke-svart": null },
    });
  });

  it("har oppdatert siste steg-label", () => {
    expect(FUNNEL.at(-1)).toMatchObject({
      label: "Evaluerer og følger opp planen",
      sub: "valgt oppfølging",
    });
  });

  it("holder pakke-monotonitet og hopper over null i ikke-aktuelle steg", () => {
    for (const segment of ["takket-ja", "ikke-svart"] as const) {
      const serie = FUNNEL.map((steg) => steg.pakke[segment]).filter(
        (verdi): verdi is number => verdi !== null,
      );

      for (let i = 1; i < serie.length; i++) {
        expect(serie[i - 1]).toBeGreaterThanOrEqual(serie[i]);
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
    for (const id of ["kr1", "kr3"] as const) {
      const serieForAlle = krSerieForSegment(id, "alle");
      expect(serieForAlle).toEqual(krSerie(id));
      expect(serieForAlle).not.toBe(krSerie(id));
    }
  });

  it("lar KR2 bruke samme serie for 'alle' og 'takket-ja', men ikke for 'ikke-svart'", () => {
    const takketJaSerie = krSerieForSegment("kr2", "takket-ja");
    expect(krSerieForSegment("kr2", "alle")).toEqual(takketJaSerie);
    expect(krSerieForSegment("kr2", "ikke-svart")).toBeNull();
  });

  it("returnerer segment-serier med samme lengde når segmentet er aktuelt", () => {
    const kombinasjoner = [
      ["kr1", "alle"],
      ["kr1", "takket-ja"],
      ["kr1", "ikke-svart"],
      ["kr2", "alle"],
      ["kr2", "takket-ja"],
      ["kr3", "alle"],
      ["kr3", "takket-ja"],
      ["kr3", "ikke-svart"],
    ] as const;

    for (const [id, segment] of kombinasjoner) {
      expect(krSerieForSegment(id, segment)).toHaveLength(krSerie(id).length);
    }
  });

  it("lar responsgruppene ende på styringstallet og stige jevnt", () => {
    const kombinasjoner = [
      [
        "kr1",
        "takket-ja",
        forventetStyringstallForKr("kr1").metrikk.pakke["takket-ja"],
      ],
      [
        "kr1",
        "ikke-svart",
        forventetStyringstallForKr("kr1").metrikk.pakke["ikke-svart"],
      ],
      ["kr2", "takket-ja", 88],
      [
        "kr3",
        "takket-ja",
        forventetStyringstallForKr("kr3").metrikk.pakke["takket-ja"],
      ],
      [
        "kr3",
        "ikke-svart",
        forventetStyringstallForKr("kr3").metrikk.pakke["ikke-svart"],
      ],
    ] as const;

    for (const [id, segment, sluttverdi] of kombinasjoner) {
      const serie = krSerieForSegment(id, segment);
      expect(serie).not.toBeNull();
      if (!serie) {
        throw new Error(`Mangler serie for ${id}/${segment}`);
      }

      expect(serie.at(-1)).toBe(sluttverdi);

      for (let i = 1; i < serie.length; i++) {
        expect(serie[i]).toBeGreaterThanOrEqual(serie[i - 1]);
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
  it("bruker bare trend når kontroll ikke er aktuelt", () => {
    expect(krStatus({ pakke: 88, kontroll: null, forrigeDelta: 4 })).toBe(
      "paa-vei",
    );
    expect(krStatus({ pakke: 88, kontroll: null, forrigeDelta: -1 })).toBe(
      "folg-med",
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

describe("styringstall og varseldata", () => {
  it("har nullable KR2-metrikk bare for kontroll og 'ikke-svart'", () => {
    const kr2 = forventetStyringstallForKr("kr2");

    expect(kr2.metrikk.kontroll).toBeNull();
    expect(kr2.metrikk.pakke["takket-ja"]).toBe(88);
    expect(kr2.metrikk.pakke["ikke-svart"]).toBeNull();
  });

  it("lar øvrige styringstall være numeriske", () => {
    const kr1 = forventetStyringstallForKr("kr1");
    const kr3 = forventetStyringstallForKr("kr3");

    expect(kr1.metrikk.kontroll).toBe(18);
    expect(kr3.metrikk.kontroll).toBe(12);
    expect(PURRING_ANDEL.kontroll).toBe(41);
  });

  it("bruker samme visningsetiketter i segmentlabel og varselvalg", () => {
    expect(VARSEL_VALG[0].status).toBe(SEGMENT_LABEL["takket-ja"]);
    expect(VARSEL_VALG[1].status).toBe(SEGMENT_LABEL["ikke-svart"]);

    const visningsverdier = [
      SEGMENT_LABEL["takket-ja"],
      SEGMENT_LABEL["ikke-svart"],
      ...VARSEL_VALG.map((valg) => valg.status),
    ];

    expect(visningsverdier).not.toContain("Takket ja");
    expect(visningsverdier).toContain("Ønsker påminnelse");
    expect(visningsverdier).toContain("Ikke svart");
  });

  it("omtaler adopsjon som å ta stilling til behov", () => {
    expect(VARSEL_LEVERING[0]).toMatchObject({
      label: "Tok stilling til behov",
      andel: 61,
    });
    expect(VARSEL_LEVERING[0].merknad).toContain(
      "tok 61 % stilling til behovet sitt etterpå",
    );
    expect(VARSEL_LEVERING[0].merknad).toContain("varsel-mottakere");
    expect(VARSEL_LEVERING_FORKLARING.definisjon).toContain(
      "Stilling til behov",
    );
    expect(VARSEL_LEVERING_FORKLARING.segmenter).toContain("ønsker påminnelse");
  });
});
