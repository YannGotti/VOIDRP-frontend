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
          Большой мир, удобный старт через официальный лаунчер и всё важное в одном месте: сайт, карта и личный кабинет.
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
            <p class="build-info-card__label">Адрес сервера</p>
            <p class="build-info-card__value">{{ siteConfig.serverIp }}</p>
          </div>

          <div class="build-info-card">
            <p class="build-info-card__label">Карта мира</p>
            <p class="build-info-card__value">Открывается прямо в браузере</p>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-[32px] p-6 md:p-8">
        <div class="section-kicker">Почему начать легко</div>
        <h3 class="text-3xl font-black leading-tight text-slate-900">
          Игроку не нужно разбираться в лишних настройках
        </h3>

        <div class="mt-6 space-y-4">
          <div class="advantage-row">
            <div class="advantage-row__icon">01</div>
            <div>
              <p class="font-bold text-slate-900">Понятный путь</p>
              <p class="mt-1 text-slate-600">
                Сайт по шагам показывает, что делать сначала и куда нажимать дальше.
              </p>
            </div>
          </div>

          <div class="advantage-row">
            <div class="advantage-row__icon">02</div>
            <div>
              <p class="font-bold text-slate-900">Официальный лаунчер</p>
              <p class="mt-1 text-slate-600">
                Не нужно вручную искать правильную сборку и настраивать клиент.
              </p>
            </div>
          </div>

          <div class="advantage-row">
            <div class="advantage-row__icon">03</div>
            <div>
              <p class="font-bold text-slate-900">Личный кабинет</p>
              <p class="mt-1 text-slate-600">
                В одном месте видно твой ник, почту и основные действия по аккаунту.
              </p>
            </div>
          </div>

          <div class="advantage-row">
            <div class="advantage-row__icon">04</div>
            <div>
              <p class="font-bold text-slate-900">Все ссылки рядом</p>
              <p class="mt-1 text-slate-600">
                Карта мира, новости проекта и страница скачивания доступны без долгого поиска.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
