# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Phase 1 MVP

### Added - 组件架构补充（2025-11-06）

#### 状态管理
- 新增 `EditorState` 类型定义（文档数据、选择状态、历史栈、UI 状态、验证状态）
- 实现 Context + useReducer + Immer 状态管理方案
- 新增自定义 Hooks：`useEditor`、`useEditorActions`、`useExport`、`useAutoSave`
- 支持撤销/重做（50 步历史栈）

#### 组件拆分规范
- 定义组件层级结构（Atoms → Molecules → Organisms → Templates）
- 原子组件：TextInput、Button、Alert
- 组合组件：SectionEditor、EditorToolbar、ExportPanel
- 容器组件：ResumeEditor、ResumeViewer

#### 错误处理
- 实现 React `ErrorBoundary` 组件
- 新增 `ExportError` 类型与错误码枚举（E_FONT_MISSING、E_BROWSER_UNSUPPORTED 等）
- 降级策略：浏览器不支持时显示友好提示、提供手动复制方案

#### 导出简化
- MVP 仅实现客户端导出（浏览器打印 API + docx.js）
- 打印配置简化为预设（standard/professional）
- 服务端导出延后至 v2.0
- 印刷级特性（出血、裁切、CMYK）延后至 v3.0

### Changed - 架构调整

#### 功能分期
- **Phase 1（MVP）**：基础编辑 + 客户端导出 + 3 套模板
- **Phase 2（v2.0）**：服务端导出 + 富文本 + 5 套模板 + 高级排版
- **Phase 3（v3.0）**：插件系统 + 印刷级导出 + 协作功能

#### 组件 API
- `ResumeEditor` 简化配置项（移除 `schema`/`print`/`slots`，仅保留核心 props）
- `ResumeViewer` 简化为 MVP 所需最小集（单页渲染，延后分页容器）
- 打印配置从复杂参数简化为预设选择

### Removed - 延后特性

明确以下特性在 MVP 中不实施：
- 富文本编辑（v1 仅纯文本 textarea）
- 图片上传（v1 仅支持图片 URL）
- 服务端导出（Playwright + pdf-lib）
- 运行时分页引擎
- 孤行寡行控制、出血裁切标记
- 插件系统、主题商店
- 多格式导出（JSON Resume、Markdown）
- 协作功能（实时编辑、版本历史）

### Documentation

- 新增 `developer-guide-phase1-supplement.md`（MVP 实施细节）
- 更新 `README.md`（明确 Phase 1 定位与文档导航）
- 更新 `developer-guide.md`（保留完整架构作为参考）

---

## [0.1.0] - 2025-11-06

### Added
- Initial project setup
- Core documentation: `developer-guide.md`, `AGENTS.md`, `README.md`

[Unreleased]: https://github.com/yourusername/resume-engine/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/resume-engine/releases/tag/v0.1.0
