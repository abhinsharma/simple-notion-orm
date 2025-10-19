export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function wrapError(message: string, error: unknown): Error {
  const reason = formatError(error);
  const cause = error instanceof Error ? error : undefined;
  const resultMessage = reason ? `${message}: ${reason}` : message;
  const wrapped = new Error(resultMessage);
  if (cause) {
    (wrapped as { cause?: Error }).cause = cause;
  }
  return wrapped;
}
