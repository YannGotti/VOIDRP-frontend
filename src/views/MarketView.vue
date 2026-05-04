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
const demandFilter = ref('all')

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
  if (demandFilter.value !== 'all') {
    result = result.filter((item) => item.demand_state === demandFilter.value)
  }
  const dir = filters.direction === 'desc' ? -1 : 1
  return [...result].sort((a, b) => {
    switch (filters.sort) {
      case 'buy':
        return dir * (Number(a.current_buy_price || 0) - Number(b.current_buy_price || 0))
      case 'sell':
        return dir * (Number(a.current_sell_price || 0) - Number(b.current_sell_price || 0))
      case 'trend':
        return dir * (Number(a.trend_percent || 0) - Number(b.trend_percent || 0))
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
  return null
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

function txTypeLabel(type) {
  const t = String(type || '').toLowerCase()
  if (t.includes('buy')) return 'Покупка'
  if (t.includes('sell')) return 'Продажа'
  return type
}

function txIsBuy(type) {
  return String(type || '').toLowerCase().includes('buy')
}

function formatTxTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d)) return '—'
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const isThisYear = d.getFullYear() === now.getFullYear()
  const hm = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return hm
  if (isThisYear) return `${d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} ${hm}`
  return `${d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${hm}`
}

function setSort(key) {
  if (filters.sort === key) {
    filters.direction = filters.direction === 'asc' ? 'desc' : 'asc'
  } else {
    filters.sort = key
    filters.direction = 'asc'
  }
}

function sortIcon(key) {
  if (filters.sort !== key) return ''
  return filters.direction === 'asc' ? ' ↑' : ' ↓'
}

