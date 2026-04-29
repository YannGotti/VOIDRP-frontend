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
const allItems = ref([])
const listings = ref([])
const transactions = ref([])

const filters = reactive({
  q: '',
  sort: 'material',
  direction: 'asc',
})

const filteredItems = computed(() => {
  let result = allItems.value
  const q = filters.q.trim().toLowerCase()
  if (q) {
    result = result.filter(
      (item) =>
        item.material.toLowerCase().includes(q) ||
        (item.display_name || '').toLowerCase().includes(q) ||
        (getRussianMaterialName(item.material) || '').toLowerCase().includes(q),
    )
  }
  const dir = filters.direction === 'desc' ? -1 : 1
  return [...result].sort((a, b) => {
    switch (filters.sort) {
      case 'buy':
        return dir * (Number(a.current_buy_price || 0) - Number(b.current_buy_price || 0))
      case 'sell':
        return dir * (Number(a.current_sell_price || 0) - Number(b.current_sell_price || 0))
      case 'demand':
        return dir * (a.demand_state || '').localeCompare(b.demand_state || '')
      case 'updated':
        return dir * ((a.updated_at || '') > (b.updated_at || '') ? 1 : -1)
      default:
        return dir * materialLabel(a).localeCompare(materialLabel(b), 'ru')
    }
  })
})

const topMovers = computed(() =>
  [...allItems.value]
    .filter((item) => Math.abs(Number(item.trend_percent || 0)) > 0)
    .sort((a, b) => Math.abs(Number(b.trend_percent || 0)) - Math.abs(Number(a.trend_percent || 0)))
    .slice(0, 6),
)

function money(value) {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric)) return '0.00'
  return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numeric)
}

function materialLabel(item) {
  if (!item) return 'Предмет'
  return getRussianMaterialName(item.material) || item.display_name || getMaterialName(item.material)
}

function openItem(item) {
  router.push({ name: 'market-item', params: { material: item.material } })
}

function stateLabel(value) {
  if (value === 'high_demand') return 'Спрос'
  if (value === 'oversupply') return 'Избыток'
  return '—'
}

function trendClass(value) {
  const n = Number(value || 0)
  if (n > 0) return 'up'
  if (n < 0) return 'down'
  return 'flat'
}

function trendSign(value) {
  const n = Number(value || 0)
  return (n > 0 ? '+' : '') + money(value) + '%'
}

function toggleDir() {
  filters.direction = filters.direction === 'asc' ? 'desc' : 'asc'
}

async function loadMarket() {
  loading.value = true
  error.value = ''
  try {
    const [summaryPayload, itemPayload, listingPayload, transactionPayload] = await Promise.all([
      getMarketSummary(),
      getMarketItems({ limit: 500 }),
      getNationMarketListings({ limit: 100 }),
      getMarketTransactions({ limit: 18 }),
    ])
    summary.value = summaryPayload
    allItems.value = itemPayload?.items || []
    listings.value = listingPayload?.items || []
    transactions.value = transactionPayload?.items || []
  } catch (err) {
    error.value = err?.message || 'Не удалось загрузить рынок.'
  } finally {
    loading.value = false
  }
}

onMounted(loadMarket)
</script>

