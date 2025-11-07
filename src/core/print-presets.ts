import type { ResumePrintConfig } from './types';

export type PrintPresetName = 'standard' | 'professional';

export const PRINT_PRESETS: Record<PrintPresetName, Required<ResumePrintConfig>> = {
  standard: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 15, right: 12, bottom: 15, left: 12 },
    bleed: 0,
    cropMarks: false,
    pageNumbers: false,
    colorProfile: 'sRGB',
    accessibility: true,
    columns: 1,
    rtl: false,
    hyphenation: false,
    keepWithNext: false,
    orphanLines: 2,
    widowLines: 2
  },
  professional: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 15, bottom: 20, left: 15 },
    bleed: 3,
    cropMarks: true,
    pageNumbers: true,
    colorProfile: 'sRGB',
    accessibility: true,
    columns: 1,
    rtl: false,
    hyphenation: true,
    keepWithNext: true,
    orphanLines: 2,
    widowLines: 2
  }
};

export function resolvePrintConfig(
  preset: PrintPresetName = 'standard',
  overrides?: ResumePrintConfig
): ResumePrintConfig {
  return {
    ...PRINT_PRESETS[preset],
    ...overrides,
    margins: overrides?.margins ? { ...PRINT_PRESETS[preset].margins, ...overrides.margins } : PRINT_PRESETS[preset].margins
  };
}
