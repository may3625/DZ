export function getErrorMessage(error: unknown): string {
  if (error == null) {
    return 'Erreur inconnue';
  }
  if (error instanceof Error) {
    return error.message || 'Erreur inconnue';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in (error as any)) {
    const msg = (error as any).message;
    if (typeof msg === 'string') {
      return msg;
    }
  }
  try {
    const serialized = JSON.stringify(error);
    return typeof serialized === 'string' && serialized.length > 0 ? serialized : 'Erreur inconnue';
  } catch {
    return 'Erreur inconnue';
  }
}

export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

export function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(getErrorMessage(error));
}

