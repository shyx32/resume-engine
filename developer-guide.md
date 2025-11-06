# resume-engine 开发指南

## 概览
- `resume-engine` 是一个轻量、可扩展的简历编辑与导出引擎。
- 核心能力基于统一的 JSON Schema，前端渲染与导出逻辑完全解耦。
- 默认提供基于 Vue 的编辑器与预览器，同时支持在任意框架中复用数据与导出模块。

## 核心特性
- 数据驱动渲染：统一的 JSON Schema 让编辑器、预览器与导出保持一致。
- 模块化设计：编辑器、预览器、导出能力互不依赖，组合灵活。
- 可扩展 UI：可以直接使用内置 Vue 组件，或替换为自定义界面。
- 多格式导出：内置 PDF / Word 导出模块，可单独在其他项目中使用。
- 模板库支持：预置多套模板，支持在运行时快速切换或扩展自定义模板。
- 轻量依赖：核心完全使用 TypeScript 实现，默认 UI 可选。

## 系统架构
| 模块 | 职责 | 是否可替换 |
|------|------|------------|
| `src/core` | 定义数据结构与操作工具 | ✅ |
| `src/vue` | 默认 Vue 编辑器与预览组件 | ✅ |
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

### 使用内置 Vue 组件
默认提供可直接使用的编辑器与预览组件。

```vue
<template>
  <ResumeEditor v-model="resume" />
  <ResumeViewer :data="resume" />
</template>

<script setup>
import { reactive } from "vue";
import { ResumeEditor, ResumeViewer } from "resume-engine";

const resume = reactive({
  name: "张三",
  title: "前端工程师",
  style: { color: "#333", backgroundColor: "#fff" },
  sections: [
    {
      type: "education",
      title: "教育经历",
      items: [{ 学校: "清华大学", 时间: "2018-2022" }]
    }
  ]
});
</script>
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
      { type: "skills", title: "技能", items: [{ 技能: "Vue / TypeScript" }] }
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

- 两个导出模块均独立于 Vue，可在任意框架中复用。
- `exportToPDF` 需要传入渲染后的 DOM 节点；`exportToWord` 需要传入 `ResumeData` 对象。

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

构建输出：
- ESM: `dist/resume-engine.es.js`
- UMD: `dist/resume-engine.umd.js`

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
│  ├─ vue/           # 默认 Vue 组件（可选）
│  ├─ runtime/       # 函数式渲染工具
│  └─ index.ts       # 包导出入口
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

## 后续扩展建议
- 增加模板系统以提供多种布局风格。
- 支持拖拽排序（例如基于 `vue-draggable-next`）。
- 引入多语言字段标签，增强国际化能力。
- 构建在线简历生成器 Demo 以展示完整体验。
