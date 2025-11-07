# resume-engine

轻量级可扩展的简历编辑与导出引擎，支持数据驱动渲染、模板库与 PDF/Word 多格式导出。

## 项目定位
- **框架**：React 优先，原生支持 Next.js（SSR/ISR）
- **阶段**：Phase 1 MVP（客户端导出 + 基础编辑）
- **内置模板**：Modern、Classic、Compact（MVP）；Sidebar、Timeline（v2.0）

## 文档导航
- **[开发指南](./developer-guide.md)**：完整架构设计与 v2.0+ 规划
- **[Phase 1 补充](./developer-guide-phase1-supplement.md)**：MVP 实施细节、组件拆分与状态管理
- **[仓库规范](./AGENTS.md)**：代码规范、测试策略与 CI 要求

## 快速开始
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 构建生产版本
npm run build
```

## 核心特性（Phase 1）
- ✅ 数据驱动的 JSON Schema
- ✅ 可撤销/重做的编辑器（50 步历史）
- ✅ 拖拽排序节
- ✅ 客户端 PDF/Word 导出
- ✅ 3 套内置模板
- ✅ 自动保存（localStorage）
- ✅ 错误边界与降级处理

## 延后特性（v2.0+）
- 服务端稳定导出（Playwright + pdf-lib）
- 富文本编辑（Slate/Lexical）
- 运行时分页引擎
- 图片上传与压缩
- 多语言支持
- 插件系统（v3.0）
