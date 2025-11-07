import { createResume } from '@/core';
import type { ResumeData } from '@/core';

const modern: ResumeData = {
  name: 'Modern 候选人',
  title: '前端工程师 / 技术负责人',
  sections: [
    {
      id: 'summary',
      type: 'summary',
      title: '简介',
      items: [
        {
          content:
            '七年 Web 前端与可视化经验，主导大型简历平台的编辑器、导出引擎与模板系统。关注体验一致性、可访问性与性能，可独立完成架构设计、组件开发、指标治理与多端适配。'
        },
        {
          content:
            '擅长 React/Vue、TypeScript、Node.js、Playwright、pdf-lib、GraphQL；熟悉 CI/CD、Monorepo、设计系统、国际化与 Schema 驱动开发。'
        }
      ]
    },
    {
      id: 'experience',
      type: 'experience',
      title: '工作经历',
      items: [
        {
          company: 'Acme Resume Cloud',
          role: '高级前端工程师',
          period: '2022.03 - 至今',
          highlights: [
            '负责 resume-engine 的架构设计与落地，构建 Schema、模板、导出、插件四层，输出 Phase1/2/3 的演进路线。',
            '搭建 React 编辑器与多模版预览，封装分页引擎 + Canvas 导出 + pdf-lib 后处理，实现 A4/Letter/双栏适配，导出耗时<4s。',
            '与产品定义模板 DSL、主题令牌与截图管线，产出 10+ 主题，支持租户级扩展与大规模 AB 实验。'
          ]
        },
        {
          company: 'NextHire',
          role: '前端负责人',
          period: '2019.07 - 2022.02',
          highlights: [
            '带领 6 人团队重构候选人门户，构建表单引擎、拖拽简历、实时协同，候选人提交成功率提升 18%。',
            '推出 Playwright + axe 的质量基线，覆盖 60+ 测试流，发布前平均阻断 4.3 个回归缺陷。',
            '沉淀低代码配置平台与指标看板，帮助运营配置 200+ 模板并追踪导出转化。'
          ]
        },
        {
          company: 'Freelance',
          role: '全栈顾问',
          period: '2017.03 - 2019.06',
          highlights: [
            '为 SaaS/教育客户构建轻量 CMS、自动化报表、i18n 着陆页，交付 12+ 项目。',
            '引入 TypeScript + Storybook + Chromatic 工作流，降低协作成本并提升交付稳定度。'
          ]
        }
      ]
    },
    {
      id: 'projects',
      type: 'projects',
      title: '代表项目',
      items: [
        {
          name: 'Resume Engine 3.0',
          role: 'Tech Lead',
          period: '2023',
          responsibilities: [
            '主导分页/导出双通道设计，统一数据源 + Canvas 渲染 + pdf-lib，解决多语言与复杂脚本。',
            '实现模板租户化、主题令牌与资源打包，结合 Vite 插件与 CI 自动截图。'
          ],
          impact: '上线首月为 5 万+ 用户提供多模板在线导出；PDF 平均尺寸从 3.5MB 降至 1.2MB。'
        },
        {
          name: 'Realtime Collaboration',
          role: '核心开发',
          period: '2022',
          responsibilities: ['基于 CRDT 与 WebSocket 实现多人编辑、评论、历史快照。'],
          impact: '企业客户协作文档留存率 +27%。'
        },
        {
          name: 'ATS Analytics',
          role: '前端负责人',
          period: '2020',
          responsibilities: [
            '构建可视化看板、漏斗分析与导出模块，使用 ECharts + Apache Arrow + Web Worker。'
          ],
          impact: '支持 HR 快速筛选 10^6 级候选数据，统计耗时缩短 80%。'
        }
      ]
    },
    {
      id: 'skills',
      type: 'skills',
      title: '技能与工具',
      items: [
        {
          categories: {
            前端: ['React 18', 'Vue 3', 'Next.js', 'Vite', 'Webpack'],
            语言: ['TypeScript', 'Node.js', 'Go (基础)', 'Python (脚本)'],
            可视化: ['pdf-lib', 'canvas', 'ECharts', 'D3'],
            测试: ['Vitest', 'Playwright', 'Testing Library', 'axe-core'],
            运维: ['GitHub Actions', 'Docker', 'Vercel', 'Netlify']
          }
        }
      ]
    },
    {
      id: 'education',
      type: 'education',
      title: '教育经历',
      items: [
        {
          school: '清华大学',
          major: '计算机科学',
          period: '2013 - 2017',
          achievements: ['GPA 3.7/4.0', '本科毕业设计：基于 Web 的排版引擎']
        }
      ]
    },
    {
      id: 'certifications',
      type: 'certification',
      title: '证书与社区',
      items: [
        {
          name: 'Professional Scrum Master I',
          issuer: 'Scrum.org',
          year: '2021'
        },
        {
          name: 'Google UX Design Certificate',
          issuer: 'Coursera',
          year: '2020'
        },
        {
          name: 'Vue.js Beijing Meetup Co-organizer',
          issuer: 'Community',
          year: '2019 - 今'
        }
      ]
    },
    {
      id: 'publications',
      type: 'publication',
      title: '演讲与出版',
      items: [
        {
          title: '构建 Schema 驱动的简历引擎',
          event: '2023 前端大会',
          highlights: ['分享分页/导出架构、Noto 字体嵌入、Playwright 回归经验。']
        },
        {
          title: '多模版导出的可观测性实践',
          event: '2022 Vue Global Summit',
          highlights: ['介绍导出指标治理与像素对比流水线。']
        }
      ]
    }
  ]
};

