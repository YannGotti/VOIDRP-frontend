<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getMarketItem, getMarketItemHistory, getMarketTransactions, getNationMarketListings } from '../services/marketApi'
import { getMaterialName, getRussianMaterialName } from '../utils/materialNames'

const route = useRoute()

const material = computed(() => String(route.params.material || '').toUpperCase())

const loading = ref(true)
const error = ref('')
const item = ref(null)
const transactions = ref([])
const listings = ref([])
const history = ref([])
const historyDays = ref(30)
const txFilter = ref('all')

const filteredTransactions = computed(() => {
  if (txFilter.value === 'buy') return transactions.value.filter(tx => String(tx.transaction_type || '').toLowerCase().includes('buy'))
  if (txFilter.value === 'sell') return transactions.value.filter(tx => !String(tx.transaction_type || '').toLowerCase().includes('buy'))
  return transactions.value
})

// SVG chart constants
const CW = 700
const CH = 220
const PAD = { top: 16, right: 20, bottom: 36, left: 64 }
const PLOT_W = CW - PAD.left - PAD.right
const PLOT_H = CH - PAD.top - PAD.bottom

function money(value) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '0.00'
  return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function itemName(itm) {
  if (!itm) return getMaterialName(material.value)
  return getRussianMaterialName(itm.material) || itm.display_name || getMaterialName(itm.material)
}

function stateLabel(v) {
  if (v === 'high_demand') return 'Высокий спрос'
  if (v === 'oversupply') return 'Перепроизводство'
  return 'Стабильно'
}

function trendClass(v) {
  const n = Number(v || 0)
  if (n > 0) return 'text-emerald-300'
  if (n < 0) return 'text-rose-300'
  return 'text-slate-400'
}

function txTypeLabel(type) {
  const t = String(type || '').toLowerCase()
  if (t.includes('buy')) return 'Покупка'
  if (t.includes('sell')) return 'Продажа'
  return type
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

// ─── chart ────────────────────────────────────────────────────────────────────

function groupByDay(points) {
  const byDate = {}
  for (const p of points) {
    const date = String(p.recorded_at || p.date || '').slice(0, 10)
    if (!date || date.length < 10) continue
    if (!byDate[date]) byDate[date] = { buys: [], sells: [] }
    if (p.buy_price != null) byDate[date].buys.push(Number(p.buy_price))
    if (p.sell_price != null) byDate[date].sells.push(Number(p.sell_price))
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date,
      avgBuy: d.buys.length ? d.buys.reduce((a, b) => a + b, 0) / d.buys.length : null,
      avgSell: d.sells.length ? d.sells.reduce((a, b) => a + b, 0) / d.sells.length : null,
    }))
}

const chartData = computed(() => {
  // Primary: use historical snapshots
  if (history.value.length >= 2) {
    const points = groupByDay(history.value)
    const allPrices = points.flatMap((p) => [p.avgBuy, p.avgSell].filter((v) => v !== null))
    if (!allPrices.length) return null
    const rawMin = Math.min(...allPrices)
    const rawMax = Math.max(...allPrices)
    const pad = (rawMax - rawMin) * 0.08 || rawMax * 0.05 || 1
    return { points, minVal: Math.max(0, rawMin - pad), maxVal: rawMax + pad, source: 'history' }
  }

  // Fallback: derive from transaction history
  if (!transactions.value.length) return null
  const byDate = {}
  for (const tx of transactions.value) {
    const date = String(tx.created_at || '').slice(0, 10)
    if (!date || date.length < 10) continue
    if (!byDate[date]) byDate[date] = { buys: [], sells: [] }
    const t = String(tx.transaction_type || '').toLowerCase()
    const price = Number(tx.unit_price ?? 0)
    if (!Number.isFinite(price) || price <= 0) continue
    if (t.includes('buy')) byDate[date].buys.push(price)
    else byDate[date].sells.push(price)
  }
  const dates = Object.keys(byDate).sort()
  if (!dates.length) return null
  const points = dates.map((date) => {
    const d = byDate[date]
    const avgBuy = d.buys.length ? d.buys.reduce((a, b) => a + b, 0) / d.buys.length : null
    const avgSell = d.sells.length ? d.sells.reduce((a, b) => a + b, 0) / d.sells.length : null
    return { date, avgBuy, avgSell }
  })
  const allPrices = points.flatMap((p) => [p.avgBuy, p.avgSell].filter((v) => v !== null))
  if (!allPrices.length) return null
  const rawMin = Math.min(...allPrices)
  const rawMax = Math.max(...allPrices)
  const pad = (rawMax - rawMin) * 0.08 || rawMax * 0.05 || 1
  return { points, minVal: Math.max(0, rawMin - pad), maxVal: rawMax + pad, source: 'transactions' }
})

