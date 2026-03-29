# 个人博客项目分析 Spec

## Why
用户希望全面了解该个人博客项目的技术架构、功能特性和代码组织，以便后续进行维护、扩展或二次开发。

## What Changes
- 分析并记录项目的技术栈和框架选择
- 梳理项目的目录结构和代码组织方式
- 总结项目的核心功能模块和特性
- 记录代码规范和开发约定
- 识别关键配置文件和入口点

## Impact
- Affected specs: 无（纯分析任务）
- Affected code: 无代码变更，仅生成分析文档

## 项目概述

### 项目名称
**Fuwari Enhanced** - 基于 [saicaca/fuwari](https://github.com/saicaca/fuwari) 深度定制的个人博客系统

### 站点信息
- **站点名称**: Betsy Blog
- **作者**: 流转星(Betsy)
- **域名**: https://www.micostar.cc
- **主题**: 分享网络技术、服务器部署、Unity开发、AI技术应用与原理

## 技术栈

### 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| Astro | 5.7.9 | 静态站点生成器 |
| Svelte | 5.28.2 | 交互式UI组件 |
| React | 19.2.3 | 特殊组件(如3D背景) |
| TypeScript | 5.8.3 | 类型安全 |

### 样式方案
| 技术 | 版本 | 用途 |
|------|------|------|
| Tailwind CSS | 3.4.17 | 原子化CSS框架 |
| Stylus | 0.64.0 | CSS预处理器 |
| PostCSS | - | CSS后处理 |

### 内容处理
| 技术 | 用途 |
|------|------|
| markdown-it | Markdown解析 |
| KaTeX | 数学公式渲染 |
| rehype/remark插件 | 内容转换增强 |

### 其他关键依赖
| 技术 | 用途 |
|------|------|
| Swup | 页面过渡动画 |
| Expressive Code | 代码高亮 |
| PhotoSwipe/Fancybox | 图片灯箱 |
| Three.js | 3D背景效果 |
| Sharp | 图片处理 |

## 架构设计

### 渲染模式
- **主要模式**: 静态站点生成 (SSG)
- **混合渲染**: 静态页面 + API端点 (IndexNow)
- **页面过渡**: Swup驱动的SPA-like体验

### 布局层次
```
Layout.astro (基础HTML、head、body)
  └── MainGridLayout.astro (三栏网格布局)
        ├── Navbar.astro (顶部导航)
        ├── SideBar.astro (左侧 - Profile, Tags, NavMenu)
        ├── <slot /> (主内容区)
        ├── WritingStats.astro (右侧 - 仅xl+)
        ├── TOC.astro (右侧目录 - 仅3xl+)
        └── Footer.astro (底部)
```

### 内容集合
| 集合名 | 用途 | Schema字段 |
|--------|------|------------|
| posts | 博客文章 | title, published, updated, draft, description, image, tags, lang, pinned, prerenderAll |
| friends | 友链数据 | name, url, avatar, introduction, friendsPage |
| spec | 静态页面 | title, published, updated, draft |
| assets | 资源数据 | title, description |

## 核心功能

### 内容增强
- 目录导航 (TOC) - 长文自动生成右侧目录
- 文章置顶 - 支持 `pinned: true`
- 文章排序 - 按发布时间/更新时间/浏览量排序
- 数学公式 - KaTeX渲染LaTeX
- GitHub风格提示块 - NOTE/TIP/WARNING等
- 代码块增强 - 可折叠、行号、GitHub Dark主题

### 图片系统
- 双CDN图床回退 - 主力图床失效自动切换备用
- Fancybox图片灯箱 - 点击放大、手势缩放

### 安全与隐私
- 防盗链保护 - 域名检测与安全警告
- 隐私友好分析 - Umami无Cookie分析
- Cookie同意弹窗 - 双语展示、支持"始终记住"

### SEO与监控
- IndexNow集成 - 一键推送搜索引擎
- 站点状态监控 - UptimeRobot集成
- 流量监控面板 - EdgeOne流量分析
- 智能CDN识别 - 自动显示当前链路

### 友链自动化
- PR自动合并 - 自动校验格式、检测互链
- 互链检测 - 验证对方是否已添加本站链接
- 排序管理 - `_order.json`控制展示顺序

## 目录结构

```
src/
├── components/           # UI组件
│   ├── widget/          # 侧边栏组件
│   ├── control/         # 控制组件
│   └── misc/            # 工具组件
├── constants/           # 静态配置值
├── content/             # Astro内容集合
│   ├── posts/           # 博客文章Markdown
│   ├── friends/         # 友链JSON数据
│   └── spec/            # 静态页面
├── layouts/             # 页面布局
├── pages/               # 路由页面
│   ├── api/             # API端点
│   ├── archive/         # 归档页面
│   ├── hot/             # 热门排名
│   └── posts/           # 文章页面
├── plugins/             # Markdown处理插件
├── stores/              # Svelte状态存储
├── styles/              # 全局样式
├── types/               # TypeScript类型
├── utils/               # 工具函数
└── config.ts            # 站点配置入口
```

## 配置入口

### 主配置文件
- `src/config.ts` - 站点配置 (siteConfig, navBarConfig, profileConfig等)
- `src/types/config.ts` - TypeScript类型定义
- `astro.config.mjs` - Astro框架配置

### 关键配置项
| 配置项 | 说明 |
|--------|------|
| siteConfig | 站点标题、描述、主题色、背景图 |
| navBarConfig | 导航栏链接 |
| profileConfig | 作者信息与社交链接 |
| imageFallbackConfig | 双CDN图床域名 |
| antiLeechConfig | 防盗链域名白名单 |
| umamiConfig | Umami分析配置 |

## 代码规范

### 命名约定
- Astro组件: PascalCase (如 `PostCard.astro`)
- Svelte组件: PascalCase (如 `Search.svelte`)
- TypeScript工具: camelCase (如 `content-utils.ts`)
- 目录名: kebab-case

### 格式化工具
- Biome 1.9.4
- 缩进: Tab
- 引号: 双引号

### Git工作流
- Pre-commit Hook: 自动更新文章 `updated` 时间戳
- 安装命令: `pnpm run prepare`

## 部署支持
- EdgeOne (推荐)
- Vercel
- Netlify
- Cloudflare Pages

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产构建 |
| `pnpm new-post "标题"` | 创建新文章 |
| `pnpm build:indexnow` | 构建并推送IndexNow |
| `pnpm lint` | 代码检查 |
| `pnpm format` | 代码格式化 |
