import { useMemo, useState } from 'react';
import { ResumeEditor, ResumeViewer } from '@/react';
import { createResume } from '@/core';
import { templates } from '@/templates';
import { exportToPDF, exportToWord } from '@/exporters';
import './app.css';

export function App() {
  const templateEntries = useMemo(
    () => Object.entries(templates) as [string, (typeof templates)[keyof typeof templates]][],
    []
  );
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates>('modern');
  const [resume, setResume] = useState(() => createResume(templates[selectedTemplate]));

  const handleTemplateChange = (value: string) => {
    const templateKey = value as keyof typeof templates;
    const template = templates[templateKey];
    if (!template) {
      return;
    }

    setSelectedTemplate(templateKey);
    setResume((prev) => {
      const nextSections = [...prev.sections];

      template.sections.forEach((sectionTemplate) => {
        const matchIndex = nextSections.findIndex(
          (section) => section.type === sectionTemplate.type
        );

        if (matchIndex >= 0) {
          nextSections[matchIndex] = {
            ...nextSections[matchIndex],
            title: sectionTemplate.title ?? nextSections[matchIndex].title,
            layoutType: sectionTemplate.layoutType ?? nextSections[matchIndex].layoutType
          };
        } else {
          nextSections.push({
            ...sectionTemplate,
            id: undefined
          });
        }
      });

      return {
        ...prev,
        title: template.title ?? prev.title,
        style: template.style ? { ...prev.style, ...template.style } : prev.style,
        sections: nextSections
      };
    });
  };

  return (
    <div className="workspace">
      <header className="workspace__header">
        <div className="workspace__header-left">
          <div>
            <h1>resume-engine 演示</h1>
            <p>左侧编辑器 ↔ 右侧真实预览，底部同步展示 JSON 数据</p>
          </div>
          <div className="template-picker">
            <label htmlFor="template">模板</label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(event) => handleTemplateChange(event.target.value)}
            >
              {templateEntries.map(([key]) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="export-actions">
          <button type="button" onClick={() => exportToPDF(resume)}>
            导出 PDF
          </button>
          <button
            type="button"
            onClick={() => exportToWord(resume)}
          >
            导出 Word
          </button>
        </div>
      </header>

      <div className="workspace__main">
        <section className="panel panel--editor">
          <div className="panel__title">编辑区</div>
          <div className="panel__body">
            <ResumeEditor value={resume} onChange={setResume} />
          </div>
        </section>

        <section className="panel panel--viewer">
          <div className="panel__title">预览区</div>
          <div className="panel__body viewer-surface">
            <ResumeViewer data={resume} paginate />
          </div>
        </section>
      </div>

      <section className="panel panel--json">
        <div className="panel__title">JSON 数据</div>
        <pre className="json-preview">{JSON.stringify(resume, null, 2)}</pre>
      </section>
    </div>
  );
}
