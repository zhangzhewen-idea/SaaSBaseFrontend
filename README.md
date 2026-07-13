# SaaSBase 前端工作区

## 环境要求

- Node.js 20+
- pnpm 10+

## 安装依赖

```bash
pnpm install
```

## 启动应用

### 管理端

```bash
pnpm --filter @saasbase/admin dev
```

### 用户端 H5

```bash
pnpm --filter @saasbase/client dev:h5
```

## 模拟账号

### 管理端

- `platform / demo123`
- `tenant / demo123`

### 用户端

- `tenant / demo123`

## 质量命令

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 目录边界

- `apps/admin`：管理端 Vue 应用，包含模拟认证、权限路由、分域布局和 E2E 流程。
- `apps/client`：用户端 uni-app 骨架，包含内存认证适配器和 H5 示例页面。
- `packages/shared`：共享的认证与权限类型、判断逻辑。

## 重要说明

- 当前仓库中的认证与权限实现全部是演示用途，只能用于本地开发和验证。
- 不要把这些模拟登录、内存会话或示例账号用于生产环境。
- 仓库中不应保存真实 token、密钥、证书、生产地址或个人账号信息。
