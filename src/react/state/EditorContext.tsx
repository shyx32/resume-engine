import type {
  EditorState,
  ResumeData,
  ResumeSection,
  SelectionState,
  ValidationIssue
} from '@/core';
import type { Dispatch, ReactNode } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from 'react';
import { validateResume } from '@/core';

export type EditorAction =
  | { type: 'SET_DOCUMENT'; payload: ResumeData }
  | { type: 'PATCH_DOCUMENT'; payload: Partial<ResumeData> }
  | { type: 'UPDATE_SECTION'; payload: { id: string; data: Partial<ResumeSection> } }
  | { type: 'ADD_SECTION'; payload: ResumeSection }
  | { type: 'REMOVE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: { from: number; to: number } }
  | { type: 'SET_SELECTION'; payload: SelectionState | null }
  | { type: 'SET_UI'; payload: Partial<EditorState['ui']> }
  | { type: 'SET_VALIDATION'; payload: ValidationIssue[] };

const HISTORY_LIMIT = 50;

function createInitialState(document: ResumeData): EditorState {
  return {
    document,
    selection: null,
    focusedSection: null,
    history: { past: [], future: [], limit: HISTORY_LIMIT },
    ui: { activeTab: 'edit', isExporting: false, paginationEnabled: false, previewScale: 1 },
    validation: { issues: [], isValid: true }
  };
}

function pushHistory(state: EditorState, nextDocument: ResumeData) {
  const past = [...state.history.past, state.document].slice(-state.history.limit);
  return {
    ...state.history,
    past,
    future: []
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return { ...state, document: action.payload };
    case 'PATCH_DOCUMENT':
      return {
        ...state,
        history: pushHistory(state, state.document),
        document: { ...state.document, ...action.payload }
      };
    case 'ADD_SECTION': {
      return {
        ...state,
        history: pushHistory(state, state.document),
        document: { ...state.document, sections: [...state.document.sections, action.payload] }
      };
    }
    case 'UPDATE_SECTION':
      return {
        ...state,
        history: pushHistory(state, state.document),
        document: {
          ...state.document,
          sections: state.document.sections.map((section) =>
            section.id === action.payload.id ? { ...section, ...action.payload.data } : section
          )
        }
      };
    case 'REMOVE_SECTION':
      return {
        ...state,
        history: pushHistory(state, state.document),
        document: {
          ...state.document,
          sections: state.document.sections.filter((section) => section.id !== action.payload)
        }
      };
    case 'REORDER_SECTIONS': {
      const nextSections = [...state.document.sections];
      const [item] = nextSections.splice(action.payload.from, 1);
      nextSections.splice(action.payload.to, 0, item);
      return {
        ...state,
        history: pushHistory(state, state.document),
        document: { ...state.document, sections: nextSections }
      };
    }
    case 'SET_SELECTION':
      return { ...state, selection: action.payload };
    case 'SET_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    case 'SET_VALIDATION':
      return {
        ...state,
        validation: { issues: action.payload, isValid: action.payload.length === 0 }
      };
    default:
      return state;
  }
}

interface EditorContextValue {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export interface EditorProviderProps {
  value: ResumeData;
  children: ReactNode;
  onValidationChange?: (issues: ValidationIssue[]) => void;
}

export function EditorProvider({ value, children, onValidationChange }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, value, createInitialState);

  useEffect(() => {
    dispatch({ type: 'SET_DOCUMENT', payload: value });
  }, [value]);

  useEffect(() => {
    const issues = validateResume(state.document);
    dispatch({ type: 'SET_VALIDATION', payload: issues });
    onValidationChange?.(issues);
  }, [state.document, onValidationChange]);

  const memoized = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <EditorContext.Provider value={memoized}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor 必须在 EditorProvider 中使用');
  }
  return context;
}
