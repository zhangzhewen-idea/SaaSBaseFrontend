# SaaSBase 前端工作区与共享底座实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将仓库升级为可运行的 pnpm monorepo，先完成工作区骨架、`packages/shared` 纯契约层和 `packages/api-client` 空壳预留。

**架构：** 根工作区统一承载脚本、TypeScript 与 ESLint 基础配置；`packages/shared` 只放平台无关的类型、权限/会话纯函数和无业务工具；`packages/api-client` 先保留稳定导出位，后续由 OpenAPI 生成器接入真实实现。当前阶段不展开 `admin`、`client` 业务页。

**技术栈：** pnpm workspace、TypeScript strict、ESLint flat config、Vitest、Node.js、纯 TypeScript 包结构。

---

## 文件结构

先按职责锁定文件边界，避免把多个职责塞进同一个文件。

- 创建：`package.json` - 根工作区脚本、开发依赖和统一命令入口。
- 创建：`pnpm-workspace.yaml` - 声明 `apps/*` 与 `packages/*` 工作区范围。
- 创建：`tsconfig.base.json` - 根 TypeScript 严格基础配置。
- 创建：`eslint.config.js` - 共享 lint 规则与 TypeScript 解析。
- 创建：`.gitignore` - 忽略依赖、构建产物、测试输出和本地缓存。
- 创建：`README.md` - 中文启动、验证和仓库说明。
- 创建：`packages/shared/package.json` - shared 包元数据与脚本。
- 创建：`packages/shared/tsconfig.json` - 继承根 TypeScript 配置。
- 创建：`packages/shared/src/auth.ts` - 会话、角色和权限类型。
- 创建：`packages/shared/src/permissions.ts` - 纯权限判断函数。
- 创建：`packages/shared/src/utils/normalizePermission.ts` - 无业务纯工具函数示例。
- 创建：`packages/shared/src/permissions.test.ts` - 权限判断单元测试。
- 创建：`packages/shared/src/index.ts` - shared 包公开出口。
- 创建：`packages/api-client/package.json` - api-client 空壳包元数据。
- 创建：`packages/api-client/tsconfig.json` - 继承根 TypeScript 配置。
- 创建：`packages/api-client/src/index.ts` - 空壳导出位。
- 创建：`packages/api-client/src/types.ts` - 预留类型出口位置。
- 创建：`packages/api-client/src/runtime.ts` - 预留运行时适配位。

## 任务 1：初始化工作区与根配置

**文件：**
- 创建：`package.json`
- 创建：`pnpm-workspace.yaml`
- 创建：`tsconfig.base.json`
- 创建：`eslint.config.js`
- 创建：`.gitignore`
- 创建：`README.md`

- [ ] **步骤 1：编写根工作区脚本与基础配置**

```json
{
  "name": "saasbase-frontend",
  "private": true,
  "packageManager": "pnpm@10.13.1",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "pnpm -r --if-present typecheck",
    "test": "pnpm -r --if-present test",
    "build": "pnpm -r --if-present build"
  },
  "devDependencies": {
    "@eslint/js": "^9.31.0",
    "eslint": "^9.31.0",
    "eslint-plugin-vue": "^10.3.0",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.37.0",
    "vitest": "^3.2.4",
    "vue-eslint-parser": "^10.2.0"
  }
}
```

```yaml
packages:
  - apps/*
  - packages/*
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **步骤 2：编写 ESLint flat config 和忽略规则**

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import vue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser
      }
    }
  }
]
```

```gitignore
node_modules/
dist/
coverage/
playwright-report/
test-results/
.superpowers/
```

- [ ] **步骤 3：运行安装并确认工作区可解析**

运行：`pnpm install`

预期：退出码为 `0`，生成 `pnpm-lock.yaml`，并且没有 workspace package 缺失错误。

- [ ] **步骤 4：执行根级校验**

运行：`pnpm lint`

预期：如果暂时只有骨架文件，则 lint 至少能启动并对现有文件完成检查；若报缺少文件，再按实际文件补齐后重跑。

- [ ] **步骤 5：提交工作区骨架**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json eslint.config.js .gitignore README.md pnpm-lock.yaml
git commit -m "chore: 初始化工作区骨架"
```

## 任务 2：创建 `packages/shared` 纯契约层

**文件：**
- 创建：`packages/shared/package.json`
- 创建：`packages/shared/tsconfig.json`
- 创建：`packages/shared/src/auth.ts`
- 创建：`packages/shared/src/permissions.ts`
- 创建：`packages/shared/src/utils/normalizePermission.ts`
- 创建：`packages/shared/src/permissions.test.ts`
- 创建：`packages/shared/src/index.ts`

- [ ] **步骤 1：先写失败测试，锁定权限判断行为**

```ts
import { describe, expect, it } from 'vitest'
import { canAccess } from './permissions'

