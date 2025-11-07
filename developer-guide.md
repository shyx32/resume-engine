# resume-engine 开发指南

## 概览
- `resume-engine` 是一个轻量、可扩展的简历编辑与导出引擎。
- 核心能力基于统一的 JSON Schema，前端渲染与导出逻辑完全解耦。
- 默认提供基于 React 的编辑器与预览器，核心导出模块独立于前端框架。

## 核心特性
- 数据驱动渲染：统一的 JSON Schema 让编辑器、预览器与导出保持一致。
- 模块化设计：编辑器、预览器、导出能力互不依赖，组合灵活。
- 可扩展 UI：可以直接使用内置 React 组件，或替换为自定义界面。
- 多格式导出：内置 PDF / Word 导出模块，可单独在其他项目中使用。
- 模板库支持：预置多套模板，支持在运行时快速切换或扩展自定义模板。
- 轻量依赖：核心完全使用 TypeScript 实现，默认 UI 可选。

## 系统架构
| 模块 | 职责 | 是否可替换 |
|------|------|------------|
| `src/core` | 定义数据结构与操作工具 | ✅ |
| `src/react` | 默认 React 编辑器与预览组件 | ✅ |
| `src/templates` | 可复用的简历模板库（可选） | ✅ |
| `src/exporters` | PDF / Word 导出实现 | 🚫（需遵循统一数据结构） |
| `src/runtime` | 运行时渲染工具函数 | ✅ |

- 所有模块围绕统一的 `ResumeData` 数据模型协作。
- 导出模块不依赖任何 UI 框架，可在 React、Svelte 或原生项目中复用。

## 安装
```bash
npm install resume-engine
# 或
yarn add resume-engine
```

## 快速集成

### 使用内置 React 组件
默认提供可直接使用的编辑器与预览组件。

```tsx
import { useState } from "react";
import { ResumeEditor, ResumeViewer } from "resume-engine";

export default function App() {
  const [resume, setResume] = useState({
    name: "张三",
    title: "前端工程师",
    style: { color: "#333", backgroundColor: "#fff" },
    sections: [
      { type: "education", title: "教育经历", items: [{ 学校: "清华大学", 时间: "2018-2022" }] }
    ]
  });
  return (
    <>
      <ResumeEditor value={resume} onChange={setResume} />
      <ResumeViewer data={resume} />
    </>
  );
}
```

### 自定义编辑器与预览
可以仅使用核心逻辑与导出能力，自行搭建界面。

```ts
import {
  createResume,
  exportToPDF,
  exportToWord
} from "resume-engine";

// 初始化简历数据
const resume = createResume({
  name: "李四",
  title: "产品经理",
  sections: [
    { type: "project", title: "项目经历", items: [{ 名称: "电商平台" }] }
  ]
});

// 在自定义预览中渲染
renderMyCustomResume(resume);

// 导出
exportToPDF(document.querySelector("#resume")!);
exportToWord(resume);
```

### 使用模板库快速初始化
模板库提供多套预置的 `ResumeData` 配置，便于根据业务快速选择样式。

```ts
import { createResume } from "resume-engine";
import { modernTemplate } from "resume-engine/templates";

// 基于模板构建简历数据
const resume = createResume(modernTemplate);

// 运行时切换其他模板
function switchTemplate(template) {
  Object.assign(resume, createResume(template));
}
```

> 建议将团队自定义模板统一维护在 `src/templates` 中，按照布局或业务场景分组。

## 数据模型
所有渲染及导出功能依赖相同的数据结构。

```ts
interface ResumeData {
  name: string;
  title?: string;
  style?: ResumeStyle;
  sections: ResumeSection[];
}

interface ResumeStyle {
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  lineHeight?: string;
}

interface ResumeSection {
  id?: string;
  type: string;
  title?: string;
  layout?: string;
  items: Record<string, any>[];
}
```

> 提示：在自定义组件或导出逻辑中保持结构一致，可确保所有模块协同工作。

### 数据模型扩展接口示例
```ts
// 页面与打印
export interface ResumePrintConfig {
  pageSize?: 'A4' | 'Letter' | { widthMm: number; heightMm: number };
  orientation?: 'portrait' | 'landscape';
  margins?: { top: number; right: number; bottom: number; left: number }; // mm
  bleed?: number; // mm
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
  type: 'single' | 'two-column' | 'sidebar-left' | 'sidebar-right' | 'timeline';
  columns?: number;
  sidebarWidth?: number; // mm
  gutter?: number; // mm
}

export interface BlockPolicy {
  keepWithNext?: boolean;
  avoidPageBreak?: boolean;
  avoidColumnBreak?: boolean;
  nonBreakable?: boolean;
}

// 富文本（简化示例）
export type RichTextNode =
  | { type: 'paragraph'; children: RichTextInline[] }
  | { type: 'bulleted-list'; children: { type: 'list-item'; children: RichTextInline[] }[] }
  | { type: 'numbered-list'; children: { type: 'list-item'; children: RichTextInline[] }[] };
export type RichTextInline =
  | { text: string; bold?: boolean; italic?: boolean; underline?: boolean; code?: boolean; href?: string };

// 将扩展挂入样式与分节
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
  layoutType?: PageLayout['type'];
  policy?: BlockPolicy;
  items: Record<string, any>[]; // 可包含 { content: RichTextNode[] }
}
```

## 模板库
- 模板以 `ResumeData` 对象形式存储，可与 `createResume` 组合生成可编辑实例。
- 通过维护模板元数据（名称、标签、预览图），可在 UI 中实现模板选择器。
- 模板库与 UI 解耦，可在不同框架中共享；只要保持数据结构一致即可复用。

```ts
// templates/index.ts
import type { ResumeData } from "resume-engine";

export const templates: Record<string, ResumeData> = {
  modern: {
    name: "Modern",
    title: "产品经理",
    sections: [
      { type: "summary", title: "简介", items: [{ 内容: "..." }] },
      { type: "experience", title: "工作经历", items: [{ 公司: "Acme", 职位: "PM" }] }
    ]
  },
  classic: {
    name: "Classic",
    title: "前端工程师",
    sections: [
      { type: "skills", title: "技能", items: [{ 技能: "React / TypeScript" }] }
    ]
  }
};

export function listTemplates() {
  return Object.keys(templates);
}

export function resolveTemplate(key: string) {
  return templates[key];
}
```

### 内置模板清单（首批）
- Modern（单栏）
- Classic（双栏）
- Sidebar（侧栏）
- Timeline（时间轴）
- Compact（紧凑）

> 可以在构建阶段或后端服务中注入模板数据，实现多租户或按角色定制。

## 导出模块

### 导出 PDF
```ts
import { exportToPDF } from "resume-engine";
const el = document.querySelector(".resume-view");
exportToPDF(el!);
```

### 导出 Word
```ts
import { exportToWord } from "resume-engine";
exportToWord(resumeData);
```

- 导出模块独立于前端框架，可在任意项目中复用。
- `exportToPDF` 需要传入渲染后的 DOM 节点；`exportToWord` 需要传入 `ResumeData` 对象。

## 分页与导出（双通道，单一真相源）

- 预览分页：实现运行时分页引擎（以 mm 作为单位）对 DOM 逐块测量分页，应用 keep-with-next/orphans/widows/avoid-* 规则与两栏平衡；渲染为“页面容器”列表（含缩放、页码、缩略图、出血/裁切线），预览即真实分页 DOM；同时使用 @page { size: A4 portrait; margin: 10–15mm } 与 print 媒体样式对齐。
- 出血与裁切：默认出血 3mm，模板需标注安全区。若用浏览器渲染导出，建议配合 Paged Media（如 paged.js）生成裁切线与页码；PDF 侧尽量设置 TrimBox/BleedBox（若选用 puppeteer，需通过内容外扩 + 叠加裁切标记模拟）。
- 页眉/页脚与页码：提供运行中可配置的 header/footer 插槽与页码计数（counter(page) / counter(pages)）。
- 字体一致性：内置并子集化嵌入 CJK 字体（如 Noto Sans CJK），处理版权；在预览与导出共用同一字体栈与 fallback，避免换行差异。
- 文本换行（尤其中文）：line-break: strict 或 loose，word-break: break-word/keep-all 视语言而定；为长链接与无空格文本提供软换行处理；可选连字/标点挤压。
- 图片与分辨率：优先矢量，位图按 300DPI 准备；导出流程做有损/无损按需压缩；避免在浏览器端使用低精度截图型 PDF（html2canvas）导致文字失真。
- Word 导出：在 .docx sectionProperties 设置 pgSz/pgMar，确保与 A4 一致；出血不适用 Word，裁切标记一般不生成；提供页眉/页脚与页码样式映射。
- 数据模型扩展：在 ResumeStyle/metadata 中增加 pageSize、orientation、margins、bleed、cropMarks、pageNumbers、headerTemplate/footerTemplate、fontFamily/fontFallbacks、hyphenation、lineBreakPolicy 等字段。
- 测试与回归：加入 PDF 快照/像素相似度校验与端到端分页用例（长段 CJK、表格/两栏布局、超长列表、无空格字符）；对“标题不孤行”“图片不可跨页”等规则做断言。

