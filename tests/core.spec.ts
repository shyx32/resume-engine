import { describe, expect, it } from 'vitest';
import {
  addSection,
  createResume,
  removeSection,
  reorderSections,
  updateSection,
  validateResume
} from '@/core';

describe('core helpers', () => {
  it('creates resume with default fallback', () => {
    const resume = createResume({ name: '测试' });
    expect(resume.sections).not.toHaveLength(0);
  });

  it('adds and removes sections', () => {
    const resume = createResume({ name: '测试', sections: [] });
    const withSection = addSection(resume, { id: 'custom', type: 'custom', items: [] });
    expect(withSection.sections).toHaveLength(1);

    const withoutSection = removeSection(withSection, 'custom');
    expect(withoutSection.sections).toHaveLength(0);
  });

  it('updates sections immutably', () => {
    const resume = createResume({
      name: '测试',
      sections: [{ id: 'summary', type: 'summary', title: '简介', items: [] }]
    });
    const updated = updateSection(resume, 'summary', { title: '更新后的简介' });
    expect(updated.sections[0].title).toBe('更新后的简介');
    expect(resume.sections[0].title).toBe('简介');
  });

  it('reorders sections', () => {
    const resume = createResume({
      name: '测试',
      sections: [
        { id: 'a', type: 'a', items: [] },
        { id: 'b', type: 'b', items: [] }
      ]
    });
    const reordered = reorderSections(resume, 0, 1);
    expect(reordered.sections[0].id).toBe('b');
  });

  it('validates empty sections', () => {
    const resume = createResume({ name: '测试', sections: [{ id: 'a', type: 'a', items: [] }] });
    const issues = validateResume(resume);
    expect(issues.length).toBeGreaterThan(0);
  });
});
