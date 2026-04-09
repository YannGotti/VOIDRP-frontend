<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-10 md:py-14">
    <div class="container-shell">
      <div class="cta-shell">
        <div class="max-w-3xl">
          <div class="section-kicker section-kicker--light">Официальный вход</div>
          <h2 class="text-3xl font-black leading-tight md:text-5xl">
            Играй через официальный лаунчер {{ siteConfig.serverName }}
          </h2>
          <p class="mt-4 text-lg leading-8 text-white/80">
            Сначала войди или зарегистрируйся на сайте, потом скачай официальный лаунчер и используй те же данные для входа в игру.
          </p>
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink
            to="/download-launcher"
            class="btn btn-primary btn-lg rounded-2xl bg-white text-slate-950 hover:bg-white/90"
          >
            Скачать лаунчер
          </RouterLink>
          <a
            :href="siteConfig.dynmapUrl"
            target="_blank"
            rel="noreferrer"
            class="btn btn-outline btn-lg rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            Открыть карту
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