### 导出方案（简化版，MVP 优先）

**阶段划分**：
- **Phase 1（MVP）**：仅客户端导出，基于浏览器打印 API
- **Phase 2（v2.0）**：服务端稳定导出（Playwright + pdf-lib 后处理）
- **Phase 3（专业版）**：印刷级特性（出血、裁切标记、CMYK）

#### Phase 1：客户端导出（MVP）

**PDF 导出**：
```typescript
// src/exporters/pdf/client.ts
export async function exportToPDF(element: HTMLElement, options?: {
  preset?: 'standard' | 'professional';
  filename?: string;
}) {
  const preset = PRINT_PRESETS[options?.preset || 'standard'];
  
  // 应用打印样式
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @page {
      size: ${preset.pageSize} ${preset.orientation};
      margin: ${preset.margins.top}mm ${preset.margins.right}mm 
              ${preset.margins.bottom}mm ${preset.margins.left}mm;
    }
    @media print {
      body { font-family: ${preset.fontFallbacks.join(', ')}; }
      .no-print { display: none !important; }
    }
  `;
  document.head.appendChild(styleSheet);
  
  // 触发浏览器打印
  window.print();
  
  // 清理
  document.head.removeChild(styleSheet);
}
```

**Word 导出**：
```typescript
// src/exporters/word/index.ts
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function exportToWord(data: ResumeData, options?: {
  preset?: 'standard' | 'professional';
  filename?: string;
}) {
  const preset = PRINT_PRESETS[options?.preset || 'standard'];
  
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 210, height: 297 }, // A4 in mm
          margin: preset.margins,
        }
      },
      children: [
        new Paragraph({
          text: data.name,
          heading: 'Heading1',
        }),
        // ... 映射其他内容
      ]
    }]
  });
  
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = options?.filename || `${data.name}-resume.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**打印配置（简化）**：
```typescript
// 用户只需选择预设，无需关心复杂参数
interface SimplifiedPrintConfig {
  preset: 'standard' | 'professional';
  pageSize?: 'A4' | 'Letter'; // 可选覆盖
  pageNumbers?: boolean;
}

// 高级配置延后到 v2.0（服务端导出）
interface AdvancedPrintConfig {
  bleed?: number;
  cropMarks?: boolean;
  colorProfile?: 'sRGB' | 'CMYK';
  orphanLines?: number;
  widowLines?: number;
  // ...
}
```

#### Phase 2：服务端导出（延后到 v2.0）

**实现要点**（暂不实现，仅规划）：
- Playwright 固定 Chromium 版本
- pdf-lib 后处理：TrimBox/BleedBox、字体子集、结构树
- 字体收集与子集化（fontkit）
- 可访问性标记（PDF/UA 基线）

**API 设计**：
```typescript
// 未来扩展接口
export async function exportToPDF(element: HTMLElement, options?: {
  strategy?: 'client' | 'server'; // 默认 'client'
  preset?: 'standard' | 'professional';
  // server 选项（v2.0）
  serverOptions?: {
    endpoint?: string;
    auth?: string;
  };
}) {
  if (options?.strategy === 'server') {
    // 调用服务端 API（v2.0 实现）
    return exportToPDFServer(element, options);
  }
  
  // 默认客户端导出
  return exportToPDFClient(element, options);
}
```

#### 测试策略（简化）
```typescript
// tests/export.spec.ts
describe('Export', () => {
  it('should export PDF via print API', async () => {
    const mockPrint = vi.spyOn(window, 'print');
    await exportToPDF(element);
    expect(mockPrint).toHaveBeenCalled();
  });
  
  it('should export Word with correct structure', async () => {
    const blob = await exportToWord(sampleData);
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file('word/document.xml')).toBeTruthy();
  });
  
  // v2.0 测试（延后）
  // it('should generate PDF with TrimBox/BleedBox', ...)
  // it('should embed subset fonts', ...)
});
```

### （参考）PDF 与 Word 差异与导出策略（已合并至上节）

- 页面与分页：
  - PDF：CSS @page 控制尺寸/边距，支持精确分页与多栏；可设置 TrimBox/BleedBox 与裁切标记。
  - Word：通过 .docx sectionProperties(pgSz/pgMar) 与列设置/表格模拟多栏；不支持出血/裁切标记。
- 字体与文本：
  - PDF：嵌入子集字体，保留可搜索/复制文本；控制字距/连字，避免栅格化。
  - Word：引用系统/打包字体，提供字体回退矩阵；不嵌入出血相关标记。
- 颜色与印前：
  - PDF：可写入 OutputIntent(ICC)，可选 CMYK；适合印刷交付。
  - Word：以 sRGB 为主，色彩管理受限，不建议走印刷出血流程。
- 页眉/页脚与页码：
  - PDF：运行元素或后处理叠加；页码 counter(page)/counter(pages)。
  - Word：header/footer + PAGE/NUMPAGES 字段。
- 可访问性与语义：
  - PDF：结构树与角色标记（PDF/UA 基线）。
  - Word：Heading1/Heading2 样式与文档语言。
- 复杂布局映射：
  - 单栏：两端一致；
  - 双栏：PDF 用 CSS columns；Word 用“节列”或表格；
  - 侧栏：PDF 用 grid/columns；Word 建议表格固定侧栏宽；
  - 时间轴：PDF 使用伪元素/绝对定位；Word 使用表格/边框线模拟。
- 结论：导出时走两条流水线但共用“布局令牌”（keepWithNext、orphans/widows、nonBreakable、blockSize、columns、sidebarWidth、gutter），在 PDF/Word 分别做最接近的映射，并为 Word 禁用出血/裁切等不适用特性。

## 模板与排版体系

- 内置模板（首批 5 套）：
  1) Modern 单栏；2) Classic 双栏；3) Sidebar 专业侧栏；4) Timeline 轴线；5) Compact 紧凑。
- 布局能力：
  - 全局：pageLayout { type: 'single'|'two-column'|'sidebar-left'|'sidebar-right'|'timeline', columns?, sidebarWidth?, gutter? }
  - 分节：section.layoutType（同上）与 blockPolicy { keepWithNext, avoidPageBreak, avoidColumnBreak, nonBreakable }
- 数据模型建议：
  - 在 ResumeStyle.print 中加入 pageLayout 与 gutter/sidebarWidth；在 ResumeSection 加入 layoutType 与 blockPolicy。
- 导出映射：
  - PDF：grid/columns/绝对定位 + 分页规则；
  - Word：表格/节列 + 段落属性（keepNext、widowControl）。
- 选择与扩展：模板通过 `src/templates` 暴露元数据（名称/标签/截图/布局类型），在 Demo 中提供模板选择器与布局切换面板。

## 富文本编辑支持

- 目标与范围：提供轻量富文本（段落、无序/有序列表、加粗、斜体、下划线、行内代码、链接），避免复杂版式在导出中失真；标题由模板/节组件负责，富文本不创建页面级标题。
- 数据存储：使用框架无关的 RichText JSON（与 Slate/Lexical 兼容的节点结构）或受限 Markdown 子集；建议默认 JSON，提供 md<->json 转换工具。
- 安全与规范：对粘贴内容进行白名单清洗（允许 a/strong/em/u/code/ul/ol/li/p），移除内联样式；限制最大嵌套层级与段落长度。
- 导出映射：
  - PDF：将节点映射为语义标签并应用样式，保持文本+矢量；链接转注释/目标。
  - Word：映射为段落/列表与字符样式，链接转为 w:hyperlink；不写入出血/裁切。
- 测试：富文本 round-trip（编辑->保存->再加载）、复制/粘贴常见来源（Web/Word）清洗正确、PDF/Word 标记一致性。

## 编辑体验与系统特性

- 字段校验与错误提示：Schema 驱动校验，联动高亮与消息聚合。
- 撤销/重做与历史快照：支持分节级别的撤销栈；提供“重置为模板”命令。
- 自动保存/草稿：本地存储或 IndexedDB 间隔保存；提供手动快照与恢复。
- 导入/导出：JSON 与含资源 ZIP（图片、字体引用）；支持从简历平台/LinkedIn 数据导入映射（可选）。
- 多语言与本地化：UI i18n、日期/地区化格式；简历内容多语版本（可选）。
- 可访问性：键盘导航、ARIA 标注、焦点顺序与对比度基线；导出含语义结构（PDF/UA 基线）。
- 资产与合规：图片压缩策略（有损/无损）、字体许可与打包清单、隐私脱敏（可选隐藏联系方式）、水印/签名（可选）。
- 性能与稳定：大文档只读虚拟化、长文分页稳定性回归、确定性构建/浏览器版本锁定。

## 集成扩展附录（可选）

### React / Next.js 支持说明

- 架构定位：React 优先；核心逻辑（src/core、exporters、runtime）与渲染分离，可直接在 Next.js 中使用，不依赖浏览器特定 API 初始化。
- 编辑器在 Next.js 中的使用：建议在页面级使用动态加载（dynamic import）并关闭 SSR（如 `dynamic(() => import('../components/ResumeEditor'), { ssr: false })`）以避免富文本编辑器对 DOM 的运行期依赖；Viewer 组件可 SSR 以获得首屏内容与 SEO。
- PDF/Word 导出于 Next.js：
  - 客户端快速预览导出：保持现有 `exportToPDF(element)` 行为。
  - 后端稳定导出（Playwright/Chromium）：提供 API Route (`/api/export/pdf`) 在 Node 环境生成稳定版本并后处理 TrimBox/BleedBox；若使用 Vercel Serverless，需在 Edge 不支持的场景回退到客户端导出或使用自建服务器。
- 字体与样式：在 Next.js `_app.tsx` 中统一注入字体与全局样式，确保 SSR 与客户端一致，避免分页换行差异；使用 `next/font` 时需保证可在 PDF 产线子集化的原字体文件可访问。
- 路由与多页：推荐专用编辑路径 `/resume/edit` 与预览路径 `/resume/[id]`；预览页可生成静态/ISR，导出操作调用后端 API 实现批量或定时刷新。
- 缓存与性能：利用 React 服务器组件仅在需要编辑器时加载客户端组件；对大简历 Viewer 层可开启段落虚拟化（IntersectionObserver + 分块渲染），SSR 输出骨架。
- 安全与合规：API 导出需校验用户权限与速率限制；在 Next.js 中通过中间件添加鉴权（如 JWT / session）。

### （参考）导出模式（已合并至上节）

- 设计目标：同时一流支持“客户端快速导出”和“服务器端稳定导出”，开发期即抽象导出策略并保持两路等价产物。
- 导出策略：export({ strategy: 'client' | 'server' | 'auto' })；auto 先选 server，不可用时回退 client，并记录告警。
- 公共基础：预览分页 DOM 与布局令牌为单一真相源（SSOT），PDF 与 Word 均基于此映射生成，避免双轨偏差。
- 客户端（浏览器直接导出）：
  - 方式：CSS Paged（@page + print 媒体）/ paged.js + window.print 或浏览器“另存为 PDF”。
  - 优点：所见即所得、零后端、速度快。
  - 局限：无法无对话框生成 PDF；无法写入 TrimBox/BleedBox/ICC；字体与可访问性标记不可控；跨浏览器一致性一般。
- 服务器端（SSR/Playwright 稳定产线）：
  - 方式：固定版本 Chromium 渲染，printToPDF + pdf-lib 后处理（TrimBox/BleedBox/裁切标记/字体子集/结构树）。
  - 优点：确定性强、可印前、统一字体与分页；适合批量/自动化。
  - 局限：需要后端运行环境和资源配额。
- 推荐：双通道并行提供。编辑阶段默认客户端导出；正式交付/批量任务采用服务器端稳定产线，并保留策略切换入口。

## React 组件架构与规范

### 组件状态管理

#### 编辑器状态设计
```typescript
// src/react/state/types.ts
interface EditorState {
  // 文档数据（核心）
  document: ResumeData;
  
