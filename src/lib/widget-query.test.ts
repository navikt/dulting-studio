import { describe, expect, it } from "vitest";
import { computePagination, parseWidgetQueryParams } from "./widget-query";

describe("parseWidgetQueryParams", () => {
  function params(obj: Record<string, string> = {}) {
    return new URLSearchParams(obj);
  }

  it("returns defaults when no params are provided", () => {
    const result = parseWidgetQueryParams(params());
    expect(result).toEqual({
      ok: true,
      params: {
        page: 1,
        pageSize: 50,
        type: null,
        lane: null,
        status: null,
        search: null,
      },
    });
  });

  it("parses valid page and pageSize", () => {
    const result = parseWidgetQueryParams(
      params({ page: "3", pageSize: "25" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.page).toBe(3);
      expect(result.params.pageSize).toBe(25);
    }
  });

  it("returns error for pageSize exceeding max (500)", () => {
    const result = parseWidgetQueryParams(params({ pageSize: "500" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("pageSize");
      expect(result.errors[0].message).toContain("maks");
    }
  });

  it("returns error for pageSize exceeding max (201)", () => {
    const result = parseWidgetQueryParams(params({ pageSize: "201" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("pageSize");
    }
  });

  it("accepts pageSize at exact max (200)", () => {
    const result = parseWidgetQueryParams(params({ pageSize: "200" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.pageSize).toBe(200);
    }
  });

  it("returns error for page with trailing characters (1abc)", () => {
    const result = parseWidgetQueryParams(params({ page: "1abc" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("page");
    }
  });

  it("returns error for decimal page (1.5)", () => {
    const result = parseWidgetQueryParams(params({ page: "1.5" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("page");
    }
  });

  it("returns error for scientific notation page (1e2)", () => {
    const result = parseWidgetQueryParams(params({ page: "1e2" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("page");
    }
  });

  it("returns error for non-numeric page", () => {
    const result = parseWidgetQueryParams(params({ page: "abc" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("page");
    }
  });

  it("returns error for negative page", () => {
    const result = parseWidgetQueryParams(params({ page: "-1" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("page");
    }
  });

  it("returns error for zero pageSize", () => {
    const result = parseWidgetQueryParams(params({ pageSize: "0" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("pageSize");
    }
  });

  it("parses valid type filter", () => {
    const result = parseWidgetQueryParams(params({ type: "sticky_note" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.type).toBe("sticky_note");
    }
  });

  it("rejects invalid type not in allowlist", () => {
    const result = parseWidgetQueryParams(params({ type: "hacker_widget" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("type");
      expect(result.errors[0].message).toContain("Ugyldig type");
    }
  });

  it("treats empty type as null", () => {
    const result = parseWidgetQueryParams(params({ type: "  " }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.type).toBeNull();
    }
  });

  it("parses valid lane filter", () => {
    const result = parseWidgetQueryParams(params({ lane: "forsta-oppgaven" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.lane).toBe("forsta-oppgaven");
    }
  });

  it("rejects lane with invalid characters", () => {
    const result = parseWidgetQueryParams(params({ lane: "INVALID LANE!!" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("lane");
    }
  });

  it("rejects lane exceeding max length", () => {
    const result = parseWidgetQueryParams(params({ lane: "a".repeat(101) }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("lane");
    }
  });

  it("treats empty lane as null", () => {
    const result = parseWidgetQueryParams(params({ lane: "  " }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.lane).toBeNull();
    }
  });

  it("parses valid status", () => {
    const result = parseWidgetQueryParams(params({ status: "classified" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.status).toBe("classified");
    }
  });

  it("rejects invalid status", () => {
    const result = parseWidgetQueryParams(params({ status: "magic" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("status");
    }
  });

  it("parses search and trims", () => {
    const result = parseWidgetQueryParams(params({ search: "  hello  " }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.search).toBe("hello");
    }
  });

  it("truncates search to 200 characters", () => {
    const long = "a".repeat(300);
    const result = parseWidgetQueryParams(params({ search: long }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.search?.length).toBe(200);
    }
  });

  it("accumulates multiple errors", () => {
    const result = parseWidgetQueryParams(
      params({ page: "x", pageSize: "-1", status: "bad" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBe(3);
    }
  });

  it("returns error for pageSize with decimal (1.5)", () => {
    const result = parseWidgetQueryParams(params({ pageSize: "1.5" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("pageSize");
    }
  });

  it("returns error for pageSize with scientific notation (1e2)", () => {
    const result = parseWidgetQueryParams(params({ pageSize: "1e2" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("pageSize");
    }
  });
});

describe("computePagination", () => {
  it("computes totalPages correctly", () => {
    expect(computePagination(1, 50, 120)).toEqual({
      page: 1,
      pageSize: 50,
      total: 120,
      totalPages: 3,
    });
  });

  it("returns 1 totalPages for zero results", () => {
    expect(computePagination(1, 50, 0)).toEqual({
      page: 1,
      pageSize: 50,
      total: 0,
      totalPages: 1,
    });
  });

  it("returns 1 totalPages when total equals pageSize", () => {
    expect(computePagination(1, 50, 50)).toEqual({
      page: 1,
      pageSize: 50,
      total: 50,
      totalPages: 1,
    });
  });
});
