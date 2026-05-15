<script setup>
import { onMounted, ref } from 'vue'
import { getDashboardStats, getServerStatus, getRecentUsers } from '../../services/adminApi'
import { adminListPlayers } from '../../services/adminApi'
import { authState } from '../../stores/authStore'

const token = () => authState.accessToken

const stats = ref(null)
const server = ref(null)
const recentUsers = ref([])
const legacySummary = ref(null)
const loading = ref(true)
const serverLoading = ref(true)

async function loadAll() {
  loading.value = true
  serverLoading.value = true

  const [statsRes, serverRes, recentRes, legacyRes] = await Promise.allSettled([
    getDashboardStats(token()),
    getServerStatus(token()),
    getRecentUsers(token()),
    adminListPlayers(token(), { limit: 1 }),
  ])

  stats.value = statsRes.status === 'fulfilled' ? statsRes.value : null
  server.value = serverRes.status === 'fulfilled' ? serverRes.value : { online: false }
  recentUsers.value = recentRes.status === 'fulfilled' ? (recentRes.value?.users || []) : []

  loading.value = false
  serverLoading.value = false
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
onMounted(loadAll)
</script>

<template>
  <div class="ap">
    <div class="ap__header">
      <div>
        <h1 class="ap__title">Дашборд</h1>
        <p class="ap__sub">Обзор состояния сервера и проекта</p>
      </div>
      <button class="btn btn--ghost btn--sm" :disabled="loading" @click="loadAll">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Обновить
      </button>
    </div>

    <!-- Server status bar -->
    <div class="server-bar" :class="server?.online ? 'server-bar--online' : 'server-bar--offline'">
      <div class="server-bar__dot" />
      <div class="server-bar__text">
        <span class="server-bar__status">{{ server?.online ? 'Сервер онлайн' : 'Сервер офлайн' }}</span>
        <span v-if="server?.online" class="server-bar__meta">
          {{ server.players_online }}/{{ server.players_max }} игроков · {{ server.version }} · {{ server.latency_ms }}мс
        </span>
        <span v-else class="server-bar__meta">{{ server?.reason || '—' }}</span>
      </div>
      <RouterLink to="/admin/server" class="server-bar__link">Подробнее →</RouterLink>
    </div>

    <!-- Main stats -->
    <div class="section-label">Пользователи</div>
    <div v-if="loading" class="skel skel--cards" />
    <div v-else-if="stats" class="stats-grid">
      <div class="stat">
        <div class="stat__icon stat__icon--blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div class="stat__body">
          <div class="stat__v">{{ stats.users.total.toLocaleString('ru') }}</div>
          <div class="stat__l">Всего аккаунтов</div>
          <div class="stat__sub">активных {{ stats.users.active.toLocaleString('ru') }}</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat__icon stat__icon--green">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="stat__body">
          <div class="stat__v">{{ stats.users.verified.toLocaleString('ru') }}</div>
          <div class="stat__l">Подтверждены</div>
          <div class="stat__sub">{{ stats.users.total > 0 ? Math.round(stats.users.verified / stats.users.total * 100) : 0 }}% от всех</div>
        </div>
      </div>
      <div class="stat stat--accent">
        <div class="stat__icon stat__icon--purple">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 5 19 12"/></svg>
        </div>
        <div class="stat__body">
          <div class="stat__v">+{{ stats.users.new_last_7d }}</div>
          <div class="stat__l">Новых за 7 дней</div>
          <div class="stat__sub">+{{ stats.users.new_last_30d }} за 30 дней</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat__icon stat__icon--cyan">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <div class="stat__body">
          <div class="stat__v">{{ stats.players.total.toLocaleString('ru') }}</div>
          <div class="stat__l">Игровых аккаунтов</div>
          <div class="stat__sub">привязанных никнеймов</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat__icon stat__icon--orange">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </div>
        <div class="stat__body">
          <div class="stat__v">{{ stats.nations.total }}</div>
          <div class="stat__l">Государств</div>
          <div class="stat__sub">на сервере</div>
        </div>
      </div>
    </div>

    <!-- Quick links -->
    <div class="section-label">Быстрый доступ</div>
    <div class="quick-links">
      <RouterLink to="/admin/players" class="quick-card">
        <div class="quick-card__icon quick-card__icon--blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="quick-card__body">
          <div class="quick-card__label">Игроки</div>
          <div class="quick-card__sub">Поиск, блокировка, legacy</div>
        </div>
        <svg class="quick-card__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </RouterLink>
      <RouterLink to="/admin/market" class="quick-card">
        <div class="quick-card__icon quick-card__icon--cyan">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="quick-card__body">
          <div class="quick-card__label">Рынок</div>
          <div class="quick-card__sub">Цены, товары, пересчёт</div>
        </div>
        <svg class="quick-card__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </RouterLink>
      <RouterLink to="/admin/server" class="quick-card">
        <div class="quick-card__icon quick-card__icon--green">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
        </div>
        <div class="quick-card__body">
          <div class="quick-card__label">Сервер</div>
          <div class="quick-card__sub">Онлайн, игроки, пинг</div>
        </div>
        <svg class="quick-card__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </RouterLink>
      <RouterLink to="/admin/nations" class="quick-card">
        <div class="quick-card__icon quick-card__icon--orange">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="quick-card__body">
          <div class="quick-card__label">Государства</div>
          <div class="quick-card__sub">Список, участники, альянсы</div>
        </div>
        <svg class="quick-card__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </RouterLink>
    </div>

    <!-- Recent users -->
    <div class="section-label">Последние регистрации</div>
    <div class="table-wrap">
      <div v-if="loading" class="skel skel--table" />
      <table v-else-if="recentUsers.length" class="tbl">
        <thead>
          <tr>
            <th>Логин</th>
            <th>Ник</th>
            <th>Почта</th>
            <th>Статус</th>
            <th>Зарегистрирован</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in recentUsers" :key="u.id">
            <td class="tbl__login">{{ u.site_login }}</td>
            <td>{{ u.minecraft_nickname || '—' }}</td>
            <td class="tbl__email">{{ u.email }}</td>
            <td>
              <span class="badge" :class="u.email_verified ? 'badge--green' : 'badge--yellow'">
                {{ u.email_verified ? 'Подтверждён' : 'Не подтверждён' }}
              </span>
            </td>
            <td class="tbl__date">{{ formatDate(u.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">Нет данных</div>
    </div>
  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.ap { padding: 1.75rem 1.5rem 3rem; max-width: 100%; }

.ap__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.ap__title { font-size: 1.4rem; font-weight: 800; color: #e2e8f0; margin: 0; }
.ap__sub { font-size: 0.75rem; color: #475569; margin: 0.15rem 0 0; }

/* Server bar */
.server-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.2rem;
  border-radius: 14px;
  border: 1px solid;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.2s;
}

.server-bar--online {
  background: linear-gradient(90deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.03) 100%);
  border-color: rgba(34,197,94,0.25);
  box-shadow: 0 0 0 1px rgba(34,197,94,0.05) inset, 0 4px 20px rgba(34,197,94,0.07);
}
.server-bar--offline { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.15); }

.server-bar__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.server-bar--online .server-bar__dot {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34,197,94,0.6);
  animation: pulse 2s infinite;
}

.server-bar--offline .server-bar__dot { background: #ef4444; }

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(34,197,94,0.5); }
  50% { box-shadow: 0 0 14px rgba(34,197,94,0.8); }
}

.server-bar__text { flex: 1; min-width: 0; }

.server-bar__status {
  font-size: 0.85rem;
  font-weight: 800;
  display: block;
}

.server-bar--online .server-bar__status { color: #86efac; }
.server-bar--offline .server-bar__status { color: #fca5a5; }

.server-bar__meta { font-size: 0.75rem; color: #475569; margin-top: 0.1rem; display: block; }

.server-bar__link {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.13s;
}

.server-bar__link:hover { color: #94a3b8; }

/* Section label */
.section-label {
  font-size: 0.67rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #3d4f6e;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.section-label::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: linear-gradient(180deg, #7c3aed, #4f46e5);
  flex-shrink: 0;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.stat {
  background: linear-gradient(145deg, #0f1628 0%, #0a1020 100%);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.1rem 1.1rem;
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
  cursor: default;
}

.stat:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.stat--accent {
  border-color: rgba(124,58,237,0.2);
  background: linear-gradient(145deg, #130f22 0%, #0d0a1d 100%);
}

.stat--accent:hover {
  border-color: rgba(124,58,237,0.35);
  box-shadow: 0 8px 24px rgba(124,58,237,0.12);
}

.stat__icon {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat__icon--blue { background: rgba(59,130,246,0.15); color: #93c5fd; }
.stat__icon--green { background: rgba(34,197,94,0.12); color: #86efac; }
.stat__icon--purple { background: rgba(124,58,237,0.15); color: #c4b5fd; }
.stat__icon--cyan { background: rgba(6,182,212,0.12); color: #67e8f9; }
.stat__icon--orange { background: rgba(249,115,22,0.12); color: #fdba74; }

.stat__body { min-width: 0; }

.stat__v { font-size: 1.5rem; font-weight: 900; color: #e2e8f0; line-height: 1; }
.stat--accent .stat__v { color: #c4b5fd; }

.stat__l { font-size: 0.72rem; font-weight: 700; color: #64748b; margin-top: 0.2rem; }
.stat__sub { font-size: 0.65rem; color: #334155; margin-top: 0.1rem; }

/* Quick links */
.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.65rem;
  margin-bottom: 1.75rem;
}

.quick-card {
  background: linear-gradient(145deg, #0f1628 0%, #0a1020 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 1rem 1.2rem;
  text-decoration: none;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.quick-card:hover {
  border-color: rgba(124,58,237,0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.quick-card__icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-card__icon--blue { background: rgba(59,130,246,0.15); color: #93c5fd; }
.quick-card__icon--cyan { background: rgba(6,182,212,0.15); color: #67e8f9; }
.quick-card__icon--green { background: rgba(34,197,94,0.12); color: #86efac; }
.quick-card__icon--orange { background: rgba(249,115,22,0.12); color: #fdba74; }

.quick-card__body { flex: 1; min-width: 0; }
.quick-card__label { font-size: 0.85rem; font-weight: 800; color: #c4b5fd; }
.quick-card__sub { font-size: 0.72rem; color: #2d3d58; margin-top: 0.12rem; }

.quick-card__arrow {
  color: #2d3d58;
  flex-shrink: 0;
  transition: transform 0.15s, color 0.15s;
}

.quick-card:hover .quick-card__arrow {
  transform: translateX(3px);
  color: #7c3aed;
}

/* Table */
.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); background: #0a1020; }

.tbl { width: 100%; border-collapse: collapse; font-size: 0.8rem; white-space: nowrap; }

.tbl thead th {
  padding: 0.6rem 0.9rem;
  text-align: left;
  font-size: 0.63rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #2d3e5c;
  background: linear-gradient(0deg, #0a1020 0%, #0d1428 100%);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.tbl tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; }
.tbl tbody tr:last-child { border-bottom: none; }
.tbl tbody tr:hover { background: rgba(124,58,237,0.04); }
.tbl td { padding: 0.55rem 0.9rem; color: #64748b; vertical-align: middle; }

.tbl__login { font-weight: 800; color: #c4b5fd !important; }
.tbl__email { color: #334155 !important; font-size: 0.75rem; }
.tbl__date { color: #334155 !important; font-size: 0.72rem; }

/* Button */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: background 0.13s;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--ghost { background: rgba(255,255,255,0.05); color: #94a3b8; }
.btn--ghost:hover:not(:disabled) { background: rgba(255,255,255,0.09); }
.btn--sm { padding: 0.32rem 0.7rem; font-size: 0.77rem; }

/* Badge */
.badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.65rem; font-weight: 800; }
.badge--green { background: rgba(34,197,94,0.1); color: #86efac; }
.badge--yellow { background: rgba(234,179,8,0.1); color: #fde047; }

/* Skeleton */
.skel {
  border-radius: 12px;
  background: linear-gradient(90deg, #0d1422 25%, #121929 50%, #0d1422 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skel--cards { height: 96px; margin-bottom: 1.75rem; }
.skel--table { height: 200px; }

@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.empty { color: #334155; font-size: 0.83rem; padding: 1.5rem; text-align: center; }

@media (max-width: 600px) { .ap { padding: 1rem 0.75rem 2rem; } }
</style>
