import type { ResumeData, ResumeSection } from '@/core';

export interface CanvasRendererOptions {
  pageWidthPx: number;
  pageHeightPx: number;
  paddingX: number;
  paddingY: number;
  sectionGap: number;
  headingSize: number;
  headingWeight: number;
  bodySize: number;
  bodyWeight: number;
  secondarySize: number;
}

export const CANVAS_RENDERER_DEFAULTS: CanvasRendererOptions = {
  pageWidthPx: 794,
  pageHeightPx: 1123,
  paddingX: 72,
  paddingY: 72,
  sectionGap: 18,
  headingSize: 32,
  headingWeight: 700,
  bodySize: 16,
  bodyWeight: 400,
  secondarySize: 14
};

interface RenderPage {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cursorY: number;
}

function assertBrowserEnvironment() {
  if (typeof document === 'undefined') {
    throw new Error('需要在浏览器环境中渲染预览/导出');
  }
}

function createRenderPage(options: CanvasRendererOptions): RenderPage {
  const canvas = document.createElement('canvas');
  canvas.width = options.pageWidthPx;
  canvas.height = options.pageHeightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布上下文');
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f172a';
  ctx.textBaseline = 'top';
  return { canvas, ctx, cursorY: options.paddingY + options.headingSize };
}

function applyFont(
  ctx: CanvasRenderingContext2D,
  size: number,
  weight = 400,
  fontFamily = '"PingFang SC","Microsoft YaHei","Noto Sans SC","Noto Sans",sans-serif'
) {
  ctx.font = `${weight} ${size}px ${fontFamily}`;
}

function breakLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let current = '';
  const chars = text.replace(/\r/g, '').split('');
  chars.forEach((char) => {
    const tentative = current + char;
    const width = ctx.measureText(tentative).width;
    if (width > maxWidth && current) {
      lines.push(current);
      current = char === '\n' ? '' : char;
    } else if (char === '\n') {
      lines.push(current);
      current = '';
    } else {
      current = tentative;
    }
  });
  if (current) {
    lines.push(current);
  }
  return lines;
}

class PageContext {
  pages: RenderPage[] = [];
  current: RenderPage;

  constructor(private options: CanvasRendererOptions) {
    this.current = createRenderPage(options);
  }

  ensureSpace(needed: number) {
    if (this.current.cursorY + needed <= this.options.pageHeightPx - this.options.paddingY) {
      return;
    }
    this.pages.push(this.current);
    this.current = createRenderPage(this.options);
  }

  finalize() {
    this.pages.push(this.current);
  }
}

function drawTextBlock(
  context: PageContext,
  text: string,
  size: number,
  weight: number,
  gap: number,
  maxWidth: number
) {
  if (!text) return;
  const { ctx } = context.current;
  applyFont(ctx, size, weight);
  const lines = breakLines(ctx, text, maxWidth);
  const lineHeight = size + gap;
  lines.forEach((line) => {
    context.ensureSpace(lineHeight);
    ctx.fillText(line, context.options.paddingX, context.current.cursorY);
    context.current.cursorY += lineHeight;
  });
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

function renderSection(
  context: PageContext,
  section: ResumeSection,
  options: CanvasRendererOptions,
  maxWidth: number
) {
  context.ensureSpace(options.bodySize + options.sectionGap);
  drawTextBlock(
    context,
    section.title ?? section.type,
    options.bodySize + 4,
    options.headingWeight,
    4,
    maxWidth
  );
  context.current.cursorY += 6;

  section.items.forEach((item, idx) => {
    Object.entries(item).forEach(([key, value]) => {
      const formatted = formatValue(value);
      drawTextBlock(
        context,
        `${key}：${formatted}`,
        options.bodySize,
        options.bodyWeight,
        6,
        maxWidth
      );
    });
    if (idx < section.items.length - 1) {
      context.current.cursorY += 8;
    }
  });

  context.current.cursorY += options.sectionGap;
}

export async function renderResumeToImages(
  resume: ResumeData,
  opts?: Partial<CanvasRendererOptions>
) {
  assertBrowserEnvironment();
  const options: CanvasRendererOptions = { ...CANVAS_RENDERER_DEFAULTS, ...opts };
  const maxWidth = options.pageWidthPx - options.paddingX * 2;
  const context = new PageContext(options);

  drawTextBlock(context, resume.name, options.headingSize, options.headingWeight, 6, maxWidth);
  context.current.cursorY += 6;
  if (resume.title) {
    drawTextBlock(context, resume.title, options.bodySize, options.bodyWeight, 6, maxWidth);
    context.current.cursorY += 10;
  }
  context.current.cursorY += 20;

  resume.sections.forEach((section) => {
    renderSection(context, section, options, maxWidth);
  });

  context.finalize();
  return context.pages.map((page) => page.canvas.toDataURL('image/png'));
}
