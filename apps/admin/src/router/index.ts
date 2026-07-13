import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../modules/auth/auth.store'
import { routes } from './routes'
import { createRouteGuard } from './guard'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(createRouteGuard(() => useAuthStore().session))
