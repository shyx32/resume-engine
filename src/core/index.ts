import { resolvePrintConfig } from './print-presets';
import type {
  EditorState,
  ResumeData,
  ResumePrintConfig,
  ResumeSection,
  ResumeSectionLayout,
  RichTextInline,
  RichTextNode,
  SelectionState,
  ValidationIssue
} from './types';

const DEFAULT_SECTIONS: ResumeSection[] = [
  {
    id: 'summary',
    type: 'summary',
    title: '简介',
    items: [{ content: '请在此添加你的背景概述。' }]
  }
];

const hasStructuredClone = typeof structuredClone === 'function';

function clone<T>(value: T): T {
  if (hasStructuredClone) {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

export function createResume(seed: Partial<ResumeData> = {}): ResumeData {
  const sections = seed.sections?.length ? seed.sections : DEFAULT_SECTIONS;

  return {
    name: seed.name ?? '未命名候选人',
    title: seed.title,
    style: seed.style,
    sections: clone(sections).map((section) => ({
      ...section,
      id: section.id ?? generateId()
    })),
    meta: seed.meta ?? {}
  };
}

export function addSection(resume: ResumeData, section: ResumeSection): ResumeData {
  return {
    ...resume,
    sections: [...resume.sections, { ...section, id: section.id ?? generateId() }]
  };
}

export function updateSection(
  resume: ResumeData,
  id: string,
  payload: Partial<ResumeSection>
): ResumeData {
  return {
    ...resume,
    sections: resume.sections.map((section) => (section.id === id ? { ...section, ...payload } : section))
  };
}

export function removeSection(resume: ResumeData, id: string): ResumeData {
  return {
    ...resume,
    sections: resume.sections.filter((section) => section.id !== id)
  };
}

export function reorderSections(resume: ResumeData, from: number, to: number): ResumeData {
  if (from === to) {
    return resume;
  }

  const sections = [...resume.sections];
  const [moved] = sections.splice(from, 1);
  sections.splice(to, 0, moved);

  return {
    ...resume,
    sections
  };
}

export function resolvePrintPreset(
  preset: Parameters<typeof resolvePrintConfig>[0],
  overrides?: ResumePrintConfig
) {
  return resolvePrintConfig(preset, overrides);
}

export function validateResume(resume: ResumeData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!resume.name.trim()) {
    issues.push({
      id: 'name_required',
      level: 'error',
      path: 'name',
      message: '姓名为必填项'
    });
  }

  resume.sections.forEach((section, index) => {
    if (!section.items.length) {
      issues.push({
        id: `section_${section.id}_empty`,
        level: 'warning',
        path: `sections[${index}]`,
        message: `节「${section.title ?? section.type}」没有内容`
      });
    }
  });

  return issues;
}

export type {
  ResumeData,
  ResumeSection,
  ResumePrintConfig,
  ValidationIssue,
  ResumeSectionLayout,
  RichTextNode,
  RichTextInline,
  SelectionState,
  EditorState
} from './types';
