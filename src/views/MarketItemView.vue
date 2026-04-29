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

          <div class="mt-3 flex items-center gap-5 text-xs text-slate-400">
            <span v-if="buyPath" class="flex items-center gap-1.5">
              <span class="legend-dot" style="background: rgb(52 211 153)"></span>Покупка
            </span>
            <span v-if="sellPath" class="flex items-center gap-1.5">
              <span class="legend-dot" style="background: rgb(251 113 133)"></span>Скупка
            </span>
            <span v-if="chartSource === 'transactions'" class="ml-auto opacity-50">
              на основе сделок
            </span>
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-slate-500">
          История накопится после первого пересчёта цен на сервере.
        </p>
      </div>

      <!-- Transactions + Listings -->
      <div v-if="!loading && !error" class="grid gap-4 xl:grid-cols-2">
        <!-- Transactions -->
        <section class="surface-card p-5">
          <div class="section-kicker !mb-2">Сделки</div>
          <h2 class="text-lg font-black text-slate-50">Последние транзакции</h2>
          <div v-if="transactions.length" class="mt-4 space-y-2">
            <div v-for="tx in transactions.slice(0, 24)" :key="tx.id" class="tx-row">
              <div class="flex items-center justify-between gap-2">
                <span class="tx-badge" :class="String(tx.transaction_type || '').toLowerCase().includes('buy') ? 'buy' : 'sell'">
                  {{ txTypeLabel(tx.transaction_type) }}
                </span>
                <strong class="text-slate-100">{{ money(tx.final_total_price) }}</strong>
              </div>
              <div class="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                <span>{{ tx.player_name }} · x{{ tx.amount }} · {{ money(tx.unit_price) }}/шт</span>
                <span>{{ new Date(tx.created_at).toLocaleDateString('ru-RU') }}</span>
              </div>
            </div>
          </div>
          <p v-else class="mt-4 text-sm text-slate-500">Нет транзакций по этому товару.</p>
        </section>

        <!-- Nation listings -->
        <section class="surface-card p-5">
          <div class="section-kicker !mb-2">Государственный рынок</div>
          <h2 class="text-lg font-black text-slate-50">Активные лоты</h2>
          <div v-if="listings.length" class="mt-4 space-y-2">
            <div v-for="lot in listings" :key="lot.id" class="listing-row">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-bold text-slate-100">[{{ lot.nation_tag }}] {{ lot.nation_title }}</p>
                  <p class="mt-0.5 text-xs text-slate-500">{{ lot.seller_player_name }}</p>
                </div>
                <div class="text-right shrink-0">
                  <strong class="text-emerald-300">{{ money(lot.current_unit_price) }}</strong>
                  <p class="mt-0.5 text-xs text-slate-500">{{ lot.remaining_amount }} / {{ lot.total_amount }} шт</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="mt-4 text-sm text-slate-500">Нет активных лотов по этому товару.</p>
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

.tx-row,
.listing-row {
  border: 1px solid rgba(255,255,255,.07);
  border-radius: .875rem;
  padding: .65rem .75rem;
  background: rgba(255,255,255,.025);
}

.tx-badge {
  border-radius: 999px;
  padding: .18rem .6rem;
  font-size: .68rem;
  font-weight: 900;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.tx-badge.buy  { background: rgba(34,197,94,.12); color: rgb(134 239 172); }
.tx-badge.sell { background: rgba(251,113,133,.12); color: rgb(253 164 175); }
</style>