describe('canAccess', () => {
  it('拒绝空会话', () => {
    expect(canAccess(null, ['tenant:read'])).toBe(false)
  })

  it('允许匹配权限', () => {
    expect(
      canAccess(
        { userId: 'u1', displayName: '平台管理员', role: 'platform_admin', permissions: ['platform:read'] },
        ['platform:read']
      )
    ).toBe(true)
  })

  it('拒绝不匹配权限', () => {
    expect(
      canAccess(
        { userId: 'u2', displayName: '租户管理员', role: 'tenant_admin', permissions: ['tenant:read'] },
        ['platform:read']
      )
    ).toBe(false)
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/shared test`

预期：失败，提示 `canAccess` 或 `./permissions` 尚未实现。

- [ ] **步骤 3：实现最小契约和纯工具**

```ts
export type UserRole = 'platform_admin' | 'tenant_admin' | 'member'
export type Permission = 'platform:read' | 'tenant:read'

export interface AuthSession {
  userId: string
  displayName: string
  role: UserRole
  permissions: Permission[]
}
```

```ts
import type { AuthSession, Permission } from './auth'
import { normalizePermission } from './utils/normalizePermission'

export function canAccess(session: AuthSession | null, required: Permission[]): boolean {
  if (session === null) return false
  const permissions = new Set(session.permissions.map(normalizePermission))
  return required.every((permission) => permissions.has(normalizePermission(permission)))
}
```

```ts
export function normalizePermission(permission: string): string {
  return permission.trim().toLowerCase()
}
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/shared test && pnpm --filter @saasbase/shared typecheck`

预期：全部通过，`permissions.test.ts` 通过，TypeScript 退出码为 `0`。

- [ ] **步骤 5：提交 shared 包**

```bash
git add packages/shared
git commit -m "feat: 添加共享契约层"
```

## 任务 3：创建 `packages/api-client` 空壳预留

**文件：**
- 创建：`packages/api-client/package.json`
- 创建：`packages/api-client/tsconfig.json`
- 创建：`packages/api-client/src/index.ts`
- 创建：`packages/api-client/src/types.ts`
- 创建：`packages/api-client/src/runtime.ts`

- [ ] **步骤 1：编写包配置与导出位**

```json
{
  "name": "@saasbase/api-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

```ts
export type { ApiResponse, PageResponse } from './types'
```

```ts
export interface ApiResponse<T> {
  data: T
  code: string
  message: string
}

export interface PageResponse<T> {
  items: T[]
  total: number
  pageNo: number
  pageSize: number
}
```

```ts
export interface ApiRuntime {
  baseUrl: string
  timeoutMs: number
}
```

- [ ] **步骤 2：运行类型检查确认空壳可用**

运行：`pnpm --filter @saasbase/api-client typecheck`

预期：退出码为 `0`，表明包结构与导出位可被消费。

- [ ] **步骤 3：提交 api-client 预留包**

```bash
git add packages/api-client
git commit -m "feat: 预留接口客户端包"
```

## 任务 4：回归验证与收尾

**文件：**
- 修改：根目录已创建的工作区文件
- 修改：`packages/shared` 与 `packages/api-client` 已创建文件

- [ ] **步骤 1：执行全量基础检查**

运行：`pnpm lint && pnpm typecheck && pnpm test && pnpm build`

预期：工作区没有脚本缺失，`shared` 测试通过，根命令能完整跑完。

- [ ] **步骤 2：整理文档并提交**

```bash
git status --short
git add package.json pnpm-workspace.yaml tsconfig.base.json eslint.config.js .gitignore README.md packages/shared packages/api-client pnpm-lock.yaml
git commit -m "chore: 完成第一阶段底座"
```

## 规格覆盖检查

- 工作区脚手架与统一脚本：任务 1
- `packages/shared` 纯契约层：任务 2
- `packages/api-client` 空壳预留：任务 3
- 根级验证与收尾：任务 4

## 自检

- 没有使用“待定”“TODO”“后续实现”等占位词。
- `canAccess`、`normalizePermission` 和导出类型在任务 2 中已先定义后使用，类型名一致。
- 计划只覆盖第一阶段底座，没有混入 `admin`、`client` 业务实现，范围可由一份计划独立完成。
