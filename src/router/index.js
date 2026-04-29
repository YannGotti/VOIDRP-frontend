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
import AllianceHubView from '../views/AllianceHubView.vue'
import AdminLegacyView from '../views/AdminLegacyView.vue'
import AdminMarketView from '../views/AdminMarketView.vue'
import ExpertGuideView from '../views/ExpertGuideView.vue'
import MarketView from '../views/MarketView.vue'
import MarketItemView from '../views/MarketItemView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import OfferAgreementView from '../views/OfferAgreementView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Главная' } },
  { path: '/guide', name: 'expert-guide', component: ExpertGuideView, meta: { title: 'Гайд сборки' } },
  { path: '/market', name: 'market', component: MarketView, meta: { title: 'Рынок' } },
  { path: '/market/:material', name: 'market-item', component: MarketItemView, meta: { title: 'Товар' } },
  { path: '/links', name: 'links', component: LinksView, meta: { title: 'Ссылки' } },
  { path: '/privacy', name: 'privacy-policy', component: PrivacyPolicyView, meta: { title: 'Политика конфиденциальности' } },
  { path: '/offer', name: 'offer-agreement', component: OfferAgreementView, meta: { title: 'Договор оферты' } },
  { path: '/login', name: 'login', component: LoginView, meta: { title: 'Вход', guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { title: 'Регистрация', guestOnly: true } },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { title: 'Восстановление пароля', guestOnly: true } },
  { path: '/reset-password', name: 'reset-password', component: ResetPasswordView, meta: { title: 'Смена пароля', guestOnly: true } },
  { path: '/verify-email', name: 'verify-email', component: VerifyEmailView, meta: { title: 'Подтверждение почты' } },
  { path: '/download-launcher', name: 'download-launcher', component: DownloadLauncherView, meta: { title: 'Скачать лаунчер' } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { title: 'Профиль', requiresAuth: true } },
  { path: '/profile/public', name: 'edit-public-profile', component: EditPublicProfileView, meta: { title: 'Публичный профиль', requiresAuth: true } },
  { path: '/profile/referrals', name: 'referrals', component: ReferralCenterView, meta: { title: 'Реферальный центр', requiresAuth: true } },
  { path: '/profile/social', name: 'social', component: SocialHubView, meta: { title: 'Социальный центр', requiresAuth: true } },
  { path: '/u/:slug', name: 'public-profile', component: PublicProfileView, meta: { title: 'Профиль игрока' } },
  { path: '/nations', name: 'nations', component: NationsListView, meta: { title: 'Государства' } },
  { path: '/nation/:slug', name: 'nation-public', component: NationPublicView, meta: { title: 'Государство' } },
  { path: '/nation/studio', name: 'nation-studio', component: NationStudioView, meta: { title: 'Студия государства', requiresAuth: true } },
  { path: '/nations/rankings', name: 'nation-rankings', component: NationRankingsView, meta: { title: 'Рейтинг государств' } },
  { path: '/alliances', name: 'alliances', component: AllianceHubView, meta: { title: 'Альянсы' } },
  { path: '/internal-admin', name: 'admin-legacy', component: AdminLegacyView, meta: { title: 'Legacy Admin', hidePublicShell: true } },
  { path: '/internal-admin/market', name: 'admin-market', component: AdminMarketView, meta: { title: 'Market Admin', hidePublicShell: true } },
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
  if (to.meta?.requiresAuth && !isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta?.guestOnly && isAuthenticated) {
    return { path: '/profile' }
  }
  document.title = typeof to.meta?.title === 'string' && to.meta.title.length > 0
    ? `${to.meta.title} — VoidRP`
    : 'VoidRP'
  return true
})

export default router
