<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createPayment, getDonateProducts, getLastPayments } from '../services/donateApi'
import { toastError } from '../services/toast'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(true)
const paying = ref(false)
const error = ref('')
const products = ref([])
const lastPayments = ref([])
const cart = ref({})
const coupon = ref('')

const cartItems = computed(() => products.value.filter((p) => cart.value[p.id] > 0))
const cartCount = computed(() => Object.values(cart.value).reduce((s, n) => s + n, 0))
const cartTotal = computed(() =>
  products.value.reduce((sum, p) => sum + (cart.value[p.id] || 0) * Number(p.price || 0), 0),
)

function addToCart(id) {
  cart.value = { ...cart.value, [id]: (cart.value[id] || 0) + 1 }
}

function removeFromCart(id) {
  const n = cart.value[id] || 0
  if (n <= 1) {
    const c = { ...cart.value }
    delete c[id]
    cart.value = c
  } else {
    cart.value = { ...cart.value, [id]: n - 1 }
  }
}

function clearCart() {
  cart.value = {}
  coupon.value = ''
}

async function checkout() {
  if (!auth.isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: '/shop' } })
    return
  }
  if (!cartCount.value) return
  paying.value = true
  try {
    const result = await createPayment(auth.accessToken, cart.value, coupon.value || null)
    if (result?.url) {
      clearCart()
      window.location.href = result.url
    }
  } catch (err) {
    toastError(err.message || 'Ошибка при создании платежа')
  } finally {
    paying.value = false
  }
}

