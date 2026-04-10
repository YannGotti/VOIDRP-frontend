import { createRouter, createWebHistory } from 'vue-router'
import { bootstrapAuth, getIsAuthenticated } from '../stores/authStore'

import HomeView from '../views/HomeView.vue'
import LauncherView from '../views/LauncherView.vue'
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
import AdminLegacyView from '../views/AdminLegacyView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/launcher', name: 'launcher', component: LauncherView },
    { path: '/links', name: 'links', component: LinksView },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { guestOnly: true } },
    { path: '/reset-password', name: 'reset-password', component: ResetPasswordView },
    { path: '/verify-email', name: 'verify-email', component: VerifyEmailView },
    { path: '/download-launcher', name: 'download-launcher', component: DownloadLauncherView },

    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/profile/public', name: 'edit-public-profile', component: EditPublicProfileView, meta: { requiresAuth: true } },
    { path: '/profile/referrals', name: 'profile-referrals', component: ReferralCenterView, meta: { requiresAuth: true } },
    { path: '/profile/social', name: 'profile-social', component: SocialHubView, meta: { requiresAuth: true } },

    { path: '/u/:slug', name: 'public-profile', component: PublicProfileView },
    { path: '/nations', name: 'nations', component: NationsListView },
    { path: '/nation/:slug', name: 'nation-public', component: NationPublicView },
    { path: '/nation/studio', name: 'nation-studio', component: NationStudioView, meta: { requiresAuth: true } },

    { path: '/internal-admin', name: 'internal-admin', component: AdminLegacyView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  await bootstrapAuth()
  const isAuthenticated = getIsAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return { path: '/profile' }
  }

  return true
})

export default router