const classic: ResumeData = {
  name: 'Classic 候选人',
  title: '产品经理 / 解决方案顾问',
  sections: [
    {
      id: 'profile',
      type: 'summary',
      title: '职业概述',
      items: [
        {
          content:
            '跨产品、运营、合作伙伴的复合型 PM。负责 SaaS 招聘系统、知识图谱、CRM 集成等 B 端产品，擅长梳理复杂流程、设计指标体系、推动跨部门上线。'
        }
      ]
    },
    {
      id: 'core-competency',
      type: 'skills',
      title: '核心能力',
      items: [
        {
          stack: ['需求洞察', '结构化文档', '多方协同', '试点落地', '数据闭环', '供应商管理']
        }
      ]
    },
    {
      id: 'experience-pm',
      type: 'experience',
      title: '代表项目 / 经验',
      items: [
        {
          company: 'TalentOS',
          role: '产品经理',
          period: '2021 - 至今',
          highlights: [
            '从 0 到 1 规划“人才履历云”产品线，与 7 家头部猎企共创，完成多语言、多币种、多租户的架构设计；上线 3 个月签约 ARR 300 万人民币。',
            '构建 Resume Engine 与 ATS 的联动流程：定义 Schema 映射、评分策略、导出模板，提升候选人转化 +12%。',
            '推动可视化指标看板，配合埋点/BI，沉淀 40+ 指标，帮助客户成功团队及时定位问题。'
          ]
        },
        {
          company: 'Sparrow HR',
          role: '产品顾问',
          period: '2019 - 2021',
          highlights: [
            '主导“职位自动化推荐”方案，调研 30+ 客户场景，联合算法团队迭代 4 轮，推荐点击率 +35%。',
            '引入 Design Ops 流程，搭建 Figma 组件库 + 文档规范，提高多团队协作效率 20%。'
          ]
        },
        {
          company: 'Linker',
          role: '产品经理',
          period: '2016 - 2019',
          highlights: [
            '负责合作伙伴门户、知识库、课程系统，全链路支持入驻、报价、订单与结算流程；制定 KPI/OKR 并推动执行。',
            '设计“模板商城”并落地运营策略，6 个月吸引 200+ 作者入驻，GMV 达 500 万。'
          ]
        }
      ]
    },
    {
      id: 'education',
      type: 'education',
      title: '教育经历',
      items: [
        {
          school: '上海交通大学',
          major: '信息管理与信息系统',
          period: '2012 - 2016',
          achievements: ['校优秀毕业生', '管理学院学生事务委员会主席']
        }
      ]
    },
    {
      id: 'awards',
      type: 'award',
      title: '奖项与荣誉',
      items: [
        { name: 'TalentOS 年度最佳产品奖', year: '2022', detail: '以 Schema 化方案提升导出体验' },
        { name: 'Linker 六星客户成功奖', year: '2018', detail: '跨部门推动合作伙伴增长' }
      ]
    },
    {
      id: 'languages',
      type: 'language',
      title: '语言',
      items: [{ content: '普通话（母语） / 英语（C1） / 日语（N3）' }]
    }
  ]
};

