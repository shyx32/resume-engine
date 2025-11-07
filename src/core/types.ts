export type ResumeSectionLayout =
  | 'single'
  | 'two-column'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'timeline';

export interface ResumePrintConfig {
  pageSize?: 'A4' | 'Letter' | { widthMm: number; heightMm: number };
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  bleed?: number;
  cropMarks?: boolean;
  pageNumbers?: boolean;
  colorProfile?: 'sRGB' | 'CMYK';
  accessibility?: boolean;
  columns?: 1 | 2;
  rtl?: boolean;
  hyphenation?: boolean;
  keepWithNext?: boolean;
  orphanLines?: number;
  widowLines?: number;
}

export interface PageLayout {
  type: ResumeSectionLayout;
  columns?: number;
  sidebarWidth?: number;
  gutter?: number;
}

export interface BlockPolicy {
  keepWithNext?: boolean;
  avoidPageBreak?: boolean;
  avoidColumnBreak?: boolean;
  nonBreakable?: boolean;
}

export type RichTextInline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  href?: string;
};

export type RichTextNode =
  | { type: 'paragraph'; children: RichTextInline[] }
  | { type: 'bulleted-list'; children: { type: 'list-item'; children: RichTextInline[] }[] }
  | { type: 'numbered-list'; children: { type: 'list-item'; children: RichTextInline[] }[] };

export interface ResumeStyle {
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  lineHeight?: string;
  print?: ResumePrintConfig;
  pageLayout?: PageLayout;
}

export interface ResumeSection {
  id?: string;
  type: string;
  title?: string;
  layoutType?: ResumeSectionLayout;
  policy?: BlockPolicy;
  items: Record<string, unknown>[];
}

export interface ResumeData {
  name: string;
  title?: string;
  style?: ResumeStyle;
  sections: ResumeSection[];
  meta?: Record<string, unknown>;
}

export interface ValidationIssue {
  id: string;
  level: 'error' | 'warning' | 'info';
  path: string;
  message: string;
  suggestion?: string;
}

export interface EditorUIState {
  activeTab: 'edit' | 'preview' | 'settings';
  isExporting: boolean;
  paginationEnabled: boolean;
  previewScale: number;
}

export interface SelectionState {
  sectionId: string;
  itemIndex?: number;
  fieldPath?: string[];
}

export interface EditorHistory {
  past: ResumeData[];
  future: ResumeData[];
  limit: number;
}

export interface EditorState {
  document: ResumeData;
  selection: SelectionState | null;
  focusedSection: string | null;
  history: EditorHistory;
  ui: EditorUIState;
  validation: {
    issues: ValidationIssue[];
    isValid: boolean;
  };
}