function cx(i, total) {
  if (total <= 1) return PAD.left + PLOT_W / 2
  return PAD.left + (i / (total - 1)) * PLOT_W
}

function cy(v, minVal, maxVal) {
  const range = maxVal - minVal || 1
  return PAD.top + (1 - (v - minVal) / range) * PLOT_H
}

const buyPath = computed(() => {
  if (!chartData.value) return ''
  const { points, minVal, maxVal } = chartData.value
  const pts = points.map((p, i) => ({ ...p, i })).filter((p) => p.avgBuy !== null)
  if (pts.length < 2) return ''
  return pts.map((p, j) => `${j === 0 ? 'M' : 'L'}${cx(p.i, points.length).toFixed(1)},${cy(p.avgBuy, minVal, maxVal).toFixed(1)}`).join(' ')
})

const sellPath = computed(() => {
  if (!chartData.value) return ''
  const { points, minVal, maxVal } = chartData.value
  const pts = points.map((p, i) => ({ ...p, i })).filter((p) => p.avgSell !== null)
  if (pts.length < 2) return ''
  return pts.map((p, j) => `${j === 0 ? 'M' : 'L'}${cx(p.i, points.length).toFixed(1)},${cy(p.avgSell, minVal, maxVal).toFixed(1)}`).join(' ')
})

const yLabels = computed(() => {
  if (!chartData.value) return []
  const { minVal, maxVal } = chartData.value
  return [0, 1, 2, 3, 4].map((i) => {
    const v = minVal + (i / 4) * (maxVal - minVal)
    return { v, y: cy(v, minVal, maxVal) }
  })
})

const xLabels = computed(() => {
  if (!chartData.value) return []
  const { points } = chartData.value
  const total = points.length
  if (!total) return []
  const maxLbls = 7
  const step = Math.max(1, Math.ceil(total / maxLbls))
  const result = []
  for (let i = 0; i < total; i += step) {
    result.push({ x: cx(i, total), label: points[i].date.slice(5) })
  }
  const last = total - 1
  if (last > 0 && last % step !== 0) {
    result.push({ x: cx(last, total), label: points[last].date.slice(5) })
  }
  return result
})

const hasChart = computed(() => Boolean(buyPath.value || sellPath.value))
const chartSource = computed(() => chartData.value?.source ?? null)

// ─── data load ────────────────────────────────────────────────────────────────

async function load() {
  if (!material.value) return
  loading.value = true
  error.value = ''
  item.value = null
  transactions.value = []
  listings.value = []
  history.value = []

  try {
    const [itemData, txData, listingData, historyData] = await Promise.all([
      getMarketItem(material.value),
      getMarketTransactions({ material: material.value, limit: 200 }),
      getNationMarketListings({ material: material.value, limit: 50 }),
      getMarketItemHistory(material.value, historyDays.value).catch(() => null),
    ])
    item.value = itemData
    transactions.value = txData?.items || []
    listings.value = listingData?.items || []
    history.value = historyData?.points || []
    document.title = `${itemName(itemData)} — VoidRP`
  } catch (err) {
    error.value = err?.status === 404 ? 'Товар не найден.' : (err?.message || 'Не удалось загрузить данные о товаре.')
  } finally {
    loading.value = false
  }
}

async function loadHistory() {
  if (!material.value) return
  try {
    const data = await getMarketItemHistory(material.value, historyDays.value)
    history.value = data?.points || []
  } catch {
    history.value = []
  }
}

function setHistoryDays(days) {
  historyDays.value = days
  void loadHistory()
}

onMounted(load)
watch(material, load)
</script>

