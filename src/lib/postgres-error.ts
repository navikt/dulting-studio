const UNIQUE_VIOLATION_CODE = "23505";

export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("code" in error && error.code === UNIQUE_VIOLATION_CODE) {
    return true;
  }

  if (
    "cause" in error &&
    typeof error.cause === "object" &&
    error.cause !== null &&
    "code" in error.cause &&
    error.cause.code === UNIQUE_VIOLATION_CODE
  ) {
    return true;
  }

  return false;
}
