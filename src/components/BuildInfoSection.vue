<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-8 md:py-12">
    <div class="container-shell grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div class="glass-card rounded-[32px] p-6 md:p-8">
        <div class="section-kicker">О сервере</div>
        <h2 class="section-title">Что ждёт тебя на VoidRP</h2>
        <p class="section-subtitle">
          VoidRP построен на Better MC 5 и подойдёт тем, кто любит большой мир, приключения, исследование и красивую атмосферу.
        </p>

        <div class="mt-6 grid gap-4">
          <div class="build-info-card">
            <p class="build-info-card__label">Сборка</p>
            <p class="build-info-card__value">Better MC 5</p>
          </div>

          <div class="build-info-card">
            <p class="build-info-card__label">Версия игры</p>
            <p class="build-info-card__value">{{ siteConfig.serverVersion }}</p>
          </div>

          <div class="build-info-card">
            <p class="build-info-card__label">IP сервера</p>
            <p class="build-info-card__value">{{ siteConfig.serverIp }}</p>
          </div>

          <div class="build-info-card">
            <p class="build-info-card__label">Карта мира</p>
            <p class="build-info-card__value">Можно открыть прямо в браузере</p>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-[32px] p-6 md:p-8">
        <div class="section-kicker">Почему это удобно</div>
        <h3 class="text-3xl font-black leading-tight text-slate-900">
          Нужная информация всегда перед глазами
        </h3>

        <div class="mt-6 space-y-4">
          <div class="advantage-row">
            <div class="advantage-row__icon">01</div>
            <div>
              <p class="font-bold text-slate-900">Понятный старт</p>
              <p class="mt-1 text-slate-600">
                Сначала аккаунт, потом лаунчер, потом игра. Без лишних шагов и догадок.
              </p>
            </div>
          </div>

          <div class="advantage-row">
            <div class="advantage-row__icon">02</div>
            <div>
              <p class="font-bold text-slate-900">Карта всегда рядом</p>
              <p class="mt-1 text-slate-600">
                Можно быстро посмотреть мир, маршруты и интересные места.
              </p>
            </div>
          </div>

          <div class="advantage-row">
            <div class="advantage-row__icon">03</div>
            <div>
              <p class="font-bold text-slate-900">Простые подсказки</p>
              <p class="mt-1 text-slate-600">
                На сайте сразу понятно, куда нажать и что делать дальше.
              </p>
            </div>
          </div>

          <div class="advantage-row">
            <div class="advantage-row__icon">04</div>
            <div>
              <p class="font-bold text-slate-900">Всё в одном месте</p>
              <p class="mt-1 text-slate-600">
                Лаунчер, карта, ссылки и важная информация собраны на одном сайте.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
