<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getMarketItems,
  getMarketSummary,
  getMarketTransactions,
  getNationMarketListings,
} from '../services/marketApi'
import { formatNumber } from '../utils/formatters'
import { getMaterialName, getRussianMaterialName } from '../utils/materialNames'

const router = useRouter()

const loading = ref(true)
const error = ref('')
const summary = ref(null)
const items = ref([])
const listings = ref([])
const transactions = ref([])

const filters = reactive({
  q: '',
  sort: 'material',
  direction: 'asc',
})

const topMovers = computed(() =>
  [...items.value]
    .filter((item) => Math.abs(Number(item.trend_percent || 0)) > 0)
    .sort((a, b) => Math.abs(Number(b.trend_percent || 0)) - Math.abs(Number(a.trend_percent || 0)))
    .slice(0, 8),
)

function money(value) {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric)) return '0.00'
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)
}

function materialLabel(item) {
  if (!item) return 'Предмет'
  return getRussianMaterialName(item.material) || item.display_name || getMaterialName(item.material)
}

function openItem(item) {
  router.push({ name: 'market-item', params: { material: item.material } })
}

function stateLabel(value) {
  if (value === 'high_demand') return 'Высокий спрос'
  if (value === 'oversupply') return 'Перепроизводство'
  return 'Стабильно'
}

function trendClass(value) {
  const numeric = Number(value || 0)
  if (numeric > 0) return 'text-emerald-300'
  if (numeric < 0) return 'text-rose-300'
  return 'text-slate-400'
}

async function loadMarket() {
  loading.value = true
  error.value = ''
  try {
    const [summaryPayload, itemPayload, listingPayload, transactionPayload] = await Promise.all([
      getMarketSummary(),
      getMarketItems({ q: filters.q, sort: filters.sort, direction: filters.direction, limit: 300 }),
      getNationMarketListings({ q: filters.q, limit: 100 }),
      getMarketTransactions({ limit: 24 }),
    ])
    summary.value = summaryPayload
    items.value = itemPayload?.items || []
    listings.value = listingPayload?.items || []
    transactions.value = transactionPayload?.items || []
  } catch (err) {
    error.value = err?.message || 'Не удалось загрузить рынок.'
  } finally {
    loading.value = false
  }
}

function submitFilters() {
  void loadMarket()
}

onMounted(loadMarket)
</script>