async function loadMarket() {
  loading.value = true
  error.value = ''
  try {
    const [summaryPayload, itemPayload, listingPayload, transactionPayload] = await Promise.all([
      getMarketSummary(),
      getMarketItems({ limit: 500 }),
      getNationMarketListings({ limit: 100 }),
      getMarketTransactions({ limit: 20 }),
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

      <!-- header -->
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
          <!-- table toolbar -->
          <div class="mp-toolbar">
            <div class="mp-demand-tabs">
              <button :class="{ active: demandFilter === 'all' }" @click="demandFilter = 'all'">Все</button>
              <button :class="{ active: demandFilter === 'high_demand' }" @click="demandFilter = 'high_demand'">
                <span class="dot demand"></span>Спрос
              </button>
              <button :class="{ active: demandFilter === 'oversupply' }" @click="demandFilter = 'oversupply'">
                <span class="dot supply"></span>Избыток
              </button>
            </div>
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
                    <th class="sortable" @click="setSort('material')">Предмет<span class="sort-arrow">{{ sortIcon('material') }}</span></th>
                    <th class="num sortable" @click="setSort('buy')">Покупка<span class="sort-arrow">{{ sortIcon('buy') }}</span></th>
                    <th class="num sortable" @click="setSort('sell')">Скупка<span class="sort-arrow">{{ sortIcon('sell') }}</span></th>
                    <th class="num sortable" @click="setSort('trend')">Изм.<span class="sort-arrow">{{ sortIcon('trend') }}</span></th>
                    <th class="sortable" @click="setSort('demand')">Статус<span class="sort-arrow">{{ sortIcon('demand') }}</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredItems" :key="item.material" class="mp-row" @click="openItem(item)">
                    <td>
                      <span class="mp-name">{{ materialLabel(item) }}</span>
                      <span class="mp-material-id">{{ item.material }}</span>
                    </td>
                    <td class="num mp-price-buy">{{ money(item.current_buy_price) }}</td>
                    <td class="num mp-price-sell">{{ money(item.current_sell_price) }}</td>
                    <td class="num" :class="['trend', trendClass(item.trend_percent)]">{{ trendSign(item.trend_percent) }}</td>
                    <td>
                      <span v-if="stateLabel(item.demand_state)" class="mp-state-badge" :class="item.demand_state">
                        {{ stateLabel(item.demand_state) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- mobile cards -->
            <div class="mp-mobile">
              <div v-for="item in filteredItems" :key="item.material" class="mp-mcard" @click="openItem(item)">
                <div class="mp-mcard__top">
                  <div class="mp-mcard__left">
                    <strong>{{ materialLabel(item) }}</strong>
                    <small>{{ item.material }}</small>
                  </div>
                  <div class="mp-mcard__right">
                    <span :class="['mp-mcard__trend', trendClass(item.trend_percent)]">{{ trendSign(item.trend_percent) }}</span>
                    <span v-if="stateLabel(item.demand_state)" class="mp-state-badge" :class="item.demand_state">
                      {{ stateLabel(item.demand_state) }}
                    </span>
                  </div>
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
              <li v-for="item in topMovers" :key="item.material" class="mp-mover-item" @click="openItem(item)">
                <span class="mp-mover-name">{{ materialLabel(item) }}</span>
                <strong :class="['trend', trendClass(item.trend_percent)]">{{ trendSign(item.trend_percent) }}</strong>
              </li>
            </ul>
          </div>

          <!-- recent transactions -->
          <div class="surface-card mp-side-card">
            <h3 class="mp-section-title">Последние сделки</h3>
            <div v-if="loading" class="mp-skeletons mt-2">
              <div v-for="i in 5" :key="i" class="skeleton" style="height:44px;border-radius:6px"></div>
            </div>
            <ul v-else class="mp-tx-list">
              <li v-for="tx in transactions" :key="tx.id" class="mp-tx-item">
                <div class="mp-tx-row1">
                  <span :class="['mp-tx-badge', txIsBuy(tx.transaction_type) ? 'buy' : 'sell']">
                    {{ txTypeLabel(tx.transaction_type) }}
                  </span>
                  <span class="mp-tx-material">
                    {{ getRussianMaterialName(tx.material) || tx.material }}
                  </span>
                  <strong class="mp-tx-price">{{ money(tx.final_total_price) }}</strong>
                </div>
                <div class="mp-tx-row2">
                  <span>{{ tx.player_name }} · ×{{ tx.amount }}</span>
                  <span class="mp-tx-time">{{ formatTxTime(tx.created_at) }}</span>
                </div>
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

.mp-search__input::placeholder { color: rgb(100 116 139); }

.mp-search__count {
  position: absolute;
  right: .55rem;
  font-size: .72rem;
  font-weight: 700;
  color: rgb(139 92 246);
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
  padding: .75rem .75rem .75rem;
}

/* toolbar (demand tabs + count) */
.mp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  margin-bottom: .65rem;
  flex-wrap: wrap;
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
  white-space: nowrap;
}

/* demand filter tabs */
.mp-demand-tabs {
  display: flex;
  gap: .2rem;
  padding: .18rem;
  border-radius: 9px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
}

.mp-demand-tabs button {
  display: flex;
  align-items: center;
  gap: .35rem;
  border: none;
  background: transparent;
  color: rgb(100 116 139);
  font-size: .72rem;
  font-weight: 700;
  padding: .26rem .6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background .12s, color .12s;
  white-space: nowrap;
}

.mp-demand-tabs button:hover { color: rgb(203 213 225); }

.mp-demand-tabs button.active {
  background: rgba(139,92,246,.15);
  color: rgb(196 181 253);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.demand { background: rgb(110 231 183); }
.dot.supply { background: rgb(252 165 165); }

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
  min-width: 560px;
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
  user-select: none;
}

.mp-tbl th.sortable {
  cursor: pointer;
  transition: color .12s;
}

.mp-tbl th.sortable:hover { color: rgb(203 213 225); }

.sort-arrow {
  font-size: .7rem;
  letter-spacing: 0;
  color: rgb(139 92 246);
  text-transform: none;
}

.mp-tbl td {
  border-bottom: 1px solid rgba(255,255,255,.05);
  padding: .5rem .75rem;
  font-size: .875rem;
  color: rgb(203 213 225);
}

.mp-tbl th.num,
.mp-tbl td.num { text-align: right; }

.mp-row {
  cursor: pointer;
  transition: background .1s;
}

.mp-row:last-child td { border-bottom: none; }

.mp-row:hover td { background: rgba(255,255,255,.03); }

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

.mp-price-buy { color: rgb(167 243 208) !important; }
.mp-price-sell { color: rgb(254 202 202) !important; }

/* state badge in table */
.mp-state-badge {
  display: inline-block;
  border-radius: 999px;
  padding: .15rem .5rem;
  font-size: .65rem;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  white-space: nowrap;
}

.mp-state-badge.high_demand { background: rgba(34,197,94,.1); color: rgb(110 231 183); }
.mp-state-badge.oversupply  { background: rgba(252,165,165,.1); color: rgb(252 165 165); }

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


.mp-mcard__left {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.mp-mcard__left strong {
  display: block;
  font-size: .9rem;
  font-weight: 700;
  color: rgb(226 232 240);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mp-mcard__left small {
  display: block;
  font-size: .7rem;
  color: rgb(71 85 105);
  font-family: monospace;
  margin-top: .05rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mp-mcard__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .25rem;
  min-width: 0;
  max-width: 52%;
}

.mp-mcard__right .mp-state-badge {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: .06em;
  font-size: .6rem;
}

.mp-mcard__trend {
  font-size: .78rem;
  font-weight: 700;
  border-radius: 999px;
  background: rgba(255,255,255,.05);
  padding: .18rem .45rem;
  white-space: nowrap;
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
.mp-mcard__price.buy small  { color: rgb(134 239 172); }
.mp-mcard__price.buy strong { color: rgb(167 243 208); }

.mp-mcard__price.sell {
  background: rgba(244,63,94,.06);
  border: 1px solid rgba(244,63,94,.12);
}
.mp-mcard__price.sell small  { color: rgb(253 164 175); }
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

/* top movers */
.mp-mover-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
}

.mp-mover-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  padding: .4rem .35rem;
  border-bottom: 1px solid rgba(255,255,255,.05);
  font-size: .85rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background .1s;
}

.mp-mover-item:last-child { border-bottom: none; }
.mp-mover-item:hover { background: rgba(255,255,255,.04); }

.mp-mover-name {
  color: rgb(203 213 225);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mp-mover-item strong { font-size: .8rem; font-weight: 700; flex-shrink: 0; }

/* sidebar transactions */
.mp-tx-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
}

.mp-tx-item {
  padding: .42rem .25rem;
  border-bottom: 1px solid rgba(255,255,255,.05);
}

.mp-tx-item:last-child { border-bottom: none; }

.mp-tx-row1 {
  display: flex;
  align-items: center;
  gap: .4rem;
  min-width: 0;
}

.mp-tx-badge {
  display: inline-block;
  flex-shrink: 0;
  border-radius: 999px;
  padding: .1rem .45rem;
  font-size: .62rem;
  font-weight: 900;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.mp-tx-badge.buy  { background: rgba(34,197,94,.12);  color: rgb(110 231 183); }
.mp-tx-badge.sell { background: rgba(252,165,165,.1); color: rgb(252 165 165); }

.mp-tx-material {
  font-size: .82rem;
  font-weight: 600;
  color: rgb(203 213 225);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}

.mp-tx-price {
  font-size: .82rem;
  font-weight: 700;
  color: rgb(226 232 240);
  white-space: nowrap;
  flex-shrink: 0;
}

.mp-tx-row2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  margin-top: .18rem;
  font-size: .69rem;
  color: rgb(71 85 105);
}

.mp-tx-time {
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
  .mp-stats { grid-template-columns: repeat(2, 1fr); }
  .mp-search__input { width: 160px; }
}

@media (max-width: 400px) {
  .mp-header { flex-direction: column; align-items: flex-start; }
  .mp-controls { width: 100%; }
  .mp-search { width: 100%; }
  .mp-search__input { width: 100%; }
}
</style>
