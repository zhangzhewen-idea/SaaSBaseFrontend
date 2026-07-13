import { createRouter, createWebHistory } from 'vue-router'

import { applyAuthGuard } from '../modules/auth/auth.guard'
import './meta'
import { routes } from './routes'

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  applyAuthGuard(to, next)
})