<template>
  <section class="market-page py-4 md:py-5">
    <div class="container-shell max-w-[1380px] space-y-4">
      <section class="market-hero gradient-panel p-4 md:p-6 lg:p-7">
        <div class="grid gap-4 xl:grid-cols-[1fr_360px] xl:items-end">
          <div>
            <div class="section-kicker section-kicker--light !mb-2">Экономика VoidRP</div>
            <h1 class="text-2xl font-black tracking-tight text-white md:text-4xl lg:text-5xl">
              Живой рынок сервера
            </h1>
            <p class="mt-3 max-w-4xl text-sm leading-7 text-white/76 md:text-[15px]">
              Цены меняются от реальных покупок и продаж в EconomyShopGUI. Государства могут выставлять свои товары,
              а текущая цена лота двигается вместе с рынком.
            </p>
          </div>

          <form class="market-search" @submit.prevent="submitFilters">
            <input v-model="filters.q" class="input" placeholder="Поиск: IRON, DIAMOND, уголь..." />
            <select v-model="filters.sort" class="select">
              <option value="material">По названию</option>
              <option value="buy">По покупке</option>
              <option value="sell">По скупке</option>
              <option value="demand">По спросу</option>
              <option value="supply">По предложению</option>
              <option value="updated">По обновлению</option>
            </select>
            <button class="btn btn-light" type="submit">Обновить</button>
          </form>
        </div>
      </section>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <section class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article class="metric-card market-metric">
          <p class="metric-label">Активных товаров</p>
          <p class="metric-value">{{ formatNumber(summary?.active_items || 0) }}</p>
        </article>
        <article class="metric-card market-metric">
          <p class="metric-label">Лоты государств</p>
          <p class="metric-value">{{ formatNumber(summary?.active_nation_listings || 0) }}</p>
        </article>
        <article class="metric-card market-metric">
          <p class="metric-label">Оборот магазина 24ч</p>
          <p class="metric-value">{{ money(summary?.shop_volume_24h || 0) }}</p>
        </article>
        <article class="metric-card market-metric">
          <p class="metric-label">Оборот государств 24ч</p>
          <p class="metric-value">{{ money(summary?.nation_volume_24h || 0) }}</p>
        </article>
      </section>

      <section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div class="surface-card p-4 md:p-5">
          <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div class="section-kicker !mb-2">Цены</div>
              <h2 class="text-xl font-black text-slate-50 md:text-2xl">Товары EconomyShopGUI</h2>
            </div>
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {{ items.length }} строк
            </p>
          </div>

          <div v-if="loading" class="mt-4 grid gap-2">
            <div v-for="i in 8" :key="i" class="skeleton h-14 rounded-2xl"></div>
          </div>

          <template v-else>
            <div class="market-table-desktop market-table-wrap mt-4">
              <table class="market-table">
                <thead>
                  <tr>
                    <th>Предмет</th>
                    <th>Покупка</th>
                    <th>Скупка</th>
                    <th>Изм.</th>
                    <th>Спрос</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in items" :key="item.material" class="market-row" @click="openItem(item)">
                    <td>
                      <strong>{{ materialLabel(item) }}</strong>
                      <span>{{ item.material }}</span>
                    </td>
                    <td>{{ money(item.current_buy_price) }}</td>
                    <td>{{ money(item.current_sell_price) }}</td>
                    <td :class="trendClass(item.trend_percent)">{{ Number(item.trend_percent || 0) > 0 ? '+' : '' }}{{ money(item.trend_percent) }}%</td>
                    <td>{{ stateLabel(item.demand_state) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="market-table-mobile mt-4">
              <div
                v-for="item in items"
                :key="item.material"
                class="market-mobile-card"
                @click="openItem(item)"
              >
                <div class="market-mobile-card__header">
                  <div class="market-mobile-card__name">
                    <strong>{{ materialLabel(item) }}</strong>
                    <small>{{ item.material }}</small>
                  </div>
                  <span :class="['market-mobile-card__trend', trendClass(item.trend_percent)]">
                    {{ Number(item.trend_percent || 0) > 0 ? '+' : '' }}{{ money(item.trend_percent) }}%
                  </span>
                </div>
                <div class="market-mobile-card__prices">
                  <div class="market-mobile-card__price market-mobile-card__price--buy">
                    <small>Покупка</small>
                    <strong>{{ money(item.current_buy_price) }}</strong>
                  </div>
                  <div class="market-mobile-card__price market-mobile-card__price--sell">
                    <small>Скупка</small>
                    <strong>{{ money(item.current_sell_price) }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <aside class="space-y-4">
          <section class="surface-card p-4 md:p-5">
            <div class="section-kicker !mb-2">Движение</div>
            <h2 class="text-lg font-black text-slate-50">Самые заметные изменения</h2>
            <div class="mt-3 grid gap-2">
              <div v-for="item in topMovers" :key="item.material" class="market-mini-row">
                <span>{{ materialLabel(item) }}</span>
                <strong :class="trendClass(item.trend_percent)">{{ Number(item.trend_percent || 0) > 0 ? '+' : '' }}{{ money(item.trend_percent) }}%</strong>
              </div>
              <p v-if="!topMovers.length && !loading" class="text-sm text-slate-400">Пока нет заметных изменений.</p>
            </div>
          </section>

          <section class="surface-card p-4 md:p-5">
            <div class="section-kicker !mb-2">Последние сделки</div>
            <h2 class="text-lg font-black text-slate-50">EconomyShopGUI</h2>
            <div class="mt-3 grid gap-2">
              <div v-for="tx in transactions" :key="tx.id" class="market-mini-row market-mini-row--stacked">
                <span>{{ tx.material }} x{{ tx.amount }}</span>
                <strong>{{ money(tx.final_total_price) }}</strong>
                <small>{{ tx.transaction_type }} · {{ tx.player_name }}</small>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section class="surface-card p-4 md:p-5">
        <div class="section-kicker !mb-2">Государственный рынок</div>
        <h2 class="text-xl font-black text-slate-50 md:text-2xl">Активные лоты государств</h2>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Здесь отображаются лоты, которые главы и офицеры выставили из инвентаря. Купить больше остатка нельзя,
          а продавец может вернуть только непроданную часть.
        </p>

        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="lot in listings" :key="lot.id" class="market-listing-card">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3>{{ getRussianMaterialName(lot.material) || lot.display_name || lot.material }}</h3>
                <p>[{{ lot.nation_tag }}] {{ lot.nation_title }}</p>
              </div>
              <span>{{ lot.remaining_amount }} / {{ lot.total_amount }}</span>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <small>Цена сейчас</small>
                <strong>{{ money(lot.current_unit_price) }}</strong>
              </div>
              <div>
                <small>Продавец</small>
                <strong>{{ lot.seller_player_name }}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.market-page::before {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: -1;
  content: '';
  background:
    radial-gradient(circle at 18% 10%, rgba(34, 197, 94, 0.08), transparent 28%),
    radial-gradient(circle at 82% 18%, rgba(109, 93, 246, 0.12), transparent 30%);
}

.market-search {
  display: grid;
  gap: .65rem;
  grid-template-columns: minmax(0, 1fr) 150px auto;
}

.market-metric {
  border: 1px solid rgba(255,255,255,.08);
  background: linear-gradient(180deg, rgba(15, 23, 42, .74), rgba(15, 23, 42, .36));
}

.market-table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 1.2rem;
}

.market-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.market-row {
  cursor: pointer;
  transition: background 0.12s;
}

.market-row:hover td {
  background: rgba(255,255,255,.045);
}

.market-table th,
.market-table td {
  border-bottom: 1px solid rgba(255,255,255,.07);
  padding: .82rem .9rem;
  text-align: left;
}

.market-table th {
  background: rgba(255,255,255,.04);
  color: rgb(148 163 184);
  font-size: .68rem;
  font-weight: 900;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.market-table td {
  color: rgb(203 213 225);
  font-size: .9rem;
}

.market-table td:first-child strong,
.market-table td:first-child span {
  display: block;
}

.market-table td:first-child span {
  margin-top: .12rem;
  color: rgb(100 116 139);
  font-size: .78rem;
}

.market-mini-row,
.market-listing-card {
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 1rem;
  background: rgba(255,255,255,.035);
  padding: .75rem;
}

.market-mini-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
}

.market-mini-row--stacked {
  display: grid;
  grid-template-columns: 1fr auto;
}

.market-mini-row small {
  grid-column: 1 / -1;
  color: rgb(100 116 139);
}

.market-listing-card h3 {
  color: rgb(248 250 252);
  font-weight: 900;
}

.market-listing-card p,
.market-listing-card small {
  color: rgb(148 163 184);
}

.market-listing-card span {
  border-radius: 999px;
  background: rgba(34, 197, 94, .1);
  color: rgb(134 239 172);
  padding: .35rem .55rem;
  font-size: .78rem;
  font-weight: 900;
}

.market-listing-card strong {
  display: block;
  color: rgb(226 232 240);
}

@media (max-width: 760px) {
  .market-search {
    grid-template-columns: 1fr;
  }
}

/* Mobile / desktop table toggle */
.market-table-desktop {
  display: none;
}

.market-table-mobile {
  display: grid;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .market-table-desktop {
    display: block;
  }

  .market-table-mobile {
    display: none;
  }
}

/* Mobile card styles */
.market-mobile-card {
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 1rem;
  background: rgba(255,255,255,.035);
  padding: .75rem;
  cursor: pointer;
  transition: background 0.12s;
}

.market-mobile-card:hover {
  background: rgba(255,255,255,.065);
}

.market-mobile-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .5rem;
  margin-bottom: .55rem;
}

.market-mobile-card__name strong {
  display: block;
  color: rgb(226 232 240);
  font-size: .9rem;
  font-weight: 700;
}

.market-mobile-card__name small {
  display: block;
  margin-top: .1rem;
  color: rgb(100 116 139);
  font-size: .72rem;
  font-family: monospace;
}

.market-mobile-card__trend {
  border-radius: 999px;
  background: rgba(255,255,255,.06);
  padding: .25rem .55rem;
  font-size: .75rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.market-mobile-card__prices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .5rem;
}

.market-mobile-card__price {
  border-radius: .65rem;
  padding: .45rem .6rem;
}

.market-mobile-card__price small {
  display: block;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  margin-bottom: .15rem;
}

.market-mobile-card__price strong {
  display: block;
  font-size: .88rem;
  font-weight: 900;
}

.market-mobile-card__price--buy {
  background: rgba(34, 197, 94, .07);
  border: 1px solid rgba(34, 197, 94, .15);
}

.market-mobile-card__price--buy small {
  color: rgb(134 239 172);
}

.market-mobile-card__price--buy strong {
  color: rgb(167 243 208);
}

.market-mobile-card__price--sell {
  background: rgba(244, 63, 94, .07);
  border: 1px solid rgba(244, 63, 94, .15);
}

.market-mobile-card__price--sell small {
  color: rgb(253 164 175);
}

.market-mobile-card__price--sell strong {
  color: rgb(254 202 202);
}
</style>
