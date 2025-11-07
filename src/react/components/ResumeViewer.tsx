import { useEffect, useMemo, useState } from 'react';
import type { ResumeData } from '@/core';
import {
  renderResumeToImages,
  CANVAS_RENDERER_DEFAULTS
} from '@/runtime/renderers/canvasRenderer';

const { pageWidthPx, pageHeightPx } = CANVAS_RENDERER_DEFAULTS;

export interface ResumeViewerProps {
  data: ResumeData;
  scale?: number;
}

export function ResumeViewer({ data, scale = 0.5 }: ResumeViewerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resumeSnapshot = useMemo(
    () => JSON.parse(JSON.stringify(data)) as ResumeData,
    [data]
  );

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      setLoading(true);
      setError(null);
      try {
        const rendered = await renderResumeToImages(resumeSnapshot);
        if (!cancelled) {
          setImages(rendered);
          setActivePage(0);
        }
      } catch (err) {
        if (!cancelled) {
          setImages([]);
          setError(err instanceof Error ? err.message : '渲染失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    generate();
    return () => {
      cancelled = true;
    };
  }, [resumeSnapshot]);

  const pageStyle = {
    width: `${pageWidthPx}px`,
    height: `${pageHeightPx}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left'
  };
  const wrapperStyle = {
    width: `${pageWidthPx * scale}px`,
    height: `${pageHeightPx * scale}px`
  };

  const totalPages = images.length;

  return (
    <div className="viewer-wrapper">
      <div className="resume-carousel">
        <button
          type="button"
          className="carousel-btn"
          onClick={() => setActivePage((prev) => Math.max(prev - 1, 0))}
          disabled={activePage === 0 || loading || totalPages === 0}
        >
          ‹
        </button>

        <div className="resume-pages">
          {loading && <div className="viewer-placeholder">正在生成预览...</div>}
          {error && !loading && (
            <div className="viewer-placeholder viewer-placeholder--error">
              预览失败：{error}
            </div>
          )}
          {!loading && !error && totalPages === 0 && (
            <div className="viewer-placeholder">暂无可渲染内容</div>
          )}
          {!loading && !error && totalPages > 0 && (
            images.map((image, index) => (
              <div
                key={`page-${index}`}
                className={`resume-page-wrapper ${index === activePage ? 'is-active' : ''}`}
                style={wrapperStyle}
              >
                <img
                  src={image}
                  alt={`第 ${index + 1} 页`}
                  className="resume-page__image"
                  style={pageStyle}
                />
                <footer className="resume-page__footer">
                  第 {index + 1} / {totalPages} 页
                </footer>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          className="carousel-btn"
          onClick={() => setActivePage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={activePage >= totalPages - 1 || loading || totalPages === 0}
        >
          ›
        </button>
      </div>
    </div>
  );
}