  // 编辑状态
  selection: SelectionState | null;
  focusedSection: string | null;
  
  // 历史栈（撤销/重做）
  history: {
    past: ResumeData[];
    future: ResumeData[];
    limit: number; // 默认 50
  };
  
  // UI 状态
  ui: {
    activeTab: 'edit' | 'preview' | 'settings';
    isExporting: boolean;
    paginationEnabled: boolean;
    previewScale: number; // 0.5 ~ 1.5
  };
  
  // 验证状态
  validation: {
    issues: ValidationIssue[];
    isValid: boolean;
  };
}

interface SelectionState {
  sectionId: string;
  itemIndex?: number;
  fieldPath?: string[];
}

interface ValidationIssue {
  id: string;
  level: 'error' | 'warning' | 'info';
  path: string; // e.g., "sections[0].items[1].email"
  message: string;
  suggestion?: string;
}
```

#### 状态管理方案
**推荐方案**：React Context + useReducer（MVP）→ Zustand（扩展期）

**MVP 实现（Context + useReducer）**：
```typescript
// src/react/state/EditorContext.tsx
import { createContext, useContext, useReducer, useCallback } from 'react';
import { produce } from 'immer';

type EditorAction =
  | { type: 'SET_DOCUMENT'; payload: ResumeData }
  | { type: 'UPDATE_SECTION'; payload: { id: string; data: Partial<ResumeSection> } }
  | { type: 'ADD_SECTION'; payload: ResumeSection }
  | { type: 'REMOVE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: { from: number; to: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_SELECTION'; payload: SelectionState | null }
  | { type: 'SET_UI'; payload: Partial<EditorState['ui']> }
  | { type: 'SET_VALIDATION'; payload: ValidationIssue[] };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'SET_DOCUMENT':
        draft.document = action.payload;
        break;
      
      case 'UPDATE_SECTION': {
        const section = draft.document.sections.find(s => s.id === action.payload.id);
        if (section) Object.assign(section, action.payload.data);
        break;
      }
      
      case 'ADD_SECTION':
        // 保存当前状态到历史
        draft.history.past.push(draft.document);
        if (draft.history.past.length > draft.history.limit) {
          draft.history.past.shift();
        }
        draft.history.future = [];
        draft.document.sections.push(action.payload);
        break;
      
      case 'REMOVE_SECTION':
        draft.history.past.push(draft.document);
        draft.history.future = [];
        draft.document.sections = draft.document.sections.filter(s => s.id !== action.payload);
        break;
      
      case 'REORDER_SECTIONS': {
        const { from, to } = action.payload;
        const [removed] = draft.document.sections.splice(from, 1);
        draft.document.sections.splice(to, 0, removed);
        break;
      }
      
      case 'UNDO':
        if (draft.history.past.length > 0) {
          draft.history.future.unshift(draft.document);
          draft.document = draft.history.past.pop()!;
        }
        break;
      
      case 'REDO':
        if (draft.history.future.length > 0) {
          draft.history.past.push(draft.document);
          draft.document = draft.history.future.shift()!;
        }
        break;
      
      case 'SET_SELECTION':
        draft.selection = action.payload;
        break;
      
      case 'SET_UI':
        Object.assign(draft.ui, action.payload);
        break;
      
      case 'SET_VALIDATION':
        draft.validation.issues = action.payload;
        draft.validation.isValid = !action.payload.some(i => i.level === 'error');
        break;
    }
  });
}

const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
} | null>(null);

export function EditorProvider({ children, initialData }: { children: React.ReactNode; initialData: ResumeData }) {
  const [state, dispatch] = useReducer(editorReducer, {
    document: initialData,
    selection: null,
    focusedSection: null,
    history: { past: [], future: [], limit: 50 },
    ui: { activeTab: 'edit', isExporting: false, paginationEnabled: false, previewScale: 1 },
    validation: { issues: [], isValid: true }
  });
  
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
}
```

#### 自定义 Hooks
```typescript
// src/react/hooks/useEditorActions.ts
export function useEditorActions() {
  const { dispatch } = useEditor();
  
  return {
    updateSection: useCallback((id: string, data: Partial<ResumeSection>) => {
      dispatch({ type: 'UPDATE_SECTION', payload: { id, data } });
    }, [dispatch]),
    
    addSection: useCallback((section: ResumeSection) => {
      dispatch({ type: 'ADD_SECTION', payload: section });
    }, [dispatch]),
    
    removeSection: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_SECTION', payload: id });
    }, [dispatch]),
    
    reorderSections: useCallback((from: number, to: number) => {
      dispatch({ type: 'REORDER_SECTIONS', payload: { from, to } });
    }, [dispatch]),
    
    undo: useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]),
    redo: useCallback(() => dispatch({ type: 'REDO' }), [dispatch]),
  };
}

