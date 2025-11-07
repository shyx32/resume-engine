import { PDFDocument } from 'pdf-lib';
import type { ResumeData } from '@/core';
import type { PrintPresetName, ResumePrintConfig } from '@/core/print-presets';
import { renderResumeToImages } from '@/runtime/renderers/canvasRenderer';
import { ExportError, ExportErrorCode } from './errors';
import { downloadBlob } from './utils';

export interface PdfExportOptions {
  preset?: PrintPresetName;
  filename?: string;
  overrides?: ResumePrintConfig;
}

type PdfTarget = ResumeData | HTMLElement | null;

function isResumeData(target: PdfTarget): target is ResumeData {
  return Boolean(target && typeof target === 'object' && 'sections' in target);
}

function getElement(target: PdfTarget): HTMLElement {
  if (target instanceof HTMLElement) {
    return target;
  }
  throw new ExportError(ExportErrorCode.EXPORT_FAILED, '未找到需要导出的节点', false);
}

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

function dataUrlToUint8Array(dataUrl: string) {
  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error('Invalid data URL');
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function exportResumeData(resume: ResumeData, options?: PdfExportOptions) {
  const doc = await PDFDocument.create();
  const images = await renderResumeToImages(resume);

  for (const image of images) {
    const pngBytes = dataUrlToUint8Array(image);
    const png = await doc.embedPng(pngBytes);
    const page = doc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);
    page.drawImage(png, {
      x: 0,
      y: 0,
      width: A4_WIDTH_PT,
      height: A4_HEIGHT_PT
    });
  }

  const blob = new Blob([await doc.save()], { type: 'application/pdf' });
  downloadBlob(blob, options?.filename ?? `${resume.name || 'resume'}.pdf`);
}

async function exportElementCanvas(element: HTMLElement, options?: PdfExportOptions) {
  throw new ExportError(
    ExportErrorCode.EXPORT_FAILED,
    'DOM 导出暂未实现，请传入标准化的 ResumeData',
    false,
    { element }
  );
}

export async function exportToPDF(target: PdfTarget, options?: PdfExportOptions) {
  if (!target) {
    throw new ExportError(ExportErrorCode.EXPORT_FAILED, '没有可导出的内容', false);
  }

  if (isResumeData(target)) {
    return exportResumeData(target, options);
  }

  return exportElementCanvas(getElement(target), options);
}
