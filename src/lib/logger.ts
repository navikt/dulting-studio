type LogContext = Record<string, string | number | boolean | null | undefined>;

function log(
  level: "INFO" | "ERROR",
  message: string,
  context: LogContext = {},
) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const line = JSON.stringify(payload);

  if (level === "ERROR") {
    console.error(line);
    return;
  }

  console.info(line);
}

export function logInfo(message: string, context?: LogContext) {
  log("INFO", message, context);
}

export function logError(message: string, context?: LogContext) {
  log("ERROR", message, context);
}
