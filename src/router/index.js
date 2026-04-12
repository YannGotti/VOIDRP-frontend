import { createRouter, createWebHistory } from 'vue-router'
import { bootstrapAuth, getIsAuthenticated } from '../stores/authStore'

import HomeView from '../views/HomeView.vue'
import LinksView from '../views/LinksView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import DownloadLauncherView from '../views/DownloadLauncherView.vue'
import ProfileView from '../views/ProfileView.vue'
import PublicProfileView from '../views/PublicProfileView.vue'
import EditPublicProfileView from '../views/EditPublicProfileView.vue'
import ReferralCenterView from '../views/ReferralCenterView.vue'
import SocialHubView from '../views/SocialHubView.vue'
import NationsListView from '../views/NationsListView.vue'
import NationPublicView from '../views/NationPublicView.vue'
import NationStudioView from '../views/NationStudioView.vue'
import NationRankingsView from '../views/NationRankingsView.vue'
import AdminLegacyView from '../views/AdminLegacyView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Главная' } },
  { path: '/links', name: 'links', component: LinksView, meta: { title: 'Ссылки' } },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true, title: 'Вход' },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true, title: 'Регистрация' },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { guestOnly: true, title: 'Восстановление доступа' },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: { guestOnly: true, title: 'Новый пароль' },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: { guestOnly: true, title: 'Подтверждение почты' },
  },
  {
    path: '/download-launcher',
    name: 'download-launcher',
    component: DownloadLauncherView,
    meta: { title: 'Скачать лаунчер' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true, title: 'Кабинет' },
  },
  {
    path: '/profile/public',
    name: 'edit-public-profile',
    component: EditPublicProfileView,
    meta: { requiresAuth: true, title: 'Публичный профиль' },
  },
  {
    path: '/profile/referrals',
    name: 'profile-referrals',
    component: ReferralCenterView,
    meta: { requiresAuth: true, title: 'Рефералы' },
  },
  {
    path: '/profile/social',
    name: 'profile-social',
    component: SocialHubView,
    meta: { requiresAuth: true, title: 'Друзья и подписки' },
  },
  {
    path: '/u/:slug',
    name: 'public-profile',
    component: PublicProfileView,
    meta: { title: 'Профиль игрока' },
  },
  {
    path: '/nations',
    name: 'nations',
    component: NationsListView,
    meta: { title: 'Государства' },
  },
  {
    path: '/nations/rankings',
    name: 'nation-rankings',
    component: NationRankingsView,
    meta: { title: 'Рейтинг государств' },
  },
  {
    path: '/nation/:slug',
    name: 'nation-public',
    component: NationPublicView,
    meta: { title: 'Государство' },
  },
  {
    path: '/nation/studio',
    name: 'nation-studio',
    component: NationStudioView,
    meta: { requiresAuth: true, title: 'Управление государством' },
  },
  {
    path: '/internal-admin',
    name: 'internal-admin',
    component: AdminLegacyView,
    meta: { hidePublicShell: true, title: 'Legacy Admin' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  await bootstrapAuth()

  const isAuthenticated = getIsAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return { path: '/profile' }
  }

  return true
})

router.afterEach((to) => {
  const pageTitle = typeof to.meta?.title === 'string' && to.meta.title.trim()
    ? to.meta.title.trim()
    : 'VoidRP'

  document.title = pageTitle === 'VoidRP' ? 'VoidRP' : `${pageTitle} • VoidRP`
})

export default router
