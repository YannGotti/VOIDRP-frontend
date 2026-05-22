<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getMarketItem, getMarketItemHistory, getMarketTransactions, getNationMarketListings } from '../services/marketApi'
import { getMaterialName, getRussianMaterialName } from '../utils/materialNames'

const { t } = useI18n()
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
  if (v === 'high_demand') return t('marketItem.stateHigh')
  if (v === 'oversupply') return t('marketItem.stateOver')
  return t('marketItem.stateStable')
}

function trendSign(v) {
  return Number(v || 0) > 0 ? '+' : ''
}

function trendClass(v) {
  const n = Number(v || 0)
  if (n > 0) return 'text-emerald-300'
  if (n < 0) return 'text-rose-300'
  return 'text-slate-400'
}

function txTypeLabel(type) {
  const tl = String(type || '').toLowerCase()
  if (tl.includes('buy')) return t('marketItem.filterBuy') || 'Buy'
  if (tl.includes('sell')) return t('marketItem.filterSell') || 'Sell'
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
  if (history.value.length >= 2) {
    const points = groupByDay(history.value)
    const allPrices = points.flatMap((p) => [p.avgBuy, p.avgSell].filter((v) => v !== null))
    if (!allPrices.length) return null
    const rawMin = Math.min(...allPrices)
    const rawMax = Math.max(...allPrices)
    const pad = (rawMax - rawMin) * 0.08 || rawMax * 0.05 || 1
    return { points, minVal: Math.max(0, rawMin - pad), maxVal: rawMax + pad, source: 'history' }
  }
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

const buyFillPath = computed(() => {
  if (!chartData.value || !buyPath.value) return ''
  const { points, minVal, maxVal } = chartData.value
  const pts = points.map((p, i) => ({ ...p, i })).filter((p) => p.avgBuy !== null)
  if (pts.length < 2) return ''
  const firstX = cx(pts[0].i, points.length).toFixed(1)
  const lastX = cx(pts[pts.length - 1].i, points.length).toFixed(1)
  const bottom = (PAD.top + PLOT_H).toFixed(1)
  return `${buyPath.value} L${lastX},${bottom} L${firstX},${bottom} Z`
})

const sellFillPath = computed(() => {
  if (!chartData.value || !sellPath.value) return ''
  const { points, minVal, maxVal } = chartData.value
  const pts = points.map((p, i) => ({ ...p, i })).filter((p) => p.avgSell !== null)
  if (pts.length < 2) return ''
  const firstX = cx(pts[0].i, points.length).toFixed(1)
  const lastX = cx(pts[pts.length - 1].i, points.length).toFixed(1)
  const bottom = (PAD.top + PLOT_H).toFixed(1)
  return `${sellPath.value} L${lastX},${bottom} L${firstX},${bottom} Z`
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

// % change for the selected period (first point → last point in history)
const periodChange = computed(() => {
  if (!chartData.value || chartData.value.source !== 'history') return null
  const { points } = chartData.value
  if (points.length < 2) return null
  const firstBuyPt  = points.find(p => p.avgBuy  !== null)
  const lastBuyPt   = [...points].reverse().find(p => p.avgBuy  !== null)
  const firstSellPt = points.find(p => p.avgSell !== null)
  const lastSellPt  = [...points].reverse().find(p => p.avgSell !== null)
  const buyPct  = firstBuyPt  && firstBuyPt.avgBuy  > 0 && lastBuyPt  && firstBuyPt !== lastBuyPt
    ? ((lastBuyPt.avgBuy  - firstBuyPt.avgBuy)  / firstBuyPt.avgBuy  * 100) : null
  const sellPct = firstSellPt && firstSellPt.avgSell > 0 && lastSellPt && firstSellPt !== lastSellPt
    ? ((lastSellPt.avgSell - firstSellPt.avgSell) / firstSellPt.avgSell * 100) : null
  return { buyPct, sellPct }
})

function pctFormat(v) {
  if (v === null || !Number.isFinite(v)) return null
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
}
function pctClass(v) {
  if (v === null) return 'pct-neutral'
  if (v > 0)  return 'pct-up'
  if (v < 0)  return 'pct-down'
  return 'pct-neutral'
}

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
    error.value = err?.status === 404 ? t('marketItem.noData') : (err?.message || t('marketItem.loadError'))
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
  <section class="item-page auth-page py-6 md:py-10">

    <!-- ambient orbs -->
    <div class="item-orb item-orb--green" aria-hidden="true"></div>
    <div class="item-orb item-orb--violet" aria-hidden="true"></div>

    <div class="container-shell max-w-[1100px] space-y-5 page-entry">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-slate-500">
        <router-link to="/market" class="hover:text-slate-200 transition-colors flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          {{ t('marketItem.backToMarket') }}
        </router-link>
        <span class="text-slate-700">/</span>
        <span class="text-slate-300 font-semibold">{{ itemName(item) }}</span>
      </nav>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-4">
        <div class="skeleton h-44 rounded-[24px]"></div>
        <div class="skeleton h-60 rounded-[24px]"></div>
        <div class="skeleton h-72 rounded-[24px]"></div>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <!-- ── HERO HEADER ── -->
      <div v-if="!loading && item" class="item-hero" :class="item.demand_state">
        <div class="item-hero__glow" aria-hidden="true"></div>

        <div class="item-hero__top">
          <!-- icon placeholder / material code -->
          <div class="item-hero__icon-wrap">
            <span class="item-hero__icon-letter">{{ (itemName(item) || '?')[0].toUpperCase() }}</span>
          </div>

          <div class="item-hero__meta">
            <div class="item-hero__kicker">{{ item.material }}</div>
            <h1 class="item-hero__title">{{ itemName(item) }}</h1>
          </div>

          <span class="state-badge ml-auto" :class="item.demand_state">{{ stateLabel(item.demand_state) }}</span>
        </div>

        <!-- stats row -->
        <div class="item-hero__stats">
          <div class="stat-pill buy">
            <span class="stat-pill__label">{{ t('marketItem.stateBuy') }}</span>
            <strong class="stat-pill__value text-emerald-300">{{ money(item.current_buy_price) }} ₽</strong>
          </div>
          <div class="stat-pill sell">
            <span class="stat-pill__label">{{ t('marketItem.stateSell') }}</span>
            <strong class="stat-pill__value text-rose-300">{{ money(item.current_sell_price) }} ₽</strong>
          </div>
          <div class="stat-pill">
            <span class="stat-pill__label">Base ({{ t('marketItem.stateBuy') }})</span>
            <strong class="stat-pill__value">{{ money(item.base_buy_price) }} ₽</strong>
          </div>
          <div class="stat-pill">
            <span class="stat-pill__label">Base ({{ t('marketItem.stateSell') }})</span>
            <strong class="stat-pill__value">{{ money(item.base_sell_price) }} ₽</strong>
          </div>
          <div class="stat-pill">
            <span class="stat-pill__label">{{ t('marketItem.stateTrend') }}</span>
            <strong class="stat-pill__value" :class="trendClass(item.trend_percent)">
              {{ trendSign(item.trend_percent) }}{{ money(item.trend_percent) }}%
            </strong>
          </div>
          <div class="stat-pill">
            <span class="stat-pill__label">Spread</span>
            <strong class="stat-pill__value">{{ money(item.spread_percent) }}%</strong>
          </div>
        </div>
      </div>

      <!-- ── CHART ── -->
      <div v-if="!loading && !error" class="surface-card p-5 md:p-6">
        <div class="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <div class="section-kicker !mb-2">{{ t('marketItem.chartTitle') }}</div>
            <h2 class="text-xl font-black text-slate-50">{{ t('marketItem.chartTitle') }}</h2>
          </div>
          <div v-if="chartSource === 'history'" class="flex items-center flex-wrap gap-2">
            <div class="flex items-center gap-1.5">
              <button
                v-for="d in [7, 30, 90]"
                :key="d"
                class="days-btn"
                :class="{ active: historyDays === d }"
                @click="setHistoryDays(d)"
              >{{ d }}д</button>
            </div>
            <template v-if="periodChange">
              <span class="period-divider" aria-hidden="true"></span>
              <span
                v-if="periodChange.buyPct !== null"
                class="period-chg"
                :class="pctClass(periodChange.buyPct)"
                :title="`Покупка: изменение за ${historyDays} дн.`"
              >
                {{ t('marketItem.stateBuy') }} {{ pctFormat(periodChange.buyPct) }}
              </span>
              <span
                v-if="periodChange.sellPct !== null"
                class="period-chg"
                :class="pctClass(periodChange.sellPct)"
                :title="`Скупка: изменение за ${historyDays} дн.`"
              >
                {{ t('marketItem.stateSell') }} {{ pctFormat(periodChange.sellPct) }}
              </span>
            </template>
          </div>
        </div>

        <div v-if="hasChart">
          <div class="chart-wrap">
            <svg :viewBox="`0 0 ${CW} ${CH}`" class="chart-svg">
              <defs>
                <linearGradient id="buyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgb(52,211,153)" stop-opacity="0.18"/>
                  <stop offset="100%" stop-color="rgb(52,211,153)" stop-opacity="0"/>
                </linearGradient>
                <linearGradient id="sellGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgb(251,113,133)" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="rgb(251,113,133)" stop-opacity="0"/>
                </linearGradient>
                <filter id="buyGlow" x="-10%" y="-50%" width="120%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="sellGlow" x="-10%" y="-50%" width="120%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              <!-- Horizontal grid lines + y labels -->
              <g v-for="lbl in yLabels" :key="lbl.v">
                <line
                  :x1="PAD.left" :y1="lbl.y.toFixed(1)"
                  :x2="CW - PAD.right" :y2="lbl.y.toFixed(1)"
                  stroke="rgba(255,255,255,0.06)" stroke-width="1"
                />
                <text :x="PAD.left - 8" :y="(lbl.y + 4).toFixed(1)" text-anchor="end" class="chart-lbl">
                  {{ money(lbl.v) }}
                </text>
              </g>

              <!-- X labels -->
              <text
                v-for="lbl in xLabels" :key="lbl.label"
                :x="lbl.x.toFixed(1)" :y="CH - 8"
                text-anchor="middle" class="chart-lbl"
              >{{ lbl.label }}</text>

              <!-- Area fills -->
              <path v-if="buyFillPath" :d="buyFillPath" fill="url(#buyGrad)" stroke="none"/>
              <path v-if="sellFillPath" :d="sellFillPath" fill="url(#sellGrad)" stroke="none"/>

              <!-- Lines with glow -->
              <path v-if="buyPath" :d="buyPath" fill="none" stroke="rgb(52 211 153)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" filter="url(#buyGlow)" opacity="0.5"/>
              <path v-if="buyPath" :d="buyPath" fill="none" stroke="rgb(52 211 153)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
              <path v-if="sellPath" :d="sellPath" fill="none" stroke="rgb(251 113 133)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" filter="url(#sellGlow)" opacity="0.5"/>
              <path v-if="sellPath" :d="sellPath" fill="none" stroke="rgb(251 113 133)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span v-if="buyPath" class="flex items-center gap-2">
              <span class="legend-line" style="background:rgb(52 211 153)"></span>
              <span class="text-emerald-400 font-semibold">{{ t('marketItem.stateBuy') }}</span>
            </span>
            <span v-if="sellPath" class="flex items-center gap-2">
              <span class="legend-line" style="background:rgb(251 113 133)"></span>
              <span class="text-rose-400 font-semibold">{{ t('marketItem.stateSell') }}</span>
            </span>
            <span v-if="chartData" class="chart-range-hint">
              {{ money(chartData.minVal) }} — {{ money(chartData.maxVal) }}
            </span>
            <span v-if="item?.updated_at" class="ml-auto text-slate-600 text-xs">
              обновлено {{ formatTxTime(item.updated_at) }}
            </span>
          </div>
        </div>
        <div v-else class="flex flex-col items-center gap-2 py-10 text-slate-600">
          <svg class="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
          <p class="text-sm">История накопится после первого пересчёта цен</p>
        </div>
      </div>

      <!-- ── TRANSACTIONS + LISTINGS ── -->
      <div v-if="!loading && !error" class="grid gap-4 xl:grid-cols-[1fr_340px]">

        <!-- Transactions -->
        <section class="surface-card p-5 md:p-6">
          <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div class="section-kicker !mb-1">{{ t('marketItem.txTitle') }}</div>
              <h2 class="text-lg font-black text-slate-50">
                {{ t('marketItem.txTitle') }}
                <span class="tx-count-badge">{{ filteredTransactions.length }}</span>
              </h2>
            </div>
            <div class="tx-filter-tabs">
              <button :class="{ active: txFilter === 'all' }" @click="txFilter = 'all'">{{ t('marketItem.filterAll') }}</button>
              <button :class="{ active: txFilter === 'buy' }" @click="txFilter = 'buy'">{{ t('marketItem.filterBuy') }}</button>
              <button :class="{ active: txFilter === 'sell' }" @click="txFilter = 'sell'">{{ t('marketItem.filterSell') }}</button>
            </div>
          </div>

          <div v-if="filteredTransactions.length" class="tx-table-wrap">
            <table class="tx-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Player</th>
                  <th class="num">Amount</th>
                  <th class="num">Price/u</th>
                  <th class="num">Total</th>
                  <th class="num">Time</th>
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
          <div v-else class="flex flex-col items-center gap-2 py-10 text-slate-600">
            <svg class="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <p class="text-sm">Нет транзакций по этому товару</p>
          </div>
        </section>

        <!-- Nation listings -->
        <section class="surface-card p-5 md:p-6">
          <div class="section-kicker !mb-1">{{ t('marketItem.listingsTitle') }}</div>
          <h2 class="text-lg font-black text-slate-50 mb-4">{{ t('marketItem.listingsTitle') }}</h2>

          <div v-if="listings.length" class="space-y-2.5">
            <div v-for="lot in listings" :key="lot.id" class="listing-row">
              <div class="listing-row__nation">
                <span class="listing-row__tag">[{{ lot.nation_tag }}]</span>
                <span class="listing-row__name truncate">{{ lot.nation_title }}</span>
              </div>
              <p class="listing-row__seller">{{ lot.seller_player_name }}</p>
              <div class="listing-row__price-block">
                <strong class="listing-row__price">{{ money(lot.current_unit_price) }} ₽</strong>
                <div class="listing-row__stock">
                  <div class="listing-row__stock-bar" :style="{ width: Math.min(100, (lot.remaining_amount / lot.total_amount) * 100) + '%' }"></div>
                </div>
                <p class="listing-row__stock-label">{{ lot.remaining_amount }} / {{ lot.total_amount }} шт</p>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center gap-2 py-10 text-slate-600">
            <svg class="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <p class="text-sm">Нет активных лотов</p>
          </div>
        </section>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ── ambient ── */
.item-page { position: relative; }

.item-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.item-orb--green  { width: 500px; height: 500px; top: -80px; left: -100px; background: radial-gradient(circle, rgba(34,197,94,.09), transparent 70%); }
.item-orb--violet { width: 440px; height: 440px; top: 120px; right: -80px; background: radial-gradient(circle, rgba(139,92,246,.1), transparent 70%); }

/* ── hero ── */
.item-hero {
  position: relative;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(15,23,42,.7);
  backdrop-filter: blur(20px);
  overflow: hidden;
  padding: 1.75rem;
}

.item-hero__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .6;
  transition: opacity .3s;
}
.item-hero.high_demand .item-hero__glow {
  background: radial-gradient(circle at 10% 50%, rgba(34,197,94,.1) 0%, transparent 60%);
}
.item-hero.oversupply .item-hero__glow {
  background: radial-gradient(circle at 10% 50%, rgba(251,113,133,.1) 0%, transparent 60%);
}
.item-hero.stable .item-hero__glow {
  background: radial-gradient(circle at 10% 50%, rgba(139,92,246,.08) 0%, transparent 60%);
}

.item-hero__top {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  flex-wrap: wrap;
}

.item-hero__icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.item-hero__icon-letter {
  font-size: 1.5rem;
  font-weight: 900;
  color: rgba(255,255,255,.4);
  line-height: 1;
}

.item-hero__meta { min-width: 0; }
.item-hero__kicker {
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin-bottom: .2rem;
  font-family: monospace;
}
.item-hero__title {
  font-size: 1.75rem;
  font-weight: 900;
  color: rgb(248 250 252);
  letter-spacing: -.03em;
  line-height: 1.15;
}
@media (max-width: 640px) { .item-hero__title { font-size: 1.35rem; } }

.item-hero__stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .6rem;
  margin-top: 1.5rem;
}
@media (min-width: 480px) { .item-hero__stats { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 900px) { .item-hero__stats { grid-template-columns: repeat(6, 1fr); } }

.stat-pill {
  display: flex;
  flex-direction: column;
  gap: .3rem;
  border-radius: 14px;
  padding: .75rem .9rem;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  transition: border-color .2s, background .2s;
}
.stat-pill:hover {
  background: rgba(255,255,255,.065);
  border-color: rgba(255,255,255,.13);
}
.stat-pill.buy { border-color: rgba(52,211,153,.2); background: rgba(52,211,153,.05); }
.stat-pill.sell { border-color: rgba(251,113,133,.2); background: rgba(251,113,133,.05); }

.stat-pill__label {
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(100 116 139);
}
.stat-pill__value {
  font-size: .95rem;
  font-weight: 900;
  color: rgb(226 232 240);
  word-break: break-all;
}

/* ── state badge ── */
.state-badge {
  border-radius: 999px;
  padding: .35rem .9rem;
  font-size: .75rem;
  font-weight: 900;
  letter-spacing: .14em;
  text-transform: uppercase;
  white-space: nowrap;
}
.state-badge.high_demand { background: rgba(34,197,94,.12); color: rgb(134 239 172); border: 1px solid rgba(34,197,94,.2); }
.state-badge.oversupply  { background: rgba(251,113,133,.12); color: rgb(253 164 175); border: 1px solid rgba(251,113,133,.2); }
.state-badge.stable      { background: rgba(148,163,184,.08); color: rgb(148 163 184); border: 1px solid rgba(148,163,184,.15); }

/* ── chart ── */
.chart-wrap { overflow-x: auto; }
.chart-svg { display: block; width: 100%; height: auto; min-width: 340px; }
.chart-lbl { fill: rgb(71 85 105); font-size: 12px; }

.legend-line {
  display: inline-block;
  width: 24px;
  height: 2.5px;
  border-radius: 99px;
}

.days-btn {
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 999px;
  background: transparent;
  color: rgb(100 116 139);
  font-size: .75rem;
  font-weight: 900;
  letter-spacing: .1em;
  padding: .28rem .7rem;
  cursor: pointer;
  transition: background .12s, color .12s, border-color .12s;
}
.days-btn:hover { border-color: rgba(255,255,255,.2); color: rgb(203 213 225); }
.days-btn.active {
  border-color: rgba(52,211,153,.45);
  background: rgba(52,211,153,.1);
  color: rgb(134 239 172);
}

.period-divider {
  display: inline-block;
  width: 1px;
  height: 16px;
  background: rgba(255,255,255,.1);
  border-radius: 1px;
  margin: 0 .1rem;
}

.period-chg {
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .08em;
  padding: .22rem .65rem;
  border-radius: 999px;
  white-space: nowrap;
  cursor: default;
}
.period-chg.pct-up {
  color: rgb(134 239 172);
  background: rgba(52,211,153,.1);
  border: 1px solid rgba(52,211,153,.22);
}
.period-chg.pct-down {
  color: rgb(253 164 175);
  background: rgba(251,113,133,.1);
  border: 1px solid rgba(251,113,133,.22);
}
.period-chg.pct-neutral {
  color: rgb(100 116 139);
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
}

.chart-range-hint {
  font-family: monospace;
  font-size: .75rem;
  color: rgb(71 85 105);
  padding: .1rem .45rem;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 6px;
}

/* ── transactions ── */
.tx-count-badge {
  display: inline-flex;
  align-items: center;
  margin-left: .4rem;
  padding: .08rem .45rem;
  border-radius: 999px;
  background: rgba(148,163,184,.1);
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .08em;
  color: rgb(100 116 139);
  vertical-align: middle;
}

.tx-filter-tabs {
  display: flex;
  gap: .2rem;
  padding: .2rem;
  border-radius: 10px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
}
.tx-filter-tabs button {
  border: none;
  background: transparent;
  color: rgb(100 116 139);
  font-size: .75rem;
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
  border-radius: 14px;
}
.tx-table { width: 100%; border-collapse: collapse; min-width: 480px; }
.tx-table th {
  background: rgba(255,255,255,.02);
  border-bottom: 1px solid rgba(255,255,255,.07);
  padding: .45rem .75rem;
  text-align: left;
  font-size: .6rem;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgb(71 85 105);
  white-space: nowrap;
}
.tx-table th.num, .tx-table td.num { text-align: right; }
.tx-table td {
  border-bottom: 1px solid rgba(255,255,255,.035);
  padding: .5rem .75rem;
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
  padding: .18rem .6rem;
  font-size: .75rem;
  font-weight: 900;
  letter-spacing: .1em;
  text-transform: uppercase;
  white-space: nowrap;
}
.tx-badge.buy  { background: rgba(34,197,94,.12); color: rgb(134 239 172); }
.tx-badge.sell { background: rgba(251,113,133,.12); color: rgb(253 164 175); }

/* ── listings ── */
.listing-row {
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  padding: .85rem 1rem;
  background: rgba(255,255,255,.02);
  transition: background .15s, border-color .15s;
}
.listing-row:hover {
  background: rgba(255,255,255,.04);
  border-color: rgba(255,255,255,.12);
}

.listing-row__nation {
  display: flex;
  align-items: center;
  gap: .4rem;
  min-width: 0;
  margin-bottom: .2rem;
}
.listing-row__tag {
  font-size: .75rem;
  font-weight: 900;
  letter-spacing: .1em;
  color: rgb(139 92 246);
  background: rgba(139,92,246,.12);
  border-radius: 5px;
  padding: .1rem .35rem;
  flex-shrink: 0;
}
.listing-row__name {
  font-weight: 700;
  font-size: .88rem;
  color: rgb(203 213 225);
}
.listing-row__seller {
  font-size: .75rem;
  color: rgb(71 85 105);
  margin-bottom: .6rem;
}
.listing-row__price-block { display: flex; flex-direction: column; gap: .3rem; }
.listing-row__price { font-size: 1.05rem; font-weight: 900; color: rgb(134 239 172); }

.listing-row__stock {
  height: 3px;
  border-radius: 99px;
  background: rgba(255,255,255,.06);
  overflow: hidden;
}
.listing-row__stock-bar {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, rgb(52,211,153), rgb(16,185,129));
  transition: width .4s;
}
.listing-row__stock-label { font-size: .75rem; color: rgb(71 85 105); }
</style>
