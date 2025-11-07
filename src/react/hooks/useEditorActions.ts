import type { ResumeData, ResumeSection } from '@/core';
import { useCallback } from 'react';
import { useEditor } from '../state/EditorContext';

export function useEditorActions() {
  const { dispatch } = useEditor();

  const updateDocument = useCallback(
    (patch: Partial<ResumeData>) => dispatch({ type: 'PATCH_DOCUMENT', payload: patch }),
    [dispatch]
  );

  const addSection = useCallback(
    (section: ResumeSection) => dispatch({ type: 'ADD_SECTION', payload: section }),
    [dispatch]
  );

  const updateSection = useCallback(
    (id: string, data: Partial<ResumeSection>) =>
      dispatch({ type: 'UPDATE_SECTION', payload: { id, data } }),
    [dispatch]
  );

  const removeSection = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_SECTION', payload: id }),
    [dispatch]
  );

  const reorderSections = useCallback(
    (from: number, to: number) => dispatch({ type: 'REORDER_SECTIONS', payload: { from, to } }),
    [dispatch]
  );

  return {
    updateDocument,
    addSection,
    updateSection,
    removeSection,
    reorderSections
  };
}