async function loadPage() {
  loading.value = true
  error.value = ''
  try {
    const [prods, pays] = await Promise.all([
      getDonateProducts(),
      getLastPayments().catch(() => []),
    ])
    products.value = Array.isArray(prods) ? prods : []
    lastPayments.value = Array.isArray(pays) ? pays.slice(0, 8) : []
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить магазин.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPage)
</script>

<template>
  <section class="py-8 md:py-10 auth-page">
    <div class="container-shell space-y-6 page-entry">

      <!-- Header -->
      <div class="surface-card p-5 md:p-7">
        <div class="section-kicker">Поддержать проект</div>
        <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">Магазин</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Косметические предметы и привилегии — без влияния на игровой баланс.
        </p>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <!-- Main layout -->
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start">

        <!-- Product grid -->
        <div class="min-w-0 flex-1">

          <!-- Skeleton -->
          <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <div v-for="i in 8" :key="i" class="skeleton h-64 rounded-[20px]" />
          </div>

          <!-- Empty -->
          <div v-else-if="!products.length" class="surface-card flex flex-col items-center gap-3 p-10 text-center">
            <svg class="h-12 w-12 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 2.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
            <p class="text-base font-bold text-slate-200">Товары скоро появятся</p>
            <p class="text-sm text-slate-500">Мы готовим ассортимент. Заходи позже!</p>
          </div>

          <!-- Grid -->
          <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <article
              v-for="product in products"
              :key="product.id"
              class="surface-card flex flex-col overflow-hidden p-0 transition-transform hover:-translate-y-0.5"
              :class="cart[product.id] ? 'ring-1 ring-violet-500/50' : ''"
            >
              <!-- Image -->
              <div class="relative aspect-square w-full overflow-hidden bg-slate-900">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="h-full w-full object-cover"
                />
                <div v-else class="flex h-full w-full items-center justify-center">
                  <svg class="h-10 w-10 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <!-- Cart badge -->
                <span
                  v-if="cart[product.id]"
                  class="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[11px] font-black text-white"
                >{{ cart[product.id] }}</span>
              </div>

              <!-- Info -->
              <div class="flex flex-1 flex-col gap-2 p-3">
                <div class="flex-1">
                  <p class="text-sm font-bold leading-snug text-slate-100">{{ product.name }}</p>
                  <p v-if="product.description" class="mt-0.5 text-xs leading-relaxed text-slate-500">{{ product.description }}</p>
                </div>
                <div class="flex items-center justify-between gap-2 border-t border-slate-700/40 pt-2">
                  <span class="text-sm font-black text-slate-100">{{ Number(product.price).toLocaleString('ru') }} ₽</span>
                  <div class="flex items-center gap-1">
                    <button
                      v-if="cart[product.id]"
                      class="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold text-slate-200 transition hover:bg-slate-600"
                      @click="removeFromCart(product.id)"
                    >−</button>
                    <button
                      class="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-violet-500"
                      @click="addToCart(product.id)"
                    >{{ cart[product.id] ? '+' : 'Купить' }}</button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Cart sidebar -->
        <div v-if="products.length" class="w-full shrink-0 lg:w-72">
          <div class="surface-card sticky top-20 flex flex-col gap-4 p-4">
            <!-- Title -->
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <h2 class="text-sm font-black text-slate-100">Корзина</h2>
              <span
                v-if="cartCount"
                class="ml-auto rounded-full bg-violet-600 px-2 py-0.5 text-[11px] font-black text-white"
              >{{ cartCount }}</span>
            </div>

            <!-- Empty -->
            <p v-if="!cartCount" class="py-3 text-center text-xs text-slate-500">Добавь товар из каталога</p>

            <!-- Items -->
            <div v-else class="divide-y divide-slate-700/40">
              <div v-for="product in cartItems" :key="product.id" class="flex flex-col gap-1.5 py-2.5">
                <p class="text-xs font-semibold text-slate-200">{{ product.name }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <button
                      class="flex h-5 w-5 items-center justify-center rounded bg-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-600"
                      @click="removeFromCart(product.id)"
                    >−</button>
                    <span class="w-5 text-center text-xs font-bold text-slate-100">{{ cart[product.id] }}</span>
                    <button
                      class="flex h-5 w-5 items-center justify-center rounded bg-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-600"
                      @click="addToCart(product.id)"
                    >+</button>
                  </div>
                  <span class="text-xs font-bold text-slate-100">
                    {{ (cart[product.id] * Number(product.price)).toLocaleString('ru') }} ₽
                  </span>
                </div>
              </div>
            </div>

            <!-- Coupon -->
            <input
              v-if="cartCount"
              v-model="coupon"
              class="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500"
              placeholder="Купон (необязательно)"
            />

            <!-- Total -->
            <div v-if="cartCount" class="flex items-center justify-between border-t border-slate-700/40 pt-1">
              <span class="text-xs text-slate-400">Итого</span>
              <span class="text-base font-black text-slate-50">{{ cartTotal.toLocaleString('ru') }} ₽</span>
            </div>

            <!-- Pay button -->
            <button
              v-if="!auth.isAuthenticated.value"
              class="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
              @click="router.push({ path: '/login', query: { redirect: '/shop' } })"
            >
              Войти для покупки
            </button>
            <button
              v-else
              class="w-full rounded-xl py-2.5 text-sm font-bold text-white transition"
              :class="cartCount && !paying ? 'bg-violet-600 hover:bg-violet-500' : 'bg-slate-700 opacity-50 cursor-default'"
              :disabled="!cartCount || paying"
              @click="checkout"
            >
              <template v-if="paying">Переходим к оплате…</template>
              <template v-else-if="!cartCount">Корзина пуста</template>
              <template v-else>Оплатить {{ cartTotal.toLocaleString('ru') }} ₽</template>
            </button>

            <button
              v-if="cartCount"
              class="text-xs text-slate-600 transition hover:text-slate-400"
              @click="clearCart"
            >Очистить корзину</button>

            <!-- Delivery info -->
            <div v-if="auth.isAuthenticated.value" class="rounded-xl border border-slate-700/40 bg-slate-900/60 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500 space-y-1">
              <p>
                <span class="text-slate-400">Никнейм:</span>
                <span class="ml-1 font-bold text-slate-300">{{ auth.state.playerAccount?.minecraft_nickname || '—' }}</span>
              </p>
              <p>
                <span class="text-slate-400">Почта:</span>
                <span class="ml-1 font-bold text-slate-300">{{ auth.state.user?.email || '—' }}</span>
              </p>
              <p class="text-slate-600">Товар выдаётся на этот никнейм, квитанция — на эту почту.</p>
            </div>

            <!-- Legal -->
            <p class="border-t border-slate-700/40 pt-3 text-[11px] leading-relaxed text-slate-600">
              Нажимая «Оплатить», вы соглашаетесь с
              <RouterLink to="/offer" class="prose-link">офертой</RouterLink>.
              Цифровые товары выдаются автоматически и не подлежат возврату.
            </p>
          </div>
        </div>

      </div>

      <!-- Last payments -->
      <div v-if="lastPayments.length">
        <h2 class="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">Последние покупки</h2>
        <div class="surface-card overflow-hidden p-0">
          <div class="divide-y divide-slate-700/30">
            <div
              v-for="pay in lastPayments"
              :key="pay.id"
              class="flex items-center gap-4 px-4 py-3 text-sm transition hover:bg-slate-800/30"
            >
              <span class="w-28 shrink-0 truncate font-bold text-slate-100">{{ pay.customer }}</span>
              <span class="flex-1 truncate text-slate-500">{{ (pay.products || []).map((p) => p.name).join(', ') }}</span>
              <span class="shrink-0 font-bold text-violet-400">{{ Number(pay.cost).toLocaleString('ru') }} ₽</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Legal footer -->
      <div class="surface-card flex items-start gap-3 p-4 text-xs leading-relaxed text-slate-500">
        <svg class="mt-px h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p>
          Все товары — виртуальные игровые объекты без реальной стоимости. Покупка не даёт преимуществ над другими игроками.
          Платежи обрабатываются сервисом
          <a href="https://easydonate.ru" target="_blank" rel="noreferrer" class="prose-link">EasyDonate</a>.
          Подробнее —
          <RouterLink to="/offer" class="prose-link">договор оферты</RouterLink>.
        </p>
      </div>

    </div>
  </section>
</template>
