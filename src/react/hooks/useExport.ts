import { useCallback, useState } from 'react';
import type { ResumeData } from '@/core';
import { useEditor } from '../state/EditorContext';
import { exportToPDF } from '@/exporters/pdf';
import { exportToWord } from '@/exporters/word';

export function useExport() {
  const {
    state: { document }
  } = useEditor();
  const [isExporting, setExporting] = useState(false);

  const toPDF = useCallback(
    async (element: HTMLElement | null) => {
      setExporting(true);
      try {
        await exportToPDF(element);
      } finally {
        setExporting(false);
      }
    },
    []
  );

  const toWord = useCallback(
    async (data?: ResumeData) => {
      setExporting(true);
      try {
        await exportToWord(data ?? document);
      } finally {
        setExporting(false);
      }
    },
    [document]
  );

  return {
    exportToPDF: toPDF,
    exportToWord: toWord,
    isExporting
  };
}