const compact: ResumeData = {
  name: 'Compact 候选人',
  title: '全栈工程师',
  sections: [
    {
      id: 'summary',
      type: 'summary',
      title: '个人陈述',
      items: [
        {
          content:
            '偏好紧凑型信息密度的简历布局。参与多个初创项目的 MVP 交付，负责后端 API、前端 SPA、CI/CD 与监控，能快速迭代并保持质量。'
        }
      ]
    },
    {
      id: 'stack',
      type: 'skills',
      title: '技术栈',
      items: [
        {
          stack: [
            'TypeScript',
            'React',
            'SolidJS',
            'NestJS',
            'Prisma',
            'PostgreSQL',
            'Redis',
            'Cloudflare Workers',
            'AWS CDK'
          ]
        }
      ]
    },
    {
      id: 'projects',
      type: 'projects',
      title: '重点项目',
      items: [
        {
          name: 'Realtime Resume Builder',
          role: '全栈工程师',
          period: '2022',
          highlights: [
            '独立完成数据建模、React 前端、Socket 协作、pdf-lib 导出、Playwright 测试。',
            '实现 3 套模板 + 多语言支持，平均 2 周迭代一版。'
          ]
        },
        {
          name: 'Serverless Form Engine',
          role: '后端负责人',
          period: '2021',
          highlights: [
            '基于 Cloudflare Workers + Durable Objects 搭建低成本 API，日均 200k 请求。',
            '设计插件机制，允许客户自定义校验与导出脚本。'
          ]
        },
        {
          name: 'Monorepo DevOps',
          role: '平台工程',
          period: '2020',
          highlights: [
            '采用 Turborepo + pnpm 管理 30+ 包，集成 Playwright/axe/截图对比流水线。',
            '构建文档站与 lint 规范，降低多团队协作成本。'
          ]
        }
      ]
    },
    {
      id: 'experience',
      type: 'experience',
      title: '工作经验',
      items: [
        {
          company: 'StartX',
          role: '全栈工程师',
          period: '2020 - 至今',
          highlights: [
            '负责核心业务 Dashboard、权限系统、导出 API，React + Tailwind + Zustand。',
            '维护可观测性体系（Sentry / DataDog / Grafana），将平均修复时间控制在 2h 内。'
          ]
        },
        {
          company: 'Indie Labs',
          role: '自由职业',
          period: '2018 - 2020',
          highlights: ['为 8 家初创公司交付 MVP，并提供性能优化、可观测性、文档规范建议。']
        }
      ]
    },
    {
      id: 'education',
      type: 'education',
      title: '教育经历',
      items: [{ school: 'HIT', major: '软件工程', period: '2013 - 2017' }]
    }
  ]
};

export const templates = {
  modern,
  classic,
  compact
} satisfies Record<string, ResumeData>;

export function listTemplates() {
  return Object.keys(templates);
}

export function resolveTemplate(name: keyof typeof templates) {
  return createResume(templates[name]);
}
