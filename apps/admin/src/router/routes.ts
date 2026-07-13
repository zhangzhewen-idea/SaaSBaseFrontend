import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../modules/auth/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('../layouts/DomainLayout.vue'),
    redirect: '/platform/overview',
    children: [
      {
        path: 'platform/overview',
        name: 'platform-overview',
        meta: { requiresAuth: true, permissions: ['platform:read'] },
        component: () => import('../modules/platform/PlatformOverviewPage.vue'),
      },
      {
        path: 'tenant/workspace',
        name: 'tenant-workspace',
        meta: { requiresAuth: true, permissions: ['tenant:read'] },
        component: () => import('../modules/tenant/TenantWorkspacePage.vue'),
      },
      {
        path: 'forbidden',
        name: 'forbidden',
        component: () => import('../modules/system/ForbiddenPage.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../modules/system/NotFoundPage.vue'),
  },
]
