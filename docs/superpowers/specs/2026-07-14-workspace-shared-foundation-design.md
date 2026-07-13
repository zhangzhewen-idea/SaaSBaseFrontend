# SaaSBase 前端工作区与共享底座设计

## 目标

将当前前端仓库升级为一个可运行、可扩展的 pnpm monorepo，并先建立公共底座：

- 根工作区脚手架与统一脚本
- `packages/shared` 的纯契约层
- `packages/api-client` 的空壳预留

本阶段不展开 `admin`、`client` 的完整业务实现，不接真实后端，不处理 portal 官网。

## 范围

包含：

- pnpm workspace 根配置
- 根目录脚本与基础 TypeScript 配置
- 共享包 `packages/shared`
- API Client 预留包 `packages/api-client`
- 最小的 lint、typecheck、test、build 链路

不包含：

- 管理端业务页面
- 客户端业务页面
- 真实 OpenAPI 生成结果
- 认证联调
- 生产部署与 CI/CD 配置

## 架构

```text
root workspace
├── packages/shared
└── packages/api-client
```

### 根工作区职责

- 统一管理 pnpm workspace
- 统一提供 lint、typecheck、test、build 脚本
- 统一提供 TypeScript 基础配置与 ESLint 基础配置
- 为后续 `apps/admin` 和 `apps/client` 的接入预留位置

### `packages/shared` 职责

- 只放平台无关的纯类型、权限/会话判断和无业务工具
- 不依赖 Vue、uni-app、浏览器对象或任一应用别名
- 可被后续应用直接引用，不承载 UI 或运行时副作用

### `packages/api-client` 职责

- 先保留空壳包结构和基础导出位
- 后续由 OpenAPI 生成器填充类型化 API 客户端
- 当前阶段不手写重复 DTO，不接真实接口实现

## 目录约定

### 根目录

- `package.json`：工作区脚本与开发依赖入口
- `pnpm-workspace.yaml`：声明 `apps/*` 与 `packages/*`
- `tsconfig.base.json`：strict TypeScript 基础配置
- `eslint.config.js`：共享 lint 规则
- `.gitignore`：忽略依赖、构建产物和测试输出
- `README.md`：中文启动与验证说明

### `packages/shared`

- `src/auth.ts`：会话与角色类型
- `src/permissions.ts`：纯权限判断函数
- `src/utils/*`：无业务工具函数
- `src/index.ts`：包公开出口
- `src/*.test.ts`：纯函数单元测试

### `packages/api-client`

- `src/index.ts`：空壳导出位
- `src/types.ts`：保留类型出口位置
- `src/runtime.ts`：预留运行时适配位

## 规则

### TypeScript

- 所有新增代码使用 TypeScript
- 保持 `strict`，不得以 `any` 绕过类型错误
- 根配置应尽量让所有包继承统一的编译约束

### Shared 包边界

- 只允许纯函数、纯类型和与平台无关的常量
- 不允许依赖 Vue、浏览器 API、Node 特定运行时或应用内部状态
- 不将页面、组件、store、路由、请求实现放入共享包

### API Client 预留边界

- 只预留包结构与导出位，不伪造完整客户端
- 后续接 OpenAPI 时，生成结果替换空壳实现
- 当前阶段不手写重复 DTO，不在页面层散落接口契约

## 测试与质量门禁

- `packages/shared` 的纯函数必须有单元测试
- 根工作区必须能执行统一的 lint、typecheck、test、build
- 如果脚本不存在，先补脚本，再补测试调用
- 不通过关闭类型检查、删除测试或吞掉异常来凑结果

## 完成标准

当以下条件全部满足时，第一阶段可视为完成：

- 仓库具备清晰的 pnpm workspace 结构
- 根目录脚本可统一触发 lint、typecheck、test、build
- `packages/shared` 已具备可复用的纯契约能力
- `packages/api-client` 已预留好后续接入位置
- 设计目标、范围、边界和测试要求没有冲突或空缺

## Agent Prompt Guide

- 先搭骨架，再补契约
- shared 只放纯逻辑，不放 UI 和运行时状态
- api-client 先预留，不抢先实现真实后端
- 当前阶段目标是把仓库变成可扩展的前端底座，而不是一次性做完全部前端应用