// src/react/hooks/useExport.ts
export function useExport() {
  const { state, dispatch } = useEditor();
  
  const exportToPDF = useCallback(async (element: HTMLElement) => {
    dispatch({ type: 'SET_UI', payload: { isExporting: true } });
    try {
      const { exportToPDF } = await import('../../exporters/pdf');
      await exportToPDF(element);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_UI', payload: { isExporting: false } });
    }
  }, [dispatch]);
  
  const exportToWord = useCallback(async () => {
    dispatch({ type: 'SET_UI', payload: { isExporting: true } });
    try {
      const { exportToWord } = await import('../../exporters/word');
      await exportToWord(state.document);
    } catch (error) {
      console.error('Word export failed:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_UI', payload: { isExporting: false } });
    }
  }, [state.document, dispatch]);
  
  return { exportToPDF, exportToWord, isExporting: state.ui.isExporting };
}

// src/react/hooks/useAutoSave.ts
export function useAutoSave(interval: number = 30000) {
  const { state } = useEditor();
  
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('resume-draft', JSON.stringify({
        data: state.document,
        timestamp: Date.now()
      }));
    }, interval);
    
    return () => clearInterval(timer);
  }, [state.document, interval]);
}
```

### 组件拆分规范

#### 组件层级结构
```
ResumeEditor (容器组件)
├─ EditorToolbar (工具栏)
│  ├─ UndoRedoButtons
│  ├─ TemplateSelector
│  └─ ExportButtons
├─ EditorSidebar (侧边栏)
│  ├─ SectionList (节列表，支持拖拽)
│  └─ SettingsPanel
└─ EditorCanvas (编辑画布)
   ├─ SectionEditor[] (节编辑器，可重复)
   │  ├─ SectionHeader
   │  ├─ SectionContent
   │  │  └─ FieldEditor[] (字段编辑器)
   │  │     ├─ TextInput
   │  │     ├─ RichTextEditor
   │  │     ├─ DatePicker
   │  │     └─ ImageUploader
   │  └─ SectionActions
   └─ AddSectionButton

ResumeViewer (预览组件)
├─ ViewerToolbar
│  ├─ ZoomControls
│  └─ PageNavigation
└─ ViewerCanvas
   ├─ PageContainer[] (分页容器)
   │  ├─ PageHeader
   │  ├─ PageContent
   │  │  └─ SectionRenderer[]
   │  │     └─ ItemRenderer[]
   │  └─ PageFooter
   └─ PageThumbnails
```

#### 原子组件
```typescript
// src/react/components/atoms/TextInput.tsx
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function TextInput({ value, onChange, placeholder, maxLength, required, error, disabled }: TextInputProps) {
  return (
    <div className="text-input-wrapper">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? 'error-message' : undefined}
      />
      {error && <span id="error-message" className="error-text">{error}</span>}
    </div>
  );
}

// src/react/components/atoms/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button = React.memo(function Button({ variant = 'primary', size = 'md', disabled, loading, icon, onClick, children }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading && <Spinner />}
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
});
```

#### 组合组件
```typescript
// src/react/components/molecules/SectionEditor.tsx
interface SectionEditorProps {
  section: ResumeSection;
  onChange: (data: Partial<ResumeSection>) => void;
  onRemove: () => void;
  isSelected?: boolean;
}

export const SectionEditor = React.memo(function SectionEditor({ section, onChange, onRemove, isSelected }: SectionEditorProps) {
  const { updateSection } = useEditorActions();
  
  return (
    <div className={`section-editor ${isSelected ? 'selected' : ''}`}>
      <SectionHeader
        title={section.title}
        onTitleChange={(title) => onChange({ title })}
        onRemove={onRemove}
      />
      <SectionContent
        type={section.type}
        items={section.items}
        onItemsChange={(items) => onChange({ items })}
      />
    </div>
  );
});

// src/react/components/organisms/EditorToolbar.tsx
export function EditorToolbar() {
  const { undo, redo } = useEditorActions();
  const { exportToPDF, exportToWord, isExporting } = useExport();
  const { state } = useEditor();
  
  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <Button icon={<UndoIcon />} onClick={undo} disabled={state.history.past.length === 0}>撤销</Button>
        <Button icon={<RedoIcon />} onClick={redo} disabled={state.history.future.length === 0}>重做</Button>
      </div>
      
      <div className="toolbar-group">
        <TemplateSelector />
      </div>
      
      <div className="toolbar-group">
        <Button onClick={() => exportToPDF(document.querySelector('.viewer-canvas')!)} loading={isExporting}>导出 PDF</Button>
        <Button onClick={exportToWord} loading={isExporting}>导出 Word</Button>
      </div>
    </div>
  );
}
```

### 错误边界与降级

#### React 错误边界
```typescript
// src/react/components/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // 上报错误（可选）
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }
  
  resetError = () => {
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} resetError={this.resetError} />;
    }
    
    return this.props.children;
  }
}

// 默认错误降级 UI
function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="error-fallback">
      <h2>😔 出错了</h2>
      <details>
        <summary>错误详情</summary>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </details>
      <Button onClick={resetError}>重试</Button>
      <Button variant="secondary" onClick={() => window.location.reload()}>刷新页面</Button>
    </div>
  );
}
```

#### 局部错误边界
```typescript
// src/react/components/ResumeEditor.tsx
export function ResumeEditor({ value, onChange, ...props }: ResumeEditorProps) {
  return (
    <ErrorBoundary
      fallback={EditorErrorFallback}
      onError={(error) => {
        console.error('Editor error:', error);
        // 保存当前数据到 localStorage 避免丢失
        localStorage.setItem('resume-error-backup', JSON.stringify(value));
      }}
    >
      <EditorProvider initialData={value}>
        <EditorContent onChange={onChange} {...props} />
      </EditorProvider>
    </ErrorBoundary>
  );
}

// 编辑器专用错误降级
function EditorErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  const hasBackup = localStorage.getItem('resume-error-backup');
  
  return (
    <div className="editor-error">
      <h3>编辑器加载失败</h3>
      <p>{error.message}</p>
      {hasBackup && (
        <Button onClick={() => {
          const backup = JSON.parse(localStorage.getItem('resume-error-backup')!);
          // 恢复数据并重置错误
          resetError();
        }}>
          恢复上次编辑
        </Button>
      )}
      <Button variant="secondary" onClick={resetError}>重新加载</Button>
    </div>
  );
}
```

#### 导出错误处理
```typescript
// src/exporters/errors.ts
export enum ExportErrorCode {
  FONT_MISSING = 'E_FONT_MISSING',
  LAYOUT_OVERFLOW = 'E_LAYOUT_OVERFLOW',
  EXPORT_TIMEOUT = 'E_EXPORT_TIMEOUT',
  BROWSER_UNSUPPORTED = 'E_BROWSER_UNSUPPORTED',
  NETWORK_ERROR = 'E_NETWORK_ERROR',
}

