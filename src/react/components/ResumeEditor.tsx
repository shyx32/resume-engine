import type { ResumeData, ResumeSection, ValidationIssue } from '@/core';
import { useCallback, useEffect } from 'react';
import { useEditor } from '../state/EditorContext';
import { EditorProvider } from '../state/EditorContext';
import { useEditorActions } from '../hooks/useEditorActions';
import { ErrorBoundary } from './ErrorBoundary';

export interface ResumeEditorProps {
  value: ResumeData;
  onChange: (data: ResumeData) => void;
  readOnly?: boolean;
  className?: string;
  onValidationChange?: (issues: ValidationIssue[]) => void;
}

function SectionEditor({
  section,
  onChange,
  onRemove,
  readOnly
}: {
  section: ResumeSection;
  onChange: (data: Partial<ResumeSection>) => void;
  onRemove: () => void;
  readOnly?: boolean;
}) {
  return (
    <div className="re-section">
      <div className="re-section__header">
        <input
          value={section.title ?? ''}
          placeholder="节标题"
          disabled={readOnly}
          onChange={(event) => onChange({ title: event.target.value })}
        />
        {!readOnly && (
          <button type="button" onClick={onRemove}>
            删除
          </button>
        )}
      </div>
      <textarea
        value={JSON.stringify(section.items, null, 2)}
        disabled={readOnly}
        onChange={(event) => {
          try {
            const payload = JSON.parse(event.target.value || '[]');
            onChange({ items: payload });
          } catch {
            // ignore invalid JSON until corrected
          }
        }}
      />
    </div>
  );
}

function EditorSurface({
  onChange,
  readOnly
}: {
  onChange: (data: ResumeData) => void;
  readOnly?: boolean;
}) {
  const { state } = useEditor();
  const { updateDocument, updateSection, removeSection, addSection } = useEditorActions();

  useEffect(() => {
    onChange(state.document);
  }, [state.document, onChange]);

  const handleAddSection = useCallback(() => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const newSection: ResumeSection = {
      id,
      type: 'custom',
      title: '新节',
      items: []
    };
    addSection(newSection);
  }, [addSection]);

  return (
    <div className="re-editor">
      <div className="re-editor__header">
        <input
          value={state.document.name}
          placeholder="姓名"
          disabled={readOnly}
          onChange={(event) => updateDocument({ name: event.target.value })}
        />
        <input
          value={state.document.title ?? ''}
          placeholder="头衔"
          disabled={readOnly}
          onChange={(event) => updateDocument({ title: event.target.value })}
        />
      </div>

      <div className="re-editor__sections">
        {state.document.sections.map((section) => (
          <SectionEditor
            key={section.id}
            section={section}
            readOnly={readOnly}
            onChange={(data) =>
              updateSection(section.id!, {
                ...data
              })
            }
            onRemove={() => removeSection(section.id!)}
          />
        ))}
      </div>

      {!readOnly && (
        <button type="button" onClick={handleAddSection}>
          新增节
        </button>
      )}
    </div>
  );
}

export function ResumeEditor({
  value,
  onChange,
  readOnly,
  className,
  onValidationChange
}: ResumeEditorProps) {
  return (
    <ErrorBoundary>
      <EditorProvider value={value} onValidationChange={onValidationChange}>
        <div className={className}>
          <EditorSurface onChange={onChange} readOnly={readOnly} />
        </div>
      </EditorProvider>
    </ErrorBoundary>
  );
}