<template>
  <section class="item-page py-4 md:py-6">
    <div class="container-shell max-w-[1100px] space-y-5">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-slate-400">
        <router-link to="/market" class="hover:text-slate-200 transition-colors">← Рынок</router-link>
        <span>/</span>
        <span class="text-slate-200 font-semibold">{{ itemName(item) }}</span>
      </nav>

      <!-- Loading skeleton -->
      <div v-if="loading" class="surface-card p-5 md:p-6 space-y-4">
        <div class="skeleton h-9 w-72 rounded-xl"></div>
        <div class="skeleton h-4 w-36 rounded-lg"></div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mt-2">
          <div v-for="i in 6" :key="i" class="skeleton h-16 rounded-xl"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <!-- Header card -->
      <div v-if="!loading && item" class="surface-card p-5 md:p-6">
        <div class="flex flex-wrap items-start gap-3">
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">{{ itemName(item) }}</h1>
            <p class="mt-1 font-mono text-sm text-slate-500">{{ item.material }}</p>
          </div>
          <span class="state-badge" :class="item.demand_state">{{ stateLabel(item.demand_state) }}</span>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div class="stat-cell">
            <span>Покупка</span>
            <strong class="text-emerald-300">{{ money(item.current_buy_price) }}</strong>
          </div>
          <div class="stat-cell">
            <span>Скупка</span>
            <strong class="text-rose-300">{{ money(item.current_sell_price) }}</strong>
          </div>
          <div class="stat-cell">
            <span>База (покупка)</span>
            <strong>{{ money(item.base_buy_price) }}</strong>
          </div>
          <div class="stat-cell">
            <span>База (скупка)</span>
            <strong>{{ money(item.base_sell_price) }}</strong>
          </div>
          <div class="stat-cell">
            <span>Тренд</span>
            <strong :class="trendClass(item.trend_percent)">
              {{ Number(item.trend_percent || 0) > 0 ? '+' : '' }}{{ money(item.trend_percent) }}%
            </strong>
          </div>
          <div class="stat-cell">
            <span>Спред</span>
            <strong>{{ money(item.spread_percent) }}%</strong>
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div v-if="!loading && !error" class="surface-card p-5 md:p-6">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div class="section-kicker !mb-2">История цен</div>
            <h2 class="text-lg font-black text-slate-50">Динамика по дням</h2>
          </div>
          <div v-if="chartSource === 'history'" class="flex items-center gap-1.5">
            <button
              v-for="d in [7, 30, 90]"
              :key="d"
              class="days-btn"
              :class="{ active: historyDays === d }"
              @click="setHistoryDays(d)"
            >{{ d }}д</button>
          </div>
        </div>

        <div v-if="hasChart" class="mt-4">
          <div class="chart-wrap">
            <svg :viewBox="`0 0 ${CW} ${CH}`" class="chart-svg">
              <!-- Horizontal grid lines + y labels -->
              <g v-for="lbl in yLabels" :key="lbl.v">
                <line
                  :x1="PAD.left" :y1="lbl.y.toFixed(1)"
                  :x2="CW - PAD.right" :y2="lbl.y.toFixed(1)"
                  stroke="rgba(255,255,255,0.07)" stroke-width="1"
                />
                <text :x="PAD.left - 6" :y="(lbl.y + 4).toFixed(1)" text-anchor="end" class="chart-lbl">
                  {{ money(lbl.v) }}
                </text>
              </g>

              <!-- X labels -->
              <text
                v-for="lbl in xLabels" :key="lbl.label"
                :x="lbl.x.toFixed(1)" :y="CH - 8"
                text-anchor="middle" class="chart-lbl"
              >{{ lbl.label }}</text>

              <!-- Buy line -->
              <path v-if="buyPath" :d="buyPath" fill="none" stroke="rgb(52 211 153)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
              <!-- Sell line -->
              <path v-if="sellPath" :d="sellPath" fill="none" stroke="rgb(251 113 133)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
            <span v-if="buyPath" class="flex items-center gap-1.5">
              <span class="legend-dot" style="background: rgb(52 211 153)"></span>Покупка
            </span>
            <span v-if="sellPath" class="flex items-center gap-1.5">
              <span class="legend-dot" style="background: rgb(251 113 133)"></span>Скупка
            </span>
            <span v-if="chartData" class="chart-range-hint">
              {{ money(chartData.minVal) }} — {{ money(chartData.maxVal) }}
            </span>
            <span v-if="item?.updated_at" class="ml-auto text-slate-600">
              обновлено {{ formatTxTime(item.updated_at) }}
            </span>
            <span v-else-if="chartSource === 'transactions'" class="ml-auto opacity-40">
              на основе сделок
            </span>
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-slate-500">
          История накопится после первого пересчёта цен на сервере.
        </p>
      </div>

      <!-- Transactions + Listings -->
      <div v-if="!loading && !error" class="grid gap-4 xl:grid-cols-[1fr_320px]">
        <!-- Transactions -->
        <section class="surface-card p-5">
          <div class="tx-header">
            <div>
              <div class="section-kicker !mb-1">Сделки</div>
              <h2 class="text-lg font-black text-slate-50">
                Транзакции
                <span class="tx-count-badge">{{ filteredTransactions.length }}</span>
              </h2>
            </div>
            <div class="tx-filter-tabs">
              <button :class="{ active: txFilter === 'all' }" @click="txFilter = 'all'">Все</button>
              <button :class="{ active: txFilter === 'buy' }" @click="txFilter = 'buy'">Покупки</button>
              <button :class="{ active: txFilter === 'sell' }" @click="txFilter = 'sell'">Продажи</button>
            </div>
          </div>

          <div v-if="filteredTransactions.length" class="tx-table-wrap mt-3">
            <table class="tx-table">
              <thead>
                <tr>
                  <th>Тип</th>
                  <th>Игрок</th>
                  <th class="num">Кол-во</th>
                  <th class="num">Цена/шт</th>
                  <th class="num">Итого</th>
                  <th class="num">Время</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in filteredTransactions.slice(0, 50)" :key="tx.id">
                  <td>
                    <span class="tx-badge" :class="String(tx.transaction_type || '').toLowerCase().includes('buy') ? 'buy' : 'sell'">
                      {{ txTypeLabel(tx.transaction_type) }}
                    </span>
                  </td>
                  <td class="tx-player">{{ tx.player_name }}</td>
                  <td class="num tx-muted">×{{ tx.amount }}</td>
                  <td class="num tx-muted">{{ money(tx.unit_price) }}</td>
                  <td class="num tx-total">{{ money(tx.final_total_price) }}</td>
                  <td class="num tx-time">{{ formatTxTime(tx.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="mt-4 text-sm text-slate-500">Нет транзакций по этому товару.</p>
        </section>

        <!-- Nation listings -->
        <section class="surface-card p-5">
          <div class="section-kicker !mb-1">Государственный рынок</div>
          <h2 class="text-lg font-black text-slate-50 mb-3">Активные лоты</h2>
          <div v-if="listings.length" class="space-y-2">
            <div v-for="lot in listings" :key="lot.id" class="listing-row">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-bold text-slate-100 truncate">[{{ lot.nation_tag }}] {{ lot.nation_title }}</p>
                  <p class="mt-0.5 text-xs text-slate-500">{{ lot.seller_player_name }}</p>
                </div>
                <div class="text-right shrink-0">
                  <strong class="text-emerald-300 text-base">{{ money(lot.current_unit_price) }}</strong>
                  <p class="mt-0.5 text-xs text-slate-500">{{ lot.remaining_amount }} / {{ lot.total_amount }} шт</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500">Нет активных лотов по этому товару.</p>
        </section>
      </div>

    </div>
  </section>
</template>

<style scoped>
.item-page::before {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: -1;
  content: '';
  background:
    radial-gradient(circle at 14% 10%, rgba(34, 197, 94, 0.07), transparent 26%),
    radial-gradient(circle at 86% 18%, rgba(109, 93, 246, 0.1), transparent 28%);
}

.stat-cell {
  display: flex;
  flex-direction: column;
  gap: .3rem;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 1rem;
  padding: .7rem .85rem;
  background: rgba(255,255,255,.03);
}

.stat-cell span {
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(100 116 139);
}

.stat-cell strong {
  font-size: 1rem;
  font-weight: 900;
  color: rgb(226 232 240);
  word-break: break-all;
}

@media (max-width: 640px) {
  .stat-cell {
    padding: .5rem .6rem;
  }
  .stat-cell strong {
    font-size: 0.875rem;
  }
}

.state-badge {
  border-radius: 999px;
  padding: .35rem .9rem;
  font-size: .7rem;
  font-weight: 900;
  letter-spacing: .14em;
  text-transform: uppercase;
  white-space: nowrap;
}

.state-badge.high_demand { background: rgba(34,197,94,.12); color: rgb(134 239 172); }
.state-badge.oversupply  { background: rgba(251,113,133,.12); color: rgb(253 164 175); }
.state-badge.stable      { background: rgba(148,163,184,.09); color: rgb(148 163 184); }

.chart-wrap { overflow-x: auto; }

.chart-svg {
  display: block;
  width: 100%;
  height: auto;
  min-width: 340px;
}

.chart-lbl {
  fill: rgb(100 116 139);
  font-size: 11px;
}

.legend-dot {
  display: inline-block;
  width: 22px;
  height: 3px;
  border-radius: 99px;
}

.days-btn {
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 999px;
  background: transparent;
  color: rgb(100 116 139);
  font-size: .7rem;
  font-weight: 900;
  letter-spacing: .1em;
  padding: .25rem .65rem;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.days-btn:hover {
  border-color: rgba(255,255,255,.22);
  color: rgb(203 213 225);
}

.days-btn.active {
  border-color: rgba(52, 211, 153, .5);
  background: rgba(52, 211, 153, .1);
  color: rgb(134 239 172);
}

/* transactions */
.tx-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: .75rem;
}

.tx-count-badge {
  display: inline-flex;
  align-items: center;
  margin-left: .4rem;
  padding: .08rem .45rem;
  border-radius: 999px;
  background: rgba(148,163,184,.1);
  font-size: .65rem;
  font-weight: 800;
  letter-spacing: .08em;
  color: rgb(100 116 139);
  vertical-align: middle;
}

.tx-filter-tabs {
  display: flex;
  gap: .25rem;
  padding: .2rem;
  border-radius: 10px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
}

.tx-filter-tabs button {
  border: none;
  background: transparent;
  color: rgb(100 116 139);
  font-size: .72rem;
  font-weight: 700;
  padding: .28rem .65rem;
  border-radius: 7px;
  cursor: pointer;
  transition: background .12s, color .12s;
  white-space: nowrap;
}

.tx-filter-tabs button:hover { color: rgb(203 213 225); }

.tx-filter-tabs button.active {
  background: rgba(139,92,246,.15);
  color: rgb(196 181 253);
}

.tx-table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
}

.tx-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
}

.tx-table th {
  background: rgba(255,255,255,.03);
  border-bottom: 1px solid rgba(255,255,255,.07);
  padding: .4rem .7rem;
  text-align: left;
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  white-space: nowrap;
}

.tx-table th.num,
.tx-table td.num { text-align: right; }

.tx-table td {
  border-bottom: 1px solid rgba(255,255,255,.04);
  padding: .45rem .7rem;
  font-size: .82rem;
  color: rgb(148 163 184);
}

.tx-table tbody tr:last-child td { border-bottom: none; }

.tx-table tbody tr:hover td { background: rgba(255,255,255,.025); }

.tx-player { color: rgb(203 213 225) !important; font-weight: 600; }
.tx-total  { color: rgb(226 232 240) !important; font-weight: 700; }
.tx-muted  { color: rgb(71 85 105) !important; }
.tx-time   { color: rgb(71 85 105) !important; font-size: .75rem !important; white-space: nowrap; }

.tx-badge {
  display: inline-block;
  border-radius: 999px;
  padding: .16rem .55rem;
  font-size: .65rem;
  font-weight: 900;
  letter-spacing: .1em;
  text-transform: uppercase;
  white-space: nowrap;
}

.tx-badge.buy  { background: rgba(34,197,94,.12); color: rgb(134 239 172); }
.tx-badge.sell { background: rgba(251,113,133,.12); color: rgb(253 164 175); }

/* listings */
.listing-row {
  border: 1px solid rgba(255,255,255,.07);
  border-radius: .875rem;
  padding: .65rem .75rem;
  background: rgba(255,255,255,.025);
}

/* chart range hint */
.chart-range-hint {
  font-family: monospace;
  font-size: .72rem;
  color: rgb(71 85 105);
  padding: .1rem .45rem;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 6px;
}
</style>
