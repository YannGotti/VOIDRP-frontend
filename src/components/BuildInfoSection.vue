<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-8 md:py-12">
    <div class="container-shell grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div class="glass-card rounded-[32px] p-6 md:p-8">
        <div class="section-kicker">О сервере</div>
        <h2 class="section-title">Что ждет тебя на VoidRP</h2>
        <p class="section-subtitle">
          Сервер построен на сборке Better MC 5 и рассчитан на игроков, которым нравится большой мир,
          приключения, исследование и удобный старт без лишней возни.
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
            <p class="build-info-card__value">Доступна онлайн в пару кликов</p>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-[32px] p-6 md:p-8">
        <div class="section-kicker">Почему это удобно</div>
        <h3 class="text-3xl font-black leading-tight text-slate-900">
          Игроку не нужно искать важную информацию по чатам и сообщениям
        </h3>

        <div class="mt-6 space-y-4">
          <div class="advantage-row">
            <div class="advantage-row__icon">01</div>
            <div>
              <p class="font-bold text-slate-900">Один понятный старт</p>
              <p class="mt-1 text-slate-600">
                Все начинается с одной кнопки: скачай лаунчер и заходи в игру.
              </p>
            </div>
          </div>

          <div class="advantage-row">
            <div class="advantage-row__icon">02</div>
            <div>
              <p class="font-bold text-slate-900">Карта всегда рядом</p>
              <p class="mt-1 text-slate-600">
                Можно быстро открыть карту мира и посмотреть нужные места.
              </p>
            </div>
          </div>

          <div class="advantage-row">
            <div class="advantage-row__icon">03</div>
            <div>
              <p class="font-bold text-slate-900">Понятная подача</p>
              <p class="mt-1 text-slate-600">
                Сайт сразу показывает, куда нажать и как начать игру.
              </p>
            </div>
          </div>

          <div class="advantage-row">
            <div class="advantage-row__icon">04</div>
            <div>
              <p class="font-bold text-slate-900">Все важное в одном месте</p>
              <p class="mt-1 text-slate-600">
                Лаунчер, карта, новости и ссылки проекта доступны без лишнего поиска.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>