type LogContext = Record<string, string | number | boolean | null | undefined>;

function pruneContext(context: LogContext) {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined),
  );
}

function log(
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  context: LogContext = {},
) {
  const payload = {
    "@timestamp": new Date().toISOString(),
    level,
    message,
    ...pruneContext(context),
  };

  const line = JSON.stringify(payload);

  if (level === "ERROR") {
    console.error(line);
    return;
  }

  if (level === "WARN") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export function logInfo(message: string, context?: LogContext) {
  log("INFO", message, context);
}

export function logWarn(message: string, context?: LogContext) {
  log("WARN", message, context);
}

export function logError(message: string, context?: LogContext) {
  log("ERROR", message, context);
}