export class ExportError extends Error {
  constructor(
    public code: ExportErrorCode,
    message: string,
    public details?: any,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

// src/react/hooks/useExport.ts (增强版)
export function useExport() {
  const [error, setError] = useState<ExportError | null>(null);
  
  const exportToPDF = useCallback(async (element: HTMLElement) => {
    try {
      setError(null);
      // 检查浏览器支持
      if (!window.print) {
        throw new ExportError(
          ExportErrorCode.BROWSER_UNSUPPORTED,
          '当前浏览器不支持打印功能',
          { userAgent: navigator.userAgent },
          false
        );
      }
      
      // 导出逻辑...
      const { exportToPDF } = await import('../../exporters/pdf');
      await exportToPDF(element);
    } catch (err) {
      const exportError = err instanceof ExportError
        ? err
        : new ExportError(ExportErrorCode.EXPORT_TIMEOUT, '导出失败', { originalError: err }, true);
      
      setError(exportError);
      throw exportError;
    }
  }, []);
  
  return { exportToPDF, error, clearError: () => setError(null) };
}
```

#### 降级策略
```typescript
// src/react/components/ExportPanel.tsx
export function ExportPanel() {
  const { exportToPDF, exportToWord, error } = useExport();
  
  // 检测功能支持
  const canExportPDF = typeof window !== 'undefined' && window.print;
  const canExportWord = true; // Word 导出基于纯 JS，总是可用
  
  return (
    <div className="export-panel">
      <h3>导出简历</h3>
      
      {!canExportPDF && (
        <Alert variant="warning">
          您的浏览器不支持 PDF 导出，建议使用 Chrome/Edge/Safari 最新版本
        </Alert>
      )}
      
      <Button
        onClick={() => exportToPDF(document.querySelector('.viewer-canvas')!)}
        disabled={!canExportPDF}
      >
        导出 PDF
      </Button>
      
      <Button onClick={exportToWord}>
        导出 Word
      </Button>
      
      {error && (
        <Alert variant="error">
          <strong>导出失败：</strong>{error.message}
          {error.recoverable && (
            <Button size="sm" onClick={() => window.location.reload()}>
              刷新重试
            </Button>
          )}
        </Alert>
      )}
      
      {/* 降级方案：手动复制 */}
      <details>
        <summary>导出失败？试试手动复制</summary>
        <p>按 Ctrl+A 全选，然后 Ctrl+C 复制到 Word 中</p>
      </details>
    </div>
  );
}
```

## 组件 API（React 组件）

### ResumeEditor（主编辑器组件）
```typescript
interface ResumeEditorProps {
  // 核心 props
  value: ResumeData;
  onChange: (data: ResumeData) => void;
  
  // 功能配置
  config?: {
    enableDragDrop?: boolean; // 默认 true
    enableRichText?: boolean; // 默认 true
    enableAutoSave?: boolean; // 默认 true
    autoSaveInterval?: number; // 默认 30000ms
    maxSections?: number; // 默认 20
    maxHistorySize?: number; // 默认 50
  };
  
  // 样式与主题
  theme?: ThemeTokens;
  className?: string;
  style?: React.CSSProperties;
  
  // 验证
  schema?: z.ZodSchema | ((data: ResumeData) => ValidationIssue[]);
  
  // 槽位（自定义渲染）
  slots?: {
    toolbar?: React.ReactNode;
    sidebar?: React.ReactNode;
    sectionHeader?: (section: ResumeSection) => React.ReactNode;
    footer?: React.ReactNode;
  };
  
  // 事件回调
  onError?: (error: Error) => void;
  onValidationChange?: (issues: ValidationIssue[]) => void;
  onSelectionChange?: (selection: SelectionState | null) => void;
  
  // 只读模式
  readOnly?: boolean;
}

// 使用示例
<ResumeEditor
  value={resume}
  onChange={setResume}
  config={{
    enableAutoSave: true,
    maxSections: 15
  }}
  schema={ResumeDataSchema}
  slots={{
    toolbar: <CustomToolbar />
  }}
  onError={(err) => console.error(err)}
/>
```

### ResumeViewer（预览组件）
```typescript
interface ResumeViewerProps {
  // 核心 props
  data: ResumeData;
  
  // 模板与样式
  template?: string | TemplateMeta;
  theme?: ThemeTokens;
  className?: string;
  style?: React.CSSProperties;
  
  // 分页配置
  paginate?: boolean; // 默认 false
  print?: {
    preset?: 'standard' | 'professional'; // 简化配置，使用预设
    pageSize?: 'A4' | 'Letter';
    margins?: number; // 统一边距，单位 mm
    pageNumbers?: boolean;
  };
  
  // 缩放与导航
  scale?: number; // 0.5 ~ 1.5，默认 1
  showThumbnails?: boolean;
  
  // 事件
  onError?: (error: Error) => void;
  onPageChange?: (page: number) => void;
}

// 使用示例
<ResumeViewer
  data={resume}
  template="modern"
  paginate={true}
  print={{
    preset: 'standard', // 简化：只需选择预设
    pageNumbers: true
  }}
  scale={0.85}
/>
```

### 打印配置预设（简化方案）
```typescript
// src/core/print-presets.ts
export const PRINT_PRESETS = {
  standard: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 15, right: 12, bottom: 15, left: 12 }, // mm
    pageNumbers: false,
    accessibility: true,
    columns: 1,
    fontFallbacks: ['Noto Sans', 'Arial', 'sans-serif'],
    subsetFonts: true,
  },
  
  professional: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 15, bottom: 20, left: 15 },
    pageNumbers: true,
    accessibility: true,
    columns: 1,
    fontFallbacks: ['Noto Sans', 'Arial', 'sans-serif'],
    subsetFonts: true,
    // 专业模式：延后到 v2.0
    // bleed: 3,
    // cropMarks: true,
    // colorProfile: 'sRGB',
  }
} as const;

// 用户可扩展
export type PrintPreset = keyof typeof PRINT_PRESETS;
```

### 错误处理
- 编辑态校验：返回 `ValidationIssue[]` 列表，UI 高亮对应字段
- 导出失败：抛出 `ExportError`，包含 `code`、`message`、`recoverable` 字段
- 组件错误：通过 `ErrorBoundary` 捕获，显示降级 UI

## 核心 API
| 函数 | 用途 |
|------|------|
| `createResume(data?)` | 生成一个空简历或基于初始数据构建简历对象 |
| `updateSection(resume, id, payload)` | 按模块 ID 更新内容 |
| `addSection(resume, section)` | 新增模块 |
| `removeSection(resume, id)` | 删除模块 |
| `exportToPDF(element)` | 将当前渲染内容导出为 PDF |
| `exportToWord(resumeData)` | 将简历数据导出为 Word 文件 |

## 构建与发布
使用 Vite 进行构建：
```bash
npm run build
```

> 当前仓库已落地 Vite 7 + React 19 + TypeScript 5.9 的基础脚手架：`npm run dev` 会启动根目录 `index.html` + `src/dev` 的演示编辑器，`npm run build` 通过 Vite library mode 产出 `dist/resume-engine.(es|umd).js` 与 `dist/types`，`npm run test` 走 Vitest（jsdom 环境），`npm run lint` 使用 Flat Config（ESLint 9 + typescript-eslint 8 + react）。新增依赖与脚本时请同步在此处说明。

构建输出：
- ESM: `dist/resume-engine.es.js`
- UMD: `dist/resume-engine.umd.js`
- Types: `dist/types`（内置 d.ts 类型定义）

发布到 npm：
```bash
npm publish --access public
```

## 目录结构
```
resume-engine/
├─ src/
│  ├─ core/          # 数据结构与逻辑
│  ├─ exporters/     # PDF / Word 导出
│  ├─ react/         # 默认 React 组件（可选）
│  ├─ runtime/       # 函数式渲染工具
│  └─ index.ts       # 包导出入口
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

## Demo 功能规划

为方便快速验证集成方式，当前仅提供 React Demo（仅文档要求，不立即提交实现代码）。

### 目录结构（建议）
```
resume-engine/
  demo/
    react/           # Vite + React + TS 示例
      src/main.tsx
      src/App.tsx    # 使用 <ResumeViewer /> 演示编辑/预览/导出与拖拽排序
      src/components/EditorWrapper.tsx
      vite.config.ts
```

### 关键要求
1. 本地源码直连：React demo 通过 Vite alias 指向 `../src`，避免发布后再安装；确保对核心代码修改可即时热更新。
2. 模块拆分：React Demo 展示完整编辑（Editor + Viewer + 导出按钮 + 拖拽排序 + 模板选择器/布局切换）；拖拽基于 SortableJS（react-sortablejs）。
3. 数据初始化：共享 `demo/shared/sample-resume.ts`；包含多 section、CJK、长列表、图片与两栏布局场景用于分页与导出测试。
4. 配置开关面板：React Demo 提供“打印/分页设置”控制（pageSize、margins、bleed、cropMarks、pageNumbers、columns、rtl、hyphenation）。
5. 字体与资源：Demo 引入一套开源字体（如 Noto Sans），并在 README 标明版权；图片资源 ≤ 200KB 并放入 `demo/assets/`。
6. 导出回调：封装 `useExport()`（React）以演示调用链（准备 -> 渲染稳定 -> 调用 export -> 成功/失败状态反馈）。
7. 版本锁定：Vite、Playwright、TypeScript 版本在 demo/package.json 明确写死（避免回归漂移）；Playwright 使用同一浏览器版本与主项目测试保持一致。
8. 构建脚本：根级新增 npm scripts：`demo:react`。
9. 访问路径：
   - React Demo: http://localhost:5273
