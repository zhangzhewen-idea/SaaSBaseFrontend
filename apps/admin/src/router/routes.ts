import type { RouteRecordRaw } from 'vue-router'

import { AdminLayout } from '../layouts'
import DashboardHome from '../modules/dashboard/DashboardHome.vue'
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
        path: 'dashboard',
        component: DashboardHome,
        meta: { title: '租户工作台', requiredPermission: 'tenant-dashboard:view' }
      },
      {
        path: 'users',
        component: () => import('../modules/dashboard/DashboardHome.vue'),
        meta: { title: '用户管理', requiredPermission: 'tenant-user:view' }
      },
      {
        path: 'departments',
        component: () => import('../modules/dashboard/DashboardHome.vue'),
        meta: { title: '部门管理', requiredPermission: 'tenant-department:view' }
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
    component: () => import('../modules/dashboard/DashboardHome.vue'),
    meta: { title: '登录', publicAccess: true }
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundPage,
    meta: { title: '未找到页面', publicAccess: true }
  }
]
