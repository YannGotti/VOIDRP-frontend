<script setup>
import { computed } from 'vue'
import { siteConfig } from '../config.site'
import { logoutCurrentSession, useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const isAuthenticated = computed(() => auth.isAuthenticated.value)

async function onLogout() {
  await logoutCurrentSession()
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/72 backdrop-blur-xl">
    <div class="container-shell navbar min-h-[82px] px-0">
      <div class="navbar-start">
        <RouterLink to="/" class="group flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-[0_8px_24px_rgba(79,70,229,0.08)] transition-transform duration-200 group-hover:scale-105"
          >
            <img src="/logo.jpg" alt="VoidRP" class="h-full w-full object-cover" />
          </div>
          <div>
            <p class="text-lg font-black leading-none tracking-wide text-slate-900">
              {{ siteConfig.serverName }}
            </p>
            <p class="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">
              better mc 5
            </p>
          </div>
        </RouterLink>
      </div>

      <div class="navbar-center hidden lg:flex">
        <ul
          class="menu menu-horizontal rounded-2xl border border-slate-200 bg-white/90 p-1.5 text-sm text-slate-700 shadow-[0_10px_40px_rgba(15,23,42,0.06)]"
        >
          <li><RouterLink to="/" style="border-radius: 10px;">Главная</RouterLink></li>
          <li><RouterLink to="/download-launcher" style="border-radius: 10px;">Скачать</RouterLink></li>
          <li><RouterLink to="/links" style="border-radius: 10px;">Ссылки</RouterLink></li>
          <li v-if="isAuthenticated"><RouterLink to="/profile" style="border-radius: 10px;">Профиль</RouterLink></li>
          <li v-else><RouterLink to="/login" style="border-radius: 10px;">Вход</RouterLink></li>
        </ul>
      </div>

      <div class="navbar-end hidden gap-2 lg:flex">
        <a
          :href="siteConfig.dynmapUrl"
          target="_blank"
          rel="noreferrer"
          class="btn btn-ghost rounded-2xl text-slate-700"
        >
          Карта
        </a>
        <RouterLink
          v-if="!isAuthenticated"
          to="/register"
          class="btn btn-ghost rounded-2xl text-slate-700"
        >
          Регистрация
        </RouterLink>
        <RouterLink
          v-if="!isAuthenticated"
          to="/download-launcher"
          class="btn btn-primary rounded-2xl shadow-[0_12px_36px_rgba(79,70,229,0.22)]"
        >
          Скачать лаунчер
        </RouterLink>
        <RouterLink
          v-else
          to="/profile"
          class="btn btn-primary rounded-2xl shadow-[0_12px_36px_rgba(79,70,229,0.22)]"
        >
          {{ auth.displayName.value }}
        </RouterLink>
        <button
          v-if="isAuthenticated"
          type="button"
          class="btn btn-outline rounded-2xl"
          @click="onLogout"
        >
          Выйти
        </button>
      </div>

      <div class="navbar-end lg:hidden">
        <div class="dropdown dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost rounded-2xl border border-slate-200 bg-white/85 text-slate-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>

          <ul
            tabindex="0"
            class="menu dropdown-content z-[1] mt-3 w-72 rounded-[24px] border border-slate-200 bg-white p-2 text-slate-700 shadow-2xl"
          >
            <li><RouterLink to="/">Главная</RouterLink></li>
            <li><RouterLink to="/download-launcher">Скачать лаунчер</RouterLink></li>
            <li><RouterLink to="/links">Ссылки</RouterLink></li>
            <li v-if="isAuthenticated"><RouterLink to="/profile">Профиль</RouterLink></li>
            <li v-else><RouterLink to="/login">Вход</RouterLink></li>
            <li v-if="!isAuthenticated"><RouterLink to="/register">Регистрация</RouterLink></li>
            <li>
              <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer">Карта мира</a>
            </li>
            <li v-if="isAuthenticated">
              <button type="button" @click="onLogout">Выйти</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>