10. 国际化占位：React Demo 提供英文/中文切换按钮。

### 测试策略（要求）
1. 单元测试：对示例数据转换与 hook（useExport）逻辑编写 Vitest/React Testing Library 测试；放置于各自 `__tests__`。
2. 集成测试（Playwright）：
   - React：加载页面 -> 修改分页设置（切换 A4→Letter）-> 导出 PDF -> 断言页数/尺寸；点击导出 Word -> 验证 docx 基础结构（content types + document.xml 存在）。
3. 可视回归：对 React Demo 首屏与导出 PDF 第 1 页做像素 diff（基线放 `tests/fixtures/baseline`）。
4. 性能指标（可选）：记录首屏渲染时间与导出耗时（控制台打点），未来可用于性能回归。

### 文档与可发现性
- 在 README 增加 Demo 章节（启动命令、端口、功能说明、截图占位）。
- Demo 目录下自带 `README.md` 描述限制、字体许可、测试命令。

### 后续演进
- 增加 Svelte / Web Components 对比 Demo。
- 提供在线沙箱（StackBlitz 模板链接）。
- 引入分页调试 Overlay（显示分页断点、出血/裁切线）。

## 实施步骤与测试计划（2025-11）

以下为“非图片 PDF（文本+矢量）导出 + React Demo”的落地步骤，每步含最小可行交付与测试。

1) 定义打印/导出配置字段
- 实现：在数据模型中引入 ResumeStyle.print（pageSize, orientation, margins, bleed, cropMarks, pageNumbers, columns, rtl, hyphenation, keepWithNext, orphanLines, widowLines, colorProfile, accessibility, fontFallbacks, subsetFonts）。提供默认合并策略与校验错误提示。
- 测试：Vitest 覆盖默认值合并/非法值报错；示例 JSON 通过 schema 校验。

2) CSS 打印基线与虚拟分页预览
- 实现：print 媒体样式 + @page A4/mm 边距；分页容器与 break-before/inside/after 规则；编辑区提供缩放的分页预览（所见即所得）。
- 测试：Playwright 断言页面启用 print CSS 后的 @page 尺寸与 margin；对长文示例检查分页断点标记存在与顺序正确（DOM 标记校验）。

3) 固定 Chromium 的 Playwright 导出
- 实现：使用 preferCSSPageSize: true 导出 PDF；锁定浏览器版本，统一渲染差异。
- 测试：E2E 导出后校验 PDF 页面尺寸= A4，页数正确；回归流水线打印版本号并断言一致。

4) PDF 后处理（TrimBox/BleedBox 与裁切标记）
- 实现：pdf-lib 写入 Media/Trim/BleedBox；根据 bleed 绘制裁切/出血标记；可配置启用。
- 测试：解析 PDF 对象断言三个 Box 存在与数值正确；第一页边角存在裁切标记路径。

5) 字体子集与嵌入
- 实现：收集已用 glyph，生成子集并嵌入，统一字体栈与回退；禁止整页栅格化。
- 测试：导出 PDF 可搜索/复制文本；嵌入字体名带 +Subset 前缀；开启/关闭子集对比体积差异>20%。

6) CJK/RTL 换行与孤行寡行控制
- 实现：line-break/word-break 策略；orphans/widows 与 keep-with-next 生效。
- 测试：CJK 长段不出现单行孤立；RTL 段落视觉与阅读顺序正确（截图 + DOM dir 校验）。

7) 两栏布局与列平衡
- 实现：columns=2 时列高平衡，图片/标题不可跨页；必要时插入软分页。
- 测试：给定样例断言列高差<1 行；图片整块保留同页；标题与下一段同页。

8) 图片与分辨率策略
- 实现：优先矢量；位图按 300DPI；按需压缩；禁止 html2canvas 整页截图路线。
- 测试：PDF 解析确认存在文本对象而非整页 Image XObject；嵌入图片元信息/像素尺寸达标。

9) 颜色与印前（可选增量）
- 实现：写入 OutputIntent（sRGB 默认，可选 CMYK/ICC）；保留对象色彩。
- 测试：PDF 有 OutputIntent；CMYK 路径时抽样对象色彩空间=DeviceCMYK/ICCBased。

10) Word 导出基线
- 实现：.docx sectionProperties 映射 pageSz/pageMar；header/footer 页码；不生成出血/裁切。
- 测试：用 JSZip 解包校验 [Content_Types].xml、word/document.xml 存在；解析 pageSz 与页边距数值正确。

11) 可访问性与语义（PDF/UA 基线）
- 实现：渲染阶段添加语义 role/heading；PDF 标记结构树，写入标题/语言元数据。
- 测试：解析 PDF 存在 StructTreeRoot 与标记内容；Word 样式为 Heading1/2 的段落存在。

12) Demo：React 编辑/预览/导出 + 拖拽排序
- 实现：Vite alias 指向源码；React Demo 含编辑/分页设置/导出与拖拽排序。
- 测试：Playwright：
  - React：切换 A4→Letter 导出，断言 PDF 尺寸变化与页数稳定；导出 Word，校验 docx 基础结构。

13) 视觉回归与像素差
- 实现：建立基线截图与 PDF 第1页渲染图；阈值<0.5%。
- 测试：CI 中对比通过即绿灯，超阈值失败并产出差异图。

14) CI 集成与版本锁
- 实现：锁 playwright/ts/vite 版本；上传 PDF/Docx 作为构建工件；缓存字体与浏览器。
- 测试：CI 成功产出工件；版本哈希与预期一致；失败时阻断合并。

15) 降级应急（可选）
- 实现：在极端环境提供“栅格化导出”开关，默认关闭，并标注提示。
- 测试：打开降级后导出为整页位图 PDF；关闭时回到文本+矢量。

## 开发步骤清单（2025-11-06）

1) 数据模型与类型
- 实现：落地 ResumePrintConfig、PageLayout、BlockPolicy、RichTextNode/Inline，并挂入 ResumeStyle.print/pageLayout 与 ResumeSection.layoutType/policy。
- 测试：Vitest 校验默认值合并/非法值报错；样例 JSON 通过 schema 校验。

2) React 组件骨架（Editor/Viewer）
- 实现：可编辑表单 + 预览渲染，最小字段集（姓名/标题/段落/列表/图片/节排序）。
- 测试：RTL 渲染无警告；基本交互单测（受控 value/onChange）。

3) 模板系统与内置 5 套模板
- 实现：Modern/Classic/Sidebar/Timeline/Compact，提供元数据（name/tags/screenshot/layoutType）。
- 测试：模板渲染快照；模板切换不丢失数据。

4) 打印与分页预览
- 实现：print CSS + @page(A4/mm) + 分页容器 + 断点标记，支持 columns 与 keep-with-next/孤行寡行策略。
- 测试：Playwright 断言 @page 尺寸/边距；长文断点顺序正确。

5) PDF 导出（客户端快速预览）
- 实现：exportToPDF(element, { preferCSSPageSize: true })；复用预览分页 DOM 与样式，所见即所得。
- 测试：导出的 PDF 尺寸=A4，页数与预览匹配（对每页进行像素差抽样）。

6) PDF 稳定导出（服务端 Playwright）
- 实现：Node/Next API 路由使用固定 Chromium 版本生成 PDF；同一路由渲染复用分页 DOM（无 UI 控件）。
- 测试：记录浏览器版本；E2E 校验同一输入产出一致；与预览页数一致、首页像素差阈值<0.5%。

7) PDF 后处理（Bleed/Trim/CropMarks）
- 实现：pdf-lib 设置 Media/Trim/BleedBox，绘制裁切/出血标记（可开关）。
- 测试：解析对象确认三 Box 与标记路径存在且数值正确。

8) 字体子集与嵌入
- 实现：收集 glyph，子集化并嵌入；统一字体栈与回退，禁止整页位图。
- 测试：PDF 文本可搜索复制；开启子集体积降低>20%。

