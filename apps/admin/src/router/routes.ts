import type { RouteRecordRaw } from 'vue-router'

import { AdminLayout } from '../layouts'
import DashboardHome from '../modules/dashboard/DashboardHome.vue'
import UserManagementView from '../modules/users/UserManagementView.vue'
import DepartmentManagementView from '../modules/depts/DepartmentManagementView.vue'
import PlatformTenantPage from '../modules/platform/PlatformTenantPage.vue'
import FileManagementView from '../modules/files/FileManagementView.vue'
import { LoginView } from '../modules/auth'
import { ForbiddenPage, NotFoundPage } from '../modules/system'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: 'tenant/workspace',
        redirect: '/dashboard'
      },
      {
        path: 'platform/overview',
        component: () => import('../modules/platform/PlatformOverviewPage.vue'),
        meta: { title: '平台概览', publicAccess: true }
      },
      {
        path: 'dashboard',
        component: DashboardHome,
        meta: { title: '租户工作台', requiredPermission: 'tenant:profile:read' }
      },
      {
        path: 'users',
        component: UserManagementView,
        meta: { title: '用户管理', requiredPermission: 'tenant:user:read' }
      },
      {
        path: 'departments',
        component: DepartmentManagementView,
        meta: { title: '部门管理', requiredPermission: 'tenant:dept:read' }
      },
      {
        path: 'files',
        component: FileManagementView,
        meta: { title: '文件管理', requiredPermission: 'tenant:file:read' }
      },
      {
        path: 'platform/tenants',
        component: PlatformTenantPage,
        meta: { title: '平台租户管理', requiredPermission: 'platform:tenant:read' }
      },
      {
        path: 'forbidden',
        component: ForbiddenPage,
        meta: { title: '没有权限', publicAccess: true }
      }
    ]
  },
  {
    path: '/login',
    component: LoginView,
    meta: { title: '登录', publicAccess: true }
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundPage,
    meta: { title: '未找到页面', publicAccess: true }
  }
]