<template>
  <section class="mp py-3 md:py-4">
    <div class="container-shell max-w-[1380px] space-y-3">

      <!-- compact header -->
      <header class="mp-header">
        <div class="mp-header__title">
          <p class="mp-eyebrow">Экономика · VoidRP</p>
          <h1 class="mp-h1">Рынок</h1>
        </div>
        <div class="mp-controls">
          <div class="mp-search">
            <svg class="mp-search__icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
            <input v-model="filters.q" class="mp-search__input" placeholder="Поиск..." />
            <span v-if="filters.q" class="mp-search__count">{{ filteredItems.length }}</span>
          </div>
          <select v-model="filters.sort" class="mp-select">
            <option value="material">По названию</option>
            <option value="buy">По покупке</option>
            <option value="sell">По скупке</option>
            <option value="demand">По спросу</option>
            <option value="updated">По дате</option>
          </select>
          <button class="mp-dir-btn" :title="filters.direction === 'asc' ? 'По возрастанию' : 'По убыванию'" @click="toggleDir">
            <svg viewBox="0 0 20 20" fill="currentColor" :style="filters.direction === 'desc' ? 'transform:scaleY(-1)' : ''">
              <path fill-rule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h7a1 1 0 100-2H3zm0 4a1 1 0 100 2h4a1 1 0 100-2H3z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </header>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <!-- stats strip -->
      <div class="mp-stats">
        <div class="mp-stat">
          <span>Товаров</span>
          <strong>{{ formatNumber(summary?.active_items || 0) }}</strong>
        </div>
        <div class="mp-stat">
          <span>Лотов</span>
          <strong>{{ formatNumber(summary?.active_nation_listings || 0) }}</strong>
        </div>
        <div class="mp-stat">
          <span>Оборот магазина 24ч</span>
          <strong>{{ money(summary?.shop_volume_24h || 0) }}</strong>
        </div>
        <div class="mp-stat">
          <span>Оборот лотов 24ч</span>
          <strong>{{ money(summary?.nation_volume_24h || 0) }}</strong>
        </div>
      </div>

      <!-- main grid -->
      <div class="mp-grid">
        <!-- items table -->
        <div class="surface-card mp-table-card">
          <div class="mp-table-header">
            <h2 class="mp-section-title">Товары EconomyShopGUI</h2>
            <span class="mp-count">{{ filteredItems.length }} / {{ allItems.length }}</span>
          </div>

          <div v-if="loading" class="mp-skeletons">
            <div v-for="i in 10" :key="i" class="skeleton" style="height:36px;border-radius:8px"></div>
          </div>

          <template v-else-if="filteredItems.length === 0">
            <p class="mp-empty">Ничего не найдено</p>
          </template>

          <template v-else>
            <!-- desktop table -->
            <div class="mp-tbl-wrap mp-desktop">
              <table class="mp-tbl">
                <thead>
                  <tr>
                    <th>Предмет</th>
                    <th class="num">Покупка</th>
                    <th class="num">Скупка</th>
                    <th class="num">Изм.</th>
                    <th>Спрос</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredItems" :key="item.material" class="mp-row" @click="openItem(item)">
                    <td>
                      <span class="mp-name">{{ materialLabel(item) }}</span>
                      <span class="mp-material-id">{{ item.material }}</span>
                    </td>
                    <td class="num">{{ money(item.current_buy_price) }}</td>
                    <td class="num">{{ money(item.current_sell_price) }}</td>
                    <td class="num" :class="['trend', trendClass(item.trend_percent)]">{{ trendSign(item.trend_percent) }}</td>
                    <td class="mp-demand">{{ stateLabel(item.demand_state) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- mobile cards -->
            <div class="mp-mobile">
              <div v-for="item in filteredItems" :key="item.material" class="mp-mcard" @click="openItem(item)">
                <div class="mp-mcard__top">
                  <div>
                    <strong>{{ materialLabel(item) }}</strong>
                    <small>{{ item.material }}</small>
                  </div>
                  <span :class="['mp-mcard__trend', trendClass(item.trend_percent)]">{{ trendSign(item.trend_percent) }}</span>
                </div>
                <div class="mp-mcard__prices">
                  <div class="mp-mcard__price buy">
                    <small>Покупка</small>
                    <strong>{{ money(item.current_buy_price) }}</strong>
                  </div>
                  <div class="mp-mcard__price sell">
                    <small>Скупка</small>
                    <strong>{{ money(item.current_sell_price) }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- sidebar -->
        <aside class="mp-sidebar">
          <!-- top movers -->
          <div class="surface-card mp-side-card">
            <h3 class="mp-section-title">Заметные изменения</h3>
            <div v-if="loading" class="mp-skeletons mt-2">
              <div v-for="i in 4" :key="i" class="skeleton" style="height:28px;border-radius:6px"></div>
            </div>
            <div v-else-if="topMovers.length === 0" class="mp-empty">Нет изменений</div>
            <ul v-else class="mp-mover-list">
              <li v-for="item in topMovers" :key="item.material">
                <span>{{ materialLabel(item) }}</span>
                <strong :class="['trend', trendClass(item.trend_percent)]">{{ trendSign(item.trend_percent) }}</strong>
              </li>
            </ul>
          </div>

          <!-- recent transactions -->
          <div class="surface-card mp-side-card">
            <h3 class="mp-section-title">Последние сделки</h3>
            <div v-if="loading" class="mp-skeletons mt-2">
              <div v-for="i in 5" :key="i" class="skeleton" style="height:28px;border-radius:6px"></div>
            </div>
            <ul v-else class="mp-tx-list">
              <li v-for="tx in transactions" :key="tx.id">
                <div class="mp-tx-left">
                  <span>{{ tx.material }}</span>
                  <small>{{ tx.transaction_type }} · {{ tx.player_name }} · ×{{ tx.amount }}</small>
                </div>
                <strong>{{ money(tx.final_total_price) }}</strong>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <!-- nation listings -->
      <div v-if="listings.length" class="surface-card mp-listings-card">
        <div class="mp-table-header">
          <h2 class="mp-section-title">Лоты государств</h2>
          <span class="mp-count">{{ listings.length }}</span>
        </div>
        <div class="mp-listings-grid">
          <article v-for="lot in listings" :key="lot.id" class="mp-lot">
            <div class="mp-lot__top">
              <div>
                <strong>{{ getRussianMaterialName(lot.material) || lot.display_name || lot.material }}</strong>
                <small>[{{ lot.nation_tag }}] {{ lot.nation_title }}</small>
              </div>
              <span class="mp-lot__qty">{{ lot.remaining_amount }}/{{ lot.total_amount }}</span>
            </div>
            <div class="mp-lot__meta">
              <div><small>Цена</small><strong>{{ money(lot.current_unit_price) }}</strong></div>
              <div><small>Продавец</small><strong>{{ lot.seller_player_name }}</strong></div>
            </div>
          </article>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.mp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.mp-eyebrow {
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin: 0 0 .15rem;
}

.mp-h1 {
  font-size: 1.5rem;
  font-weight: 900;
  color: #f8fbff;
  margin: 0;
  letter-spacing: -.03em;
}

.mp-controls {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
}

/* search */
.mp-search {
  position: relative;
  display: flex;
  align-items: center;
}

.mp-search__icon {
  position: absolute;
  left: .65rem;
  width: 1rem;
  height: 1rem;
  color: rgb(100 116 139);
  pointer-events: none;
  flex-shrink: 0;
}

.mp-search__input {
  width: 220px;
  min-height: 2.35rem;
  padding: 0 2rem 0 2.2rem;
  border-radius: 10px !important;
  border: 1px solid rgba(148,163,184,.14) !important;
  background: rgba(6,10,19,.7) !important;
  color: #f8fbff !important;
  font-size: .875rem;
}

.mp-search__input:focus {
  outline: none;
  border-color: rgba(139,92,246,.34) !important;
  box-shadow: 0 0 0 3px rgba(139,92,246,.1);
}

.mp-search__input::placeholder {
  color: rgb(100 116 139);
}

.mp-search__count {
  position: absolute;
  right: .55rem;
  font-size: .72rem;
  font-weight: 700;
  color: rgb(139 92 246);
}

.mp-select {
  min-height: 2.35rem;
  padding: 0 .7rem;
  border-radius: 10px !important;
  border: 1px solid rgba(148,163,184,.14) !important;
  background: rgba(6,10,19,.7) !important;
  color: #f8fbff !important;
  font-size: .875rem;
  cursor: pointer;
}

.mp-dir-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 10px;
  border: 1px solid rgba(148,163,184,.14);
  background: rgba(6,10,19,.7);
  color: rgb(148 163 184);
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color .15s, color .15s;
}

.mp-dir-btn:hover {
  border-color: rgba(139,92,246,.3);
  color: #fff;
}

.mp-dir-btn svg {
  width: 1rem;
  height: 1rem;
  transition: transform .2s;
}

/* stats strip */
.mp-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .5rem;
}

.mp-stat {
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  background: rgba(5,10,20,.6);
  padding: .65rem .85rem;
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.mp-stat span {
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(100 116 139);
}

.mp-stat strong {
  font-size: 1.2rem;
  font-weight: 900;
  color: #f8fbff;
  letter-spacing: -.03em;
}

/* main grid */
.mp-grid {
  display: grid;
  gap: .75rem;
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 1100px) {
  .mp-grid {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}

/* table card */
.mp-table-card {
  padding: 1rem 1rem .75rem;
}

.mp-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .75rem;
}

.mp-section-title {
  font-size: .92rem;
  font-weight: 800;
  color: rgb(203 213 225);
  margin: 0;
}

.mp-count {
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .1em;
  color: rgb(100 116 139);
}

.mp-empty {
  text-align: center;
  padding: 2rem;
  font-size: .9rem;
  color: rgb(100 116 139);
}

.mp-skeletons {
  display: grid;
  gap: .35rem;
}

/* desktop table */
.mp-tbl-wrap {
  overflow-x: auto;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
}

.mp-tbl {
  width: 100%;
  border-collapse: collapse;
  min-width: 580px;
}

.mp-tbl th {
  background: rgba(255,255,255,.03);
  border-bottom: 1px solid rgba(255,255,255,.07);
  padding: .45rem .75rem;
  text-align: left;
  font-size: .65rem;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  white-space: nowrap;
}

.mp-tbl td {
  border-bottom: 1px solid rgba(255,255,255,.05);
  padding: .5rem .75rem;
  font-size: .875rem;
  color: rgb(203 213 225);
}

.mp-tbl th.num,
.mp-tbl td.num {
  text-align: right;
}

.mp-row {
  cursor: pointer;
  transition: background .1s;
}

.mp-row:last-child td {
  border-bottom: none;
}

.mp-row:hover td {
  background: rgba(255,255,255,.03);
}

.mp-name {
  display: block;
  font-weight: 600;
  color: #e2e8f0;
}

.mp-material-id {
  display: block;
  font-size: .72rem;
  color: rgb(71 85 105);
  font-family: monospace;
  margin-top: .05rem;
}

.mp-demand {
  font-size: .78rem;
  color: rgb(148 163 184);
}

/* trend colors */
.trend.up   { color: rgb(110 231 183); }
.trend.down { color: rgb(252 165 165); }
.trend.flat { color: rgb(100 116 139); }

/* mobile cards */
.mp-desktop { display: none; }
.mp-mobile  { display: grid; gap: .35rem; }

@media (min-width: 560px) {
  .mp-desktop { display: block; }
  .mp-mobile  { display: none; }
}

.mp-mcard {
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
  background: rgba(255,255,255,.025);
  padding: .65rem .75rem;
  cursor: pointer;
  transition: background .1s;
}

.mp-mcard:hover { background: rgba(255,255,255,.045); }

.mp-mcard__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .5rem;
  margin-bottom: .45rem;
}

.mp-mcard__top strong {
  display: block;
  font-size: .9rem;
  font-weight: 700;
  color: rgb(226 232 240);
}

.mp-mcard__top small {
  display: block;
  font-size: .7rem;
  color: rgb(71 85 105);
  font-family: monospace;
  margin-top: .05rem;
}

.mp-mcard__trend {
  font-size: .78rem;
  font-weight: 700;
  border-radius: 999px;
  background: rgba(255,255,255,.05);
  padding: .18rem .45rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.mp-mcard__trend.up   { color: rgb(110 231 183); }
.mp-mcard__trend.down { color: rgb(252 165 165); }
.mp-mcard__trend.flat { color: rgb(100 116 139); }

.mp-mcard__prices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .35rem;
}

.mp-mcard__price {
  border-radius: 8px;
  padding: .35rem .5rem;
}

.mp-mcard__price small {
  display: block;
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  margin-bottom: .1rem;
}

.mp-mcard__price strong {
  display: block;
  font-size: .85rem;
  font-weight: 800;
}

.mp-mcard__price.buy {
  background: rgba(34,197,94,.06);
  border: 1px solid rgba(34,197,94,.12);
}
.mp-mcard__price.buy small { color: rgb(134 239 172); }
.mp-mcard__price.buy strong { color: rgb(167 243 208); }

.mp-mcard__price.sell {
  background: rgba(244,63,94,.06);
  border: 1px solid rgba(244,63,94,.12);
}
.mp-mcard__price.sell small { color: rgb(253 164 175); }
.mp-mcard__price.sell strong { color: rgb(254 202 202); }

/* sidebar */
.mp-sidebar {
  display: grid;
  gap: .75rem;
  align-content: start;
}

.mp-side-card {
  padding: .85rem;
}

.mp-side-card .mp-section-title {
  margin-bottom: .6rem;
}

.mp-mover-list,
.mp-tx-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
}