9) Word 导出
- 实现：.docx sectionProperties 映射 pageSz/pageMar；将布局令牌映射为显式分页符/节列（sectPr）、段落/列表样式；不生成出血/裁切标记；通过段落/列表样式与 widowControl/orphanControl/keepNext 控制分页整齐；侧栏用表格/节列保证版面。
- 测试：JSZip 解包验证 [Content_Types].xml/word/document.xml/word/styles.xml/word/numbering.xml 存在；pgSz/pgMar/sectPr 正确；段落属性 widowControl/orphanControl/keepNext 生效；页数近似匹配预览。

10) 富文本编辑（轻量）
- 实现：集成 Slate/Lexical 其一，支持段落/列表/加粗/斜体/下划线/代码/链接；粘贴白名单清洗；JSON 存储与 md<->json 转换。
- 测试：round-trip 正确；常见来源粘贴清洗符合规则；PDF/Word 标记一致。

11) 拖拽排序
- 实现：react-sortablejs 重排节与条目；提供 onReorder 与约束（不可跨页拆分的块禁止拆分）。
- 测试：顺序变更数据正确；受限块不可被拆分。

12) 可访问性与键盘导航
- 实现：焦点环与快捷键、ARIA 标注、色彩对比；导出含结构树/Heading。
- 测试：axe 基线通过；PDF 含 StructTreeRoot；键盘完成主要操作。

13) 国际化与本地化
- 实现：UI i18n（中/英）、日期/地区格式；内容多语（可选）。
- 测试：语言切换不丢状态；格式化正确。

14) 资产与导入导出
- 实现：JSON 与 ZIP（打包图片、字体引用）；图片压缩（有损/无损）策略；隐私脱敏选项；水印/签名（可选）。
- 测试：ZIP round-trip；图片压缩率与质量阈值；脱敏开关有效。

（附录）15) Next.js 集成
- 实现：Editor 动态导入禁 SSR，Viewer 可 SSR；提供 /api/export/pdf 示例；统一字体/全局样式。
- 测试：Next 本地与构建后正常；服务端导出与客户端导出差异可控。

16) React Demo 应用
- 实现：模板选择/布局切换、分页设置、编辑与导出、拖拽排序；Vite alias 指向源码。
- 测试：Playwright 场景流：切 A4→Letter 导出 PDF 成功、导出 Word 成功。

17) 回归与像素对比
- 实现：建立基线截图与 PDF 第1页渲染图，阈值<0.5%。
- 测试：CI 像素差对比通过；失败输出差异图。

18) 性能与稳定
- 实现：大文档只读虚拟化；导出耗时与内存指标记录；浏览器/字体版本锁定。
- 测试：基准数据集达标（如 TTI/导出耗时阈值）；版本变更触发告警。

19) 安全与合规
- 实现：API 权限与速率限制；资源域名白名单；字体许可清单生成。
- 测试：未授权导出被拒；依赖与许可扫描通过。

20) CI/CD 与发布
- 实现：lint/typecheck/test/e2e/visual 全绿后发布；上传 PDF/Docx 构建工件；版本变更记录（Conventional Commits）。
- 测试：CI 全链路通过；包体与导出产物抽检。

（附录）21) 在线简历生成器 Demo（部署与分享，含风控）
- 实现：将 React Demo 部署到 Vercel/Netlify，开启只读预览与导出；编辑端需登录（可选）；启用 export({strategy:'auto'}) 并在 UI 显示“快速导出/稳定导出”切换；静态打包字体/缓存浏览器、为外链图片配置代理或 CORS；提供可分享链接与 SEO 元数据。
- 测试：线上 URL 可用；客户端与服务端导出均成功；字体一致性与分页一致性通过；生成 PDF/Docx 可下载；API 鉴权/限流有效；基本 SEO 校验通过。

（附录）22) 插件与主题令牌
- 实现：定义插件钩子与主题 tokens；模板按 tokens 渲染；暗色/打印优化切换。
- 测试：示例插件能拦截导出并插入水印；主题切换不影响分页。

（附录）23) Schema 版本化与迁移
- 实现：schemaVersion 与 migrate 工具；导入自动迁移与告警。
- 测试：旧版样例迁移成功，产物一致。

（附录）24) 多格式导出
- 实现：新增 JSON Resume/Markdown/纯文本/HTML 导出。
- 测试：与预览内容一致；MD/HTML 不丢语义结构。

（附录）25) 版本历史与快照
- 实现：本地版本历史/快照与差异对比；回滚能力。
- 测试：多次编辑后可正确回滚；快照可分享只读。

（附录）26) CLI 批量转换
- 实现：提供 CLI 命令批量把 JSON 转 PDF/Word/HTML/MD；支持重试。
- 测试：大批量转换稳定，失败重试生效。

27) 合规与隐私
- 实现：字段脱敏与可选加密；数据导出告知。
- 测试：脱敏导出不含敏感字段；加密字段仅在授权端解密。

28) 安全加固
- 实现：富文本清洗、上传验证、恶意链接扫描；依赖与许可证审计。
- 测试：恶意 Payload 被阻断；许可证报告通过。

（附录）29) 队列与背压
- 实现：服务端导出加入队列/并发限制/重试策略。
- 测试：压测下无雪崩；失败作业进入死信并可重放。

（附录）30) 云存储与集成
- 实现：S3/Drive 上传与权限；Webhook 通知。
- 测试：文件可控访问；通知准确抵达。

## 扩展与插件架构

- 插件接口：在 src/runtime 暴露钩子（beforeRender, afterRender, beforeExportPDF/Word, transformData, validateContent），模板可注册主题令牌（色板、字号尺度、间距、边角、行高）。
- 主题与令牌：通过 theme tokens 控制配色/字体/间距/阴影，模板按令牌渲染，支持暗色模式与打印优化（纯黑文本、背景抑制）。
- 模板版权与许可：维护模板清单（名称、作者、许可证、截图、来源链接）。

## Schema 版本化与迁移

- 语义化版本号与 schemaVersion 字段；提供 migrate(from, to) 步骤化迁移，保持向后兼容与变更日志。
- 在导入/加载时自动迁移并输出告警；CI 校验所有内置模板通过迁移测试。

## 离线/PWA 与灾难恢复

- PWA：离线缓存编辑与预览、字体与模板资源；自动/手动快照；本地 IndexedDB 存储，异常恢复提示。
- 导入导出：ZIP 包含 JSON/资源/版本信息，支持离线导入，还原快照。

## 合规与隐私

- GDPR/PII：可选字段加密（本地或服务端）、脱敏导出（隐藏联系方式、地址）；数据保留策略与导出告知。
- 日志最小化：仅记录必要错误码与匿名指标（不含个人内容）。

## 内容校验与 ATS 友好

- 拼写/语法校验可插拔；关键词覆盖度提示；日期/单位规范化；链接有效性与长度限制；长链接自动断行（wbr/软连字符）。

## 国际化深化

- 多语言并列版本（zh/EN 等）与字段映射；姓名/地址顺序本地化；RTL 脚本支持与段落方向控制。

## 可访问性进阶

- 高对比主题、键盘快捷键、焦点顺序测试；屏幕阅读顺序与 landmark 规范；导出 PDF/Word 的语义标签一致。

## 安全加固

- 富文本沙箱与白名单清洗、上传类型/大小/EXIF 验证、恶意链接扫描（黑名单/正则）；依赖与供应链审计（licenses、SCA）。

## 多格式导出

- 额外导出：JSON Resume、Markdown、纯文本、静态 HTML（只读）。

## 版本历史与差异/快照

- 本地/云端版本历史，变更 diff（按节/块）；一键回滚；只读快照共享。

## CLI 批量转换

- 提供 CLI 将 JSON -> PDF/Word/HTML/MD 批量转换，支持队列与重试。

## 队列与背压（服务端导出）

- 采用队列（如 BullMQ）限制并发与速率；失败重试/死信队列；导出作业状态回调。

## Feature Flags 与配置

- 通过特性开关控制实验功能（如新分页引擎、双栏算法、CMYK）；支持远端配置下发。

## 云存储与集成

- S3/Drive 集成（OAuth/临时凭证），文件权限与生命周期管理；Webhook 通知导出完成。

## API 合同与错误码

- 定义 REST/RPC 合同、错误码与可恢复/不可恢复分类；前端统一拦截与提示。

## 自动回退与限流提示

- 超大文档分块渲染与导出；字体缺失/资源不可达时的回退策略与 UI 提示；速率限制触发时的策略切换建议。

## 风险与对策（贯穿开发步骤）

