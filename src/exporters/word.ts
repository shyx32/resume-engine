import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { ResumeData, ResumeSection } from '@/core';
import { ExportError, ExportErrorCode } from './errors';
import { downloadBlob } from './utils';

export interface WordExportOptions {
  filename?: string;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).join('、');
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => `${key}: ${formatValue(val)}`)
      .join('；');
  }
  return String(value);
}

function sectionToParagraphs(section: ResumeSection): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: section.title ?? section.type,
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 200 }
    })
  ];

  section.items.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${key}：`, bold: true }),
            new TextRun({ text: formatValue(value) })
          ],
          spacing: { after: 80 }
        })
      );
    });
    paragraphs.push(new Paragraph({ text: '', spacing: { after: 80 } }));
  });

  return paragraphs;
}

export async function exportToWord(data: ResumeData, options?: WordExportOptions) {
  if (typeof document === 'undefined') {
    throw new ExportError(ExportErrorCode.BROWSER_UNSUPPORTED, '当前环境不支持 Word 导出', true);
  }

  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: data.name,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 }
    })
  ];

  if (data.title) {
    paragraphs.push(
      new Paragraph({
        text: data.title,
        spacing: { after: 200 }
      })
    );
  }

  data.sections.forEach((section) => {
    paragraphs.push(...sectionToParagraphs(section));
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 }
          }
        },
        children: paragraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, options?.filename ?? `${data.name}-resume.docx`);
}