.mp-mover-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  padding: .4rem 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
  font-size: .85rem;
}

.mp-mover-list li:last-child { border-bottom: none; }

.mp-mover-list li span { color: rgb(203 213 225); }
.mp-mover-list li strong { font-size: .8rem; font-weight: 700; }

.mp-tx-list li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .5rem;
  padding: .4rem 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
}

.mp-tx-list li:last-child { border-bottom: none; }

.mp-tx-left { min-width: 0; }

.mp-tx-left span {
  display: block;
  font-size: .83rem;
  color: rgb(203 213 225);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mp-tx-left small {
  display: block;
  font-size: .7rem;
  color: rgb(100 116 139);
  margin-top: .05rem;
}

.mp-tx-list li > strong {
  font-size: .82rem;
  font-weight: 700;
  color: rgb(226 232 240);
  white-space: nowrap;
  flex-shrink: 0;
}

/* nation listings */
.mp-listings-card {
  padding: 1rem;
}

.mp-listings-grid {
  display: grid;
  gap: .5rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  margin-top: .75rem;
}

.mp-lot {
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
  background: rgba(255,255,255,.025);
  padding: .7rem .85rem;
}

.mp-lot__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .5rem;
  margin-bottom: .5rem;
}

.mp-lot__top strong {
  display: block;
  font-size: .88rem;
  font-weight: 700;
  color: rgb(226 232 240);
}

.mp-lot__top small {
  display: block;
  font-size: .72rem;
  color: rgb(100 116 139);
  margin-top: .1rem;
}

.mp-lot__qty {
  font-size: .72rem;
  font-weight: 700;
  color: rgb(134 239 172);
  background: rgba(34,197,94,.08);
  border: 1px solid rgba(34,197,94,.14);
  border-radius: 999px;
  padding: .2rem .5rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.mp-lot__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .35rem;
}

.mp-lot__meta div { display: flex; flex-direction: column; gap: .1rem; }

.mp-lot__meta small {
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgb(100 116 139);
}

.mp-lot__meta strong {
  font-size: .83rem;
  font-weight: 700;
  color: rgb(203 213 225);
}

/* responsive */
@media (max-width: 640px) {
  .mp-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .mp-search__input {
    width: 160px;
  }
}

@media (max-width: 400px) {
  .mp-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
