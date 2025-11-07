# resume-engine 开发方案补充（Phase 1 MVP）

> **本文档补充 developer-guide.md，明确 MVP 阶段实施范围与延后特性**

## 🎯 核心变更说明

基于组件化设计评审，对原方案进行以下调整：

### 1. 补充：组件状态管理

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
**MVP 实现**：React Context + useReducer + Immer

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
      
      case 'UNDO':
        if (draft.history.past.length > 0) {
          draft.history.future.unshift(draft.document);
          draft.document = draft.history.past.pop()!;
        }
        break;
      
      // ... 其他 action
    }
  });
}

const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
} | null>(null);

export function EditorProvider({ children, initialData }: { 
  children: React.ReactNode; 
  initialData: ResumeData 
}) {
  const [state, dispatch] = useReducer(editorReducer, {
    document: initialData,
    selection: null,
    focusedSection: null,
    history: { past: [], future: [], limit: 50 },
    ui: { 
      activeTab: 'edit', 
      isExporting: false, 
      paginationEnabled: false, 
      previewScale: 1 
    },
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
  const [error, setError] = useState<ExportError | null>(null);
  
  const exportToPDF = useCallback(async (element: HTMLElement) => {
    dispatch({ type: 'SET_UI', payload: { isExporting: true } });
    try {
      setError(null);
      const { exportToPDF } = await import('../../exporters/pdf');
      await exportToPDF(element);
    } catch (err) {
      const exportError = err instanceof ExportError ? err : 
        new ExportError(ExportErrorCode.EXPORT_FAILED, '导出失败', { originalError: err }, true);
      setError(exportError);
      throw exportError;
    } finally {
      dispatch({ type: 'SET_UI', payload: { isExporting: false } });
    }
  }, [dispatch]);
  
  const exportToWord = useCallback(async () => {
    dispatch({ type: 'SET_UI', payload: { isExporting: true } });
    try {
      setError(null);
      const { exportToWord } = await import('../../exporters/word');
      await exportToWord(state.document);
    } catch (err) {
      const exportError = err instanceof ExportError ? err :
        new ExportError(ExportErrorCode.EXPORT_FAILED, '导出失败', { originalError: err }, true);
      setError(exportError);
      throw exportError;
    } finally {
      dispatch({ type: 'SET_UI', payload: { isExporting: false } });
    }
  }, [state.document, dispatch]);
  
  return { 
    exportToPDF, 
    exportToWord, 
    isExporting: state.ui.isExporting,
    error,
    clearError: () => setError(null)
  };
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

---

### 2. 补充：组件拆分规范

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
   │  │     ├─ TextArea (MVP 使用，v2.0 升级为 RichTextEditor)
   │  │     ├─ DatePicker
   │  │     └─ ImageUrlInput (MVP 仅 URL，v2.0 支持上传)
   │  └─ SectionActions
   └─ AddSectionButton

ResumeViewer (预览组件)
├─ ViewerToolbar
│  ├─ ZoomControls
│  └─ PageIndicator (简化版，v2.0 支持完整分页导航)
└─ ViewerCanvas
   └─ SectionRenderer[] (MVP 单页渲染，v2.0 支持分页容器)
      └─ ItemRenderer[]
```

#### 原子组件（MVP 范围）
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

export function TextInput({ 
  value, onChange, placeholder, maxLength, required, error, disabled 
}: TextInputProps) {
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

export const Button = React.memo(function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled, 
  loading, 
  icon, 
  onClick, 
  children 
}: ButtonProps) {
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

export const SectionEditor = React.memo(function SectionEditor({ 
  section, onChange, onRemove, isSelected 
}: SectionEditorProps) {
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
        <Button 
          icon={<UndoIcon />} 
          onClick={undo} 
          disabled={state.history.past.length === 0}
        >
          撤销
        </Button>
        <Button 
          icon={<RedoIcon />} 
          onClick={redo} 
          disabled={state.history.future.length === 0}
        >
          重做
        </Button>
      </div>
      
      <div className="toolbar-group">
        <TemplateSelector />
      </div>
      
      <div className="toolbar-group">
        <Button 
          onClick={() => exportToPDF(document.querySelector('.viewer-canvas')!)} 
          loading={isExporting}
        >
          导出 PDF
        </Button>
        <Button 
          onClick={exportToWord} 
          loading={isExporting}
        >
          导出 Word
        </Button>
      </div>
    </div>
  );
}
```

---

### 3. 补充：错误边界与降级

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
function DefaultErrorFallback({ error, resetError }: { 
  error: Error; 
  resetError: () => void 
}) {
  return (
    <div className="error-fallback">
      <h2>😔 出错了</h2>
      <details>
        <summary>错误详情</summary>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </details>
      <Button onClick={resetError}>重试</Button>
      <Button variant="secondary" onClick={() => window.location.reload()}>
        刷新页面
      </Button>
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
  EXPORT_FAILED = 'E_EXPORT_FAILED',
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
```

#### 降级策略（MVP）
```typescript
// src/react/components/ExportPanel.tsx
export function ExportPanel() {
  const { exportToPDF, exportToWord, error, clearError } = useExport();
  
  // 检测功能支持
  const canExportPDF = typeof window !== 'undefined' && window.print;
  
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
            <Button size="sm" onClick={clearError}>
              重试
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

---

### 4. 简化：导出流程（MVP 优先）

**阶段划分**：
- **Phase 1（MVP）**：仅客户端导出，基于浏览器打印 API
- **Phase 2（v2.0）**：服务端稳定导出（Playwright + pdf-lib 后处理）
- **Phase 3（专业版）**：印刷级特性（出血、裁切标记、CMYK）

#### Phase 1：客户端导出（MVP 实现）

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

---

### 5. 简化：打印配置（预设优先）

```typescript
// src/core/print-presets.ts
export const PRINT_PRESETS = {
  standard: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 15, right: 12, bottom: 15, left: 12 }, // mm
    pageNumbers: false,
    fontFallbacks: ['Noto Sans', 'Arial', 'sans-serif'],
  },
  
  professional: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 15, bottom: 20, left: 15 },
    pageNumbers: true,
    fontFallbacks: ['Noto Sans', 'Arial', 'sans-serif'],
  }
} as const;

// 用户界面简化为预设选择
interface SimplifiedPrintConfig {
  preset: 'standard' | 'professional';
  pageSize?: 'A4' | 'Letter'; // 可选覆盖
  pageNumbers?: boolean;
}

// 高级配置延后到 v2.0（服务端导出）
// interface AdvancedPrintConfig {
//   bleed?: number;
//   cropMarks?: boolean;
//   colorProfile?: 'sRGB' | 'CMYK';
//   orphanLines?: number;
//   widowLines?: number;
// }
```

---

### 6. 延后：高级特性（v2.0+）

以下特性在 MVP 中**不实施**，文档中保留作为参考：

#### Phase 2：服务端导出（v2.0）
- Playwright 固定 Chromium 版本
- pdf-lib 后处理：TrimBox/BleedBox、字体子集、结构树
- 可访问性标记（PDF/UA 基线）
- 导出策略切换（client/server/auto）

#### Phase 3：专业版特性（v3.0）
- **插件系统**：插件 API、沙箱、主题令牌
- **印刷级导出**：出血、裁切标记、CMYK、ICC 配置
- **协作功能**：实时多人编辑（CRDT）、版本历史、审批流程
- **其他格式**：JSON Resume、Markdown、LinkedIn 导入

---

## 🚀 MVP 实施清单

### Phase 1：核心功能（6-8 周）

**Week 1-2：基础架构**
- [ ] 项目初始化（Vite + React + TypeScript）
- [ ] 数据模型定义（ResumeData + Zod 校验）
- [ ] 状态管理（Context + useReducer + Immer）
- [ ] 错误边界与 ErrorBoundary 组件

**Week 3-4：编辑器组件**
- [ ] 原子组件（TextInput、Button、Alert）
- [ ] SectionEditor 与 FieldEditor
- [ ] 拖拽排序（react-sortablejs）
- [ ] 撤销/重做（历史栈 50）

**Week 5-6：预览与模板**
- [ ] ResumeViewer 组件
- [ ] 3 套模板（Modern、Classic、Compact）
- [ ] 模板切换与样式变量
- [ ] 打印预设（standard/professional）

**Week 7-8：导出与测试**
- [ ] 客户端 PDF 导出（window.print）
- [ ] Word 导出（docx.js）
- [ ] 自动保存（localStorage）
- [ ] 单元测试（Vitest，>80% 覆盖）
- [ ] E2E 测试（Playwright，核心流程）

---

## 📝 组件 API（MVP 版本）

### ResumeEditor
```typescript
interface ResumeEditorProps {
  // 核心
  value: ResumeData;
  onChange: (data: ResumeData) => void;
  
  // 配置（简化）
  config?: {
    enableDragDrop?: boolean; // 默认 true
    enableAutoSave?: boolean; // 默认 true
    autoSaveInterval?: number; // 默认 30000ms
    maxSections?: number; // 默认 20
    maxHistorySize?: number; // 默认 50
  };
  
  // 样式
  className?: string;
  style?: React.CSSProperties;
  
  // 验证
  schema?: z.ZodSchema;
  
  // 事件
  onError?: (error: Error) => void;
  onValidationChange?: (issues: ValidationIssue[]) => void;
  
  // 只读
  readOnly?: boolean;
}
```

### ResumeViewer
```typescript
interface ResumeViewerProps {
  // 核心
  data: ResumeData;
  
  // 模板
  template?: 'modern' | 'classic' | 'compact';
  
  // 打印配置（简化）
  print?: {
    preset?: 'standard' | 'professional';
    pageSize?: 'A4' | 'Letter';
    pageNumbers?: boolean;
  };
  
  // 样式
  className?: string;
  style?: React.CSSProperties;
  
  // 缩放（MVP 简化版）
  scale?: number; // 0.5 ~ 1.5，默认 1
  
  // 事件
  onError?: (error: Error) => void;
}
```

---

## ⚠️ 风险与对策（MVP 阶段）

### 1. 浏览器兼容性
- **风险**：打印 API 跨浏览器差异、字体渲染不一致
- **处理**：明确浏览器支持矩阵（Chrome/Edge/Safari 最新版），提供降级提示

### 2. 数据丢失
- **风险**：编辑器崩溃、页面刷新导致数据丢失
- **处理**：自动保存至 localStorage、错误边界捕获并备份数据

### 3. 导出质量
- **风险**：客户端 PDF 导出质量不一致（字体、分页）
- **处理**：提供打印预设、明确告知"服务端导出"为 v2.0 特性

### 4. 性能问题
- **风险**：大文档编辑卡顿
- **处理**：限制最大节数（20）、历史栈大小（50）；v2.0 再优化虚拟化

---

## 📚 参考文档

- 主文档：`developer-guide.md`（完整架构与 v2.0+ 规划）
- 仓库指南：`AGENTS.md`（开发规范与 CI 要求）
- 测试策略：见 `developer-guide.md` 中的"测试与回归"章节

---

**更新时间**：2025-11-06  
**版本**：Phase 1 MVP Supplement v1.0
