/**
 * Widget query parameter parsing and validation.
 * Pure functions — no database dependency, fully testable.
 */

const MAX_PAGE_SIZE = 200;
const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_PAGE = 1;

/**
 * Known widget types from Mural imports.
 * Used as allowlist for the `type` query parameter.
 */
export const ALLOWED_WIDGET_TYPES = [
  "sticky_note",
  "text",
  "shape",
  "image",
  "connector",
  "icon",
  "drawing",
] as const;

const ALLOWED_TYPES_SET = new Set<string>(ALLOWED_WIDGET_TYPES);

/**
 * Lane keys are project-configurable (kebab-case identifiers).
 * We validate format rather than a static allowlist.
 */
const LANE_KEY_PATTERN = /^[a-z0-9æøå][a-z0-9æøå\-_]{0,99}$/;

export type WidgetType = (typeof ALLOWED_WIDGET_TYPES)[number];

export type WidgetQueryParams = {
  page: number;
  pageSize: number;
  type: WidgetType | null;
  lane: string | null;
  status: "classified" | "unclassified" | null;
  search: string | null;
};

export type WidgetQueryValidationError = {
  field: string;
  message: string;
};

export type WidgetQueryParseResult =
  | { ok: true; params: WidgetQueryParams }
  | { ok: false; errors: WidgetQueryValidationError[] };

/**
 * Strictly parse a positive integer from string.
 * Rejects values like "1abc", "1.5", "1e2" — only pure digit strings pass.
 */
function parseStrictPositiveInt(
  value: string | null,
  defaultValue: number,
): number | null {
  if (value === null || value === "") {
    return defaultValue;
  }

  // Only allow strings that are purely digits (no decimals, no exponents, no trailing chars)
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);

  if (parsed < 1 || parsed > Number.MAX_SAFE_INTEGER) {
    return null;
  }

  return parsed;
}

function sanitizeSearchTerm(value: string | null): string | null {
  if (value === null || value.trim() === "") {
    return null;
  }

  // Trim and limit length to prevent abuse
  return value.trim().slice(0, 200);
}

const ALLOWED_STATUSES = new Set(["classified", "unclassified"]);

export function parseWidgetQueryParams(
  searchParams: URLSearchParams,
): WidgetQueryParseResult {
  const errors: WidgetQueryValidationError[] = [];

  const page = parseStrictPositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  if (page === null) {
    errors.push({
      field: "page",
      message: "Må være et positivt heltall",
    });
  }

  const pageSizeRaw = searchParams.get("pageSize");
  const pageSize = parseStrictPositiveInt(pageSizeRaw, DEFAULT_PAGE_SIZE);
  if (pageSize === null) {
    errors.push({
      field: "pageSize",
      message: `Må være et positivt heltall (maks ${MAX_PAGE_SIZE})`,
    });
  } else if (pageSize > MAX_PAGE_SIZE) {
    errors.push({
      field: "pageSize",
      message: `Må være maks ${MAX_PAGE_SIZE}`,
    });
  }

  const typeParam = searchParams.get("type");
  let type: WidgetType | null = null;
  if (typeParam !== null && typeParam.trim() !== "") {
    const trimmed = typeParam.trim();
    if (!ALLOWED_TYPES_SET.has(trimmed)) {
      errors.push({
        field: "type",
        message: `Ugyldig type. Tillatte verdier: ${ALLOWED_WIDGET_TYPES.join(", ")}`,
      });
    } else {
      type = trimmed as WidgetType;
    }
  }

  const laneParam = searchParams.get("lane");
  let lane: string | null = null;
  if (laneParam !== null && laneParam.trim() !== "") {
    const trimmed = laneParam.trim();
    if (!LANE_KEY_PATTERN.test(trimmed)) {
      errors.push({
        field: "lane",
        message:
          "Ugyldig lane-nøkkel. Bruk små bokstaver, tall og bindestrek (maks 100 tegn).",
      });
    } else {
      lane = trimmed;
    }
  }

  const statusParam = searchParams.get("status");
  let status: "classified" | "unclassified" | null = null;
  if (statusParam !== null && statusParam !== "") {
    if (!ALLOWED_STATUSES.has(statusParam)) {
      errors.push({
        field: "status",
        message: "Må være 'classified' eller 'unclassified'",
      });
    } else {
      status = statusParam as "classified" | "unclassified";
    }
  }

  const search = sanitizeSearchTerm(searchParams.get("search"));

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    params: {
      page: page as number,
      pageSize: pageSize as number,
      type,
      lane,
      status,
      search,
    },
  };
}

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function computePagination(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { page, pageSize, total, totalPages };
}