- Serverless/无状态环境下的服务端导出：
  - 风险：Playwright 体积大、冷启动慢、字体与图片 CORS 受限。
  - 处理：设置 PLAYWRIGHT_BROWSERS_PATH 缓存浏览器、构建基准镜像预装 Chromium、静态打包字体并走同源路径、为外链图片配置代理或 CORS 头、提供 export({strategy:'auto'}) 回退至客户端并在 UI 标注“快速导出”。
- 字体与排版一致性：
  - 风险：字体许可与子集差异、回退矩阵不一致、复杂脚本/Emoji 形变、时区/区域设置影响测量、Word 版本差异导致重排。
  - 处理：固定字体文件哈希与许可证清单，记录子集日志；统一 font-family 栈与 fallback 表；固定 locale/timezone；PDF 产线固定 Chromium；Word 启用兼容模式并标准化段落/列表样式与 keepNext/widow/orphan，校验页数容差。
- 安全与稳定：
  - 风险：富文本粘贴携带恶意样式/脚本、导出接口滥用、隐私数据泄露、长链接/表格/大图跨页破版、像素回归抖动。
  - 处理：粘贴白名单清洗与 XSS 过滤；导出 API 鉴权与限流；PII 脱敏开关；对长链接注入 wbr/软连字符、对不可拆块启用 avoid-page/column-break；像素对比固定 Chromium/字体并统一抗锯齿/缩放阈值。
- 性能与资源：
  - 风险：大文档编辑/预览卡顿、导出耗时长、重复图片/字体导致 PDF 体积膨胀。
  - 处理：增量布局与分页、只读虚拟化、历史快照压缩；图片按需有损/无损压缩与复用缓存；PDF 资源去重嵌入；CI 记录耗时指标与阈值告警。

## 开发步骤清单（2025-11-06）

> 注：下方附录章节为规范补充（支持矩阵/打包/错误码/插件/安全/可访问性/性能/发布策略）。

- 模板系统（默认方案）：内置多种布局风格，位于 `src/templates`，支持运行时切换与扩展；作为优化项，提供模板元数据与预览图以提升选择体验。
- 拖拽排序（默认支持）：基于 react-sortablejs；在 `src/runtime` 暴露 onReorder 接口与排序约束，保证与导出分页规则一致。
- 引入多语言字段标签，增强国际化能力。
- 构建在线简历生成器 Demo 以展示完整体验。

## 附录：支持矩阵与发布/打包规范

- 支持矩阵（目标基线，可随实际落地调整并在 README/CHANGELOG 中公告）
  - 浏览器：Chromium ≥ 114、Firefox ≥ 115 ESR、Safari ≥ 16.4（桌面）；iOS Safari ≥ 16.4/Chrome ≥ 114（移动端）
  - Node：≥ 18.18 LTS（CI/导出/脚本）；Playwright Chromium 版本锁定（通过 .pnpm/.cache 或 PLAYWRIGHT_BROWSERS_PATH 缓存）
  - React：≥ 18.2（编辑器/Viewer 可选），核心导出与模板与框架解耦
  - 字体/脚本：CJK、RTL、可变字体（Variable Fonts）最小集验证；hyphenation 词典可选
- 发布/打包规范
  - package.json：
    - type: module；exports: { .: ESM 默认导出, ./react: React 组件, ./templates: 模板库, ./package.json }；types 指向 dist/types
    - main/module/browser 字段对应 UMD/ESM；sideEffects: false（仅样式入口标记为有副作用）
    - files: ["dist/**", "README.md", "LICENSE"]；engines: { node: ">=18.18" }
    - peerDependencies：react@^18 || ^19, react-dom@^18 || ^19（若使用 React 组件）
  - 构建产物：ESM（tree‑shaking）、UMD（浏览器直引）、d.ts 类型；CSS：提供最小样式 reset（可选）与主题变量导出
  - 使用指引：
    - ESM：import { createResume } from "resume-engine"
    - UMD：window.ResumeEngine（IIFE 名称）；React 包为 window.ResumeEngineReact

## 错误码与稳定度标识

- 错误码（统一 Error.code，便于契约测试与可观测性）
  - E_SCHEMA_INVALID、E_FONT_MISSING、E_LAYOUT_OVERFLOW、E_EXPORT_UNAVAILABLE、E_EXPORT_TIMEOUT
  - E_DOCX_MAPPING、E_IMAGE_UNSUPPORTED、E_PLUGIN_DENIED、E_ACCESSIBILITY_FAILED、E_COLOR_PROFILE
- 结构：{ code, message, details?, cause? }；导出 API 统一抛出上述错误码
- 稳定度标签：stable（兼容承诺）、beta（可能变动）、experimental（需显式开启）；在 README/组件 API 表格中标注

## 插件 API 与版本化

- 钩子签名（TypeScript）：
  - beforeRender(ctx): void | Promise<void>
  - afterRender(ctx): void | Promise<void>
  - transformData(data, ctx): ResumeData | Promise<ResumeData>
  - validateContent(data, ctx): Issue[]
  - beforeExportPDF(options, ctx): void | Promise<void>
  - beforeExportWord(data, ctx): void | Promise<void>
- 插件清单：{ id, version, requires: { abi: "1.x" }, permissions: ["filesystem?", "network?"], sandbox: "iframe|vm" }
- 版本策略：保持 ABI（钩子与上下文）语义化；破坏性变更升级 abi 主版本并在 CHANGELOG 标注迁移
- 安全：插件默认沙箱（iframe/vm + postMessage），仅白名单权限；CSP 默认开启，禁止内联脚本

## 安全/合规与隐私

- CSP 基线：default-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'
- 模板/字体/图片许可清单与来源登记，SBOM 与 SCA 周期扫描；第三方模板/插件隔离与审核
- 遥测：默认关闭，opt‑in；仅收集匿名错误码与版本，允许本地/企业版完全禁用
- PII：本地加密（可选）与导出脱敏选项；导出 API 需鉴权与速率限制

## 可访问性与验证

- 编辑器：拖拽的键盘等价路径（上下移动/移至顶部/到底部）、焦点环、ARIA 与角色标注；颜色对比达 4.5:1
- PDF/UA：生成结构树与语义标签（Heading/Lists/Links、lang），PAC 校验通过作为门禁；Word 映射 Heading1/2 等样式
- CI 校验：axe/pa11y + 关键流程无障碍断言；导出产物抽样无障碍检查

## DOCX 细化映射

- 列表/编号：numbering.xml（抽象层级，重启编号/继续编号策略）；段落属性 widowControl/orphanControl/keepNext 映射
- 节与分栏：sectPr 映射 pageSz/pageMar/cols；侧栏布局以表格或节列实现，避免分页漂移
- 图片：保留 EXIF，按 300DPI 目标缩放/压缩；链接与书签映射为 w:hyperlink；语言/字体回退写入 styles.xml

## JSON Resume 互操作

- 提供 mapFromJsonResume(json) 与 mapToJsonResume(data)；字段差异与单位/日期规范化策略
- 迁移：schemaVersion + migrate(from,to)；CLI 子命令（后续）支持批量转换与校验

## 移动端/IME 与脚本

- 触控：拖拽采用长按 + 影子项，命中区域≥44px；滚动穿透与橡皮筋治理
- IME：compositionstart/update/end 全链路支持；CJK/RTL 光标与选区正确性用例
- 可变字体/连字：字体栈与禁用全局强制连字的回退策略；hyphenation 词典（可选）

## 性能预算与体积

- 预算：
  - 编辑器首屏 FCP < 2.0s（中配笔电）、交互就绪 < 3.5s
  - 导出：A4 单页 PDF < 1.5s（本地）、多页 < 5s；PDF 体积 < 1.5MB（无大图场景）
- 诊断：记录关键阶段耗时与内存；PDF 资源去重与字体子集率 ≥ 70%

## CI 矩阵与确定性构建

- CI 矩阵：OS（ubuntu‑latest, macos‑latest），Node（18.x, 20.x），浏览器（Playwright 锁版本）
- 锁定：包管理器锁文件 + Playwright 版本与浏览器缓存；视觉基线管理（阈值与漂移审批流程）

## 发布与弃用策略

- 语义化版本：feat!/fix/docs/chore；minor 不破坏，major 才引入破坏性；标注稳定度
- 支持窗口：最近 2 个 minor 分支 + 1 个 LTS；弃用提前 1 个 minor 公告并给出迁移指南
- 文档：CHANGELOG.md、SECURITY.md、CONTRIBUTING.md 模板与发布 checklist（lint/typecheck/test/e2e/visual 绿灯）
