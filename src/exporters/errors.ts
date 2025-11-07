export enum ExportErrorCode {
  FONT_MISSING = 'E_FONT_MISSING',
  LAYOUT_OVERFLOW = 'E_LAYOUT_OVERFLOW',
  EXPORT_TIMEOUT = 'E_EXPORT_TIMEOUT',
  BROWSER_UNSUPPORTED = 'E_BROWSER_UNSUPPORTED',
  EXPORT_FAILED = 'E_EXPORT_FAILED'
}

export class ExportError extends Error {
  constructor(
    public code: ExportErrorCode,
    message: string,
    public recoverable = false,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ExportError';
  }
}
