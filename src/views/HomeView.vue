<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { siteConfig } from '../config.site.js'
import { useReveal } from '../composables/useReveal.js'

useReveal()

const ipCopied = ref(false)
function copyIp() {
  navigator.clipboard.writeText(siteConfig.serverIp).then(() => {
    ipCopied.value = true
    setTimeout(() => { ipCopied.value = false }, 2000)
  })
}

// spotlight — свет за мышью на карточках
const LIGHT_SELECTOR = '.step-card, .feat-card, .launcher-card, .cta-card'
let lightCleanup = []

onMounted(() => {
  document.querySelectorAll(LIGHT_SELECTOR).forEach((card) => {
    function onMove(e) {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px')
      card.style.setProperty('--my', (e.clientY - r.top) + 'px')
      card.classList.add('lit')
    }
    function onLeave() {
      card.classList.remove('lit')
    }
    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    lightCleanup.push(() => {
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
    })
  })
})

onUnmounted(() => {
  lightCleanup.forEach((fn) => fn())
  lightCleanup = []
})
</script>

<template>
  <!-- ═══════════════════════ HERO ═══════════════════════ -->
  <section class="hero">
    <!-- background decoration -->
    <div class="hero__noise"></div>
    <div class="hero__grid"></div>
    <div class="hero__orb hero__orb--1"></div>
    <div class="hero__orb hero__orb--2"></div>
    <div class="hero__orb hero__orb--3"></div>

    <!-- floating Minecraft item decorations -->
    <div class="hero__mc-stage" aria-hidden="true">
      <img class="mc-item mc-item--sword"    src="/item-icons/minecraft/diamond_sword.png" alt="">
      <img class="mc-item mc-item--beacon"   src="/item-icons/minecraft/beacon.png" alt="">
      <img class="mc-item mc-item--star"     src="/item-icons/minecraft/nether_star.png" alt="">
      <img class="mc-item mc-item--egg"      src="/item-icons/minecraft/dragon_egg.png" alt="">
      <img class="mc-item mc-item--diamond"  src="/item-icons/minecraft/diamond.png" alt="">
      <img class="mc-item mc-item--table"    src="/item-icons/minecraft/enchanting_table.png" alt="">
      <img class="mc-item mc-item--obsidian" src="/item-icons/minecraft/obsidian.png" alt="">
    </div>

    <div class="container-shell hero__inner">
      <div class="hero__badge anim-hero anim-d0">
        <span class="hero__badge-dot"></span>
        VoidRP · Minecraft Roleplay · {{ siteConfig.serverVersion }}
      </div>

      <h1 class="hero__title anim-hero anim-d1">
        Войди в мир,<br>
        <span class="hero__title-grad">который мы создаём вместе</span>
      </h1>

      <p class="hero__desc anim-hero anim-d2">
        Своя экономика, государства, альянсы и сотни модов — всё через единый аккаунт и удобный лаунчер.
      </p>

      <div class="hero__actions anim-hero anim-d3">
        <RouterLink to="/register" class="btn-hero-primary">Создать аккаунт</RouterLink>
        <a :href="siteConfig.launcherPortableUrl" class="btn-hero-secondary" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          Скачать лаунчер
        </a>
        <a :href="siteConfig.discordUrl" target="_blank" rel="noreferrer" class="btn-hero-ghost">Discord</a>
      </div>

      <div class="hero__meta anim-hero anim-d4">
        <button class="hero__ip" @click="copyIp">
          <svg v-if="!ipCopied" viewBox="0 0 20 20" fill="currentColor" width="11" height="11"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/></svg>
          <svg v-else viewBox="0 0 20 20" fill="currentColor" width="11" height="11"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          {{ ipCopied ? 'Скопировано' : siteConfig.serverIp }}
        </button>
        <span class="hero__sep">·</span>
        <span class="hero__online">
          <span class="hero__online-dot"></span>
          Сервер работает
        </span>
        <span class="hero__sep">·</span>
        <a :href="siteConfig.bluemapUrl" target="_blank" rel="noreferrer" class="hero__map-link">Карта мира ↗</a>
      </div>
    </div>

    <!-- scroll cue -->
    <div class="hero__scroll-cue anim-hero anim-d5">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
    </div>
  </section>

  <!-- ═══════════════════════ STEPS ═══════════════════════ -->
  <section class="steps-section">
    <div class="container-shell">
      <div class="section-header" data-reveal>
        <p class="section-kicker">Старт</p>
        <h2 class="section-h2">Три шага до игры</h2>
      </div>
      <div class="steps-grid">
        <div class="step-card" data-reveal data-delay="0">
          <div class="step-card__num">01</div>
          <h3 class="step-card__title">Аккаунт</h3>
          <p class="step-card__desc">Регистрируешься на сайте и подтверждаешь почту — это занимает минуту.</p>
          <RouterLink to="/register" class="step-card__link">Зарегистрироваться →</RouterLink>
        </div>
        <div class="step-card step-card--accent" data-reveal data-delay="80">
          <div class="step-card__num">02</div>
          <h3 class="step-card__title">Лаунчер</h3>
          <p class="step-card__desc">Скачиваешь официальный лаунчер. Он сам подготовит сборку без ручной настройки.</p>
          <a :href="siteConfig.launcherPortableUrl" target="_blank" rel="noreferrer" class="step-card__link">Скачать →</a>
        </div>
        <div class="step-card" data-reveal data-delay="160">
          <div class="step-card__num">03</div>
          <h3 class="step-card__title">Играть</h3>
          <p class="step-card__desc">Входишь тем же аккаунтом и жмёшь «Играть». Готово — сервер сразу доступен.</p>
          <span class="step-card__link step-card__link--muted">IP: void-rp.ru</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════ LAUNCHER ═══════════════════════ -->
  <section class="launcher-section">
    <div class="container-shell">
      <div class="launcher-card" data-reveal>
        <div class="launcher-card__glow"></div>
        <div class="launcher-card__left">
          <p class="section-kicker section-kicker--light">Официальный клиент</p>
          <h2 class="launcher-card__title">Лаунчер VoidRP</h2>
          <p class="launcher-card__desc">
            Берёт нужную версию Minecraft, устанавливает всю сборку модов и запускает игру под твоим
            аккаунтом — никаких ручных настроек.
          </p>
          <ul class="launcher-features">
            <li><span class="lf-dot"></span>Автоматическая установка сборки</li>
            <li><span class="lf-dot"></span>Авторизация через аккаунт VoidRP</li>
            <li><span class="lf-dot"></span>Обновляется самостоятельно</li>
            <li><span class="lf-dot"></span>Windows · поддержка Linux в работе</li>
          </ul>
        </div>
        <div class="launcher-card__right">
          <div class="launcher-download-box">
            <p class="ldb-label">Готово к загрузке</p>
            <a :href="siteConfig.launcherPortableUrl" target="_blank" rel="noreferrer" class="ldb-btn">
              <svg viewBox="0 0 20 20" fill="currentColor" width="17" height="17"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              Скачать лаунчер
            </a>
            <p class="ldb-note">
              Для входа в игру потребуется аккаунт.<br>
              <RouterLink to="/register">Зарегистрироваться бесплатно →</RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════ FEATURES ═══════════════════════ -->
  <section class="features-section">
    <div class="container-shell">
      <div class="section-header" data-reveal>
        <p class="section-kicker">Возможности</p>
        <h2 class="section-h2">Всё, что нужно — в одном месте</h2>
      </div>
      <div class="features-grid">
        <div class="feat-card" data-reveal data-delay="0">
          <div class="feat-card__icon feat-icon--violet">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="21" height="21"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3 class="feat-card__title">Государства</h3>
          <p class="feat-card__desc">Создавай государство, назначай офицеров, принимай участников и управляй казной прямо на сайте.</p>
        </div>
        <div class="feat-card" data-reveal data-delay="60">
          <div class="feat-card__icon feat-icon--sky">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="21" height="21"><path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="feat-card__title">Альянсы</h3>
          <p class="feat-card__desc">Объединяй государства в военные блоки, экономические союзы и политические федерации.</p>
        </div>
        <div class="feat-card" data-reveal data-delay="120">
          <div class="feat-card__icon feat-icon--green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="21" height="21"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="feat-card__title">Экономика</h3>
          <p class="feat-card__desc">Казна государства, пожертвования игроков, переводы внутри альянса и история операций.</p>
        </div>
        <div class="feat-card" data-reveal data-delay="180">
          <div class="feat-card__icon feat-icon--amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="21" height="21"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
          </div>
          <h3 class="feat-card__title">Карта мира</h3>
          <p class="feat-card__desc">BlueMap в браузере — смотри территории государств, столицы и активные зоны в реальном времени.</p>
        </div>
        <div class="feat-card" data-reveal data-delay="240">
          <div class="feat-card__icon feat-icon--rose">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="21" height="21"><path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="feat-card__title">Профили</h3>
          <p class="feat-card__desc">Публичная страница с аватаром, баннером, статистикой и ссылкой для других игроков.</p>
        </div>
        <div class="feat-card" data-reveal data-delay="300">
          <div class="feat-card__icon feat-icon--indigo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="21" height="21"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <h3 class="feat-card__title">Оформление</h3>
          <p class="feat-card__desc">Иконка, баннер, фон и цвет акцента — государство и профиль выглядят так, как ты хочешь.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════ CTA ═══════════════════════ -->
  <section class="cta-section">
    <div class="container-shell">
      <div class="cta-card" data-reveal>
        <div class="cta-card__glow"></div>
        <div class="cta-card__orb cta-card__orb--1"></div>
        <div class="cta-card__orb cta-card__orb--2"></div>
        <p class="section-kicker section-kicker--light">Присоединяйся</p>
        <h2 class="cta-card__title">Готов начать?</h2>
        <p class="cta-card__desc">Создай аккаунт, скачай лаунчер и заходи — всё бесплатно.</p>
        <div class="cta-actions">
          <RouterLink to="/register" class="btn-hero-primary">Создать аккаунт</RouterLink>
          <a :href="siteConfig.launcherPortableUrl" target="_blank" rel="noreferrer" class="btn-hero-secondary">Скачать лаунчер</a>
          <a :href="siteConfig.discordUrl" target="_blank" rel="noreferrer" class="btn-hero-ghost">Discord</a>
        </div>
        <div class="cta-links">
          <RouterLink to="/nations" class="cta-link">Государства</RouterLink>
          <span>·</span>
          <a :href="siteConfig.bluemapUrl" target="_blank" rel="noreferrer" class="cta-link">Карта мира</a>
          <span>·</span>
          <RouterLink to="/nation/rankings" class="cta-link">Рейтинг</RouterLink>
          <span>·</span>
          <RouterLink to="/guide" class="cta-link">Гайд</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ════════════════════════════════════
   KEYFRAMES
════════════════════════════════════ */
@keyframes hero-in {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes orb-float-1 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(30px, -40px) scale(1.08); }
  100% { transform: translate(-10px, 20px) scale(0.96); }
}
@keyframes orb-float-2 {
  0%   { transform: translate(0, 0) scale(1); }
  40%  { transform: translate(-40px, 30px) scale(1.06); }
  100% { transform: translate(20px, -20px) scale(0.94); }
}
@keyframes orb-float-3 {
  0%   { transform: translate(0, 0); }
  60%  { transform: translate(20px, -30px); }
  100% { transform: translate(-15px, 15px); }
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 6px rgba(74,222,128,.6); opacity: 1; }
  50%       { box-shadow: 0 0 14px rgba(74,222,128,.9), 0 0 28px rgba(74,222,128,.3); opacity: .85; }
}

@keyframes grad-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes scroll-bounce {
  0%, 100% { transform: translateY(0); opacity: .4; }
  50%       { transform: translateY(7px); opacity: .9; }
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(32px) scale(.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

@keyframes ldb-pulse {
  0%, 100% { box-shadow: 0 0 28px rgba(109,40,217,.4); }
  50%       { box-shadow: 0 0 48px rgba(109,40,217,.65), 0 0 80px rgba(109,40,217,.2); }
}

/* ════════════════════════════════════
   HERO ENTRY — staggered
════════════════════════════════════ */
.anim-hero {
  opacity: 0;
  animation: hero-in .8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.anim-d0 { animation-delay: .05s; }
.anim-d1 { animation-delay: .18s; }
.anim-d2 { animation-delay: .32s; }
.anim-d3 { animation-delay: .46s; }
.anim-d4 { animation-delay: .60s; }
.anim-d5 { animation-delay: .80s; }

/* ════════════════════════════════════
   SCROLL REVEAL
════════════════════════════════════ */
[data-reveal] {
  opacity: 0;
  transform: translateY(28px) scale(.99);
  transition: opacity .65s cubic-bezier(0.16, 1, 0.3, 1),
              transform .65s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-reveal].is-revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ════════════════════════════════════
   SHARED BUTTONS
════════════════════════════════════ */
.btn-hero-primary {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .72rem 1.45rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: #fff; font-weight: 800; font-size: .92rem;
  text-decoration: none;
  box-shadow: 0 0 28px rgba(109,40,217,.38);
  transition: box-shadow .25s, transform .18s;
}
.btn-hero-primary:hover {
  box-shadow: 0 0 44px rgba(109,40,217,.6);
  transform: translateY(-2px);
}
.btn-hero-primary:active { transform: translateY(0); }

.btn-hero-secondary {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: .72rem 1.45rem;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.06);
  color: #e2e8f0; font-weight: 700; font-size: .92rem;
  text-decoration: none; backdrop-filter: blur(8px);
  transition: border-color .22s, background .22s, transform .18s, box-shadow .22s;
}
.btn-hero-secondary:hover {
  border-color: rgba(139,92,246,.55);
  background: rgba(139,92,246,.14);
  box-shadow: 0 0 24px rgba(139,92,246,.2);
  transform: translateY(-2px);
}

.btn-hero-ghost {
  display: inline-flex; align-items: center;
  padding: .72rem 1.1rem;
  border-radius: 14px;
  color: rgba(255,255,255,.45); font-weight: 700; font-size: .92rem;
  text-decoration: none;
  transition: color .2s;
}
.btn-hero-ghost:hover { color: rgba(255,255,255,.88); }

/* ════════════════════════════════════
   HERO
════════════════════════════════════ */
.hero {
  position: relative; overflow: hidden;
  padding: 7rem 0 6rem;
  min-height: 92vh;
  display: flex; align-items: center;
}

/* subtle noise grain */
.hero__noise {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: .028;
}

/* subtle dot grid */
.hero__grid {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background-image: radial-gradient(circle, rgba(148,163,184,.12) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%);
}

/* glow orbs */
.hero__orb {
  position: absolute; border-radius: 999px; pointer-events: none;
  filter: blur(90px);
}
.hero__orb--1 {
  width: 680px; height: 680px;
  background: radial-gradient(circle, rgba(109,40,217,.28), transparent 70%);
  top: -200px; left: -160px;
  animation: orb-float-1 12s ease-in-out infinite alternate;
}
.hero__orb--2 {
  width: 560px; height: 560px;
  background: radial-gradient(circle, rgba(56,189,248,.16), transparent 70%);
  top: 5%; right: -140px;
  animation: orb-float-2 16s ease-in-out infinite alternate;
}
.hero__orb--3 {
  width: 420px; height: 280px;
  background: radial-gradient(circle, rgba(139,92,246,.12), transparent 70%);
  bottom: 5%; left: 28%;
  animation: orb-float-3 10s ease-in-out infinite alternate;
}

.hero__inner {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: flex-start;
}

.hero__badge {
  display: inline-flex; align-items: center; gap: .5rem;
  border: 1px solid rgba(139,92,246,.32);
  background: rgba(139,92,246,.1);
  border-radius: 999px;
  padding: .38rem .9rem;
  font-size: .68rem; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: rgba(196,181,253,1);
  margin-bottom: 1.6rem;
  backdrop-filter: blur(6px);
}
.hero__badge-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: #a78bfa;
  animation: pulse-dot 2.4s ease-in-out infinite;
  flex-shrink: 0;
}

.hero__title {
  font-size: clamp(2.8rem, 6.5vw, 4.4rem);
  font-weight: 900; letter-spacing: -.055em; line-height: .94;
  color: #f8faff;
  margin: 0 0 1.3rem;
}
.hero__title-grad {
  display: block; margin-top: .18em;
  background: linear-gradient(110deg, #fff 0%, #c4b5fd 30%, #7dd3fc 60%, #c4b5fd 90%, #fff 100%);
  background-size: 300% 300%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: grad-shift 6s ease-in-out infinite;
}

.hero__desc {
  font-size: clamp(.9rem, 2vw, 1.05rem);
  line-height: 1.72; color: rgba(148,163,184,.9);
  max-width: 500px; margin: 0 0 2rem;
}

.hero__actions { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 2rem; }

.hero__meta {
  display: flex; align-items: center; flex-wrap: wrap;
  gap: .55rem; font-size: .82rem;
}
.hero__sep { color: rgba(255,255,255,.18); }

.hero__ip {
  display: inline-flex; align-items: center; gap: .38rem;
  border: 1px solid rgba(148,163,184,.13);
  background: rgba(255,255,255,.04); border-radius: 8px;
  padding: .3rem .68rem; cursor: pointer;
  font: inherit; font-size: .8rem; font-weight: 700; color: rgb(203 213 225);
  transition: border-color .18s, color .18s, background .18s;
}
.hero__ip:hover { border-color: rgba(139,92,246,.38); background: rgba(139,92,246,.07); color: #fff; }

.hero__online {
  display: inline-flex; align-items: center; gap: .38rem;
  font-size: .8rem; font-weight: 600; color: rgba(255,255,255,.48);
}
.hero__online-dot {
  width: 7px; height: 7px; border-radius: 999px;
  background: rgb(74 222 128);
  animation: pulse-dot 2s ease-in-out infinite;
  flex-shrink: 0;
}

.hero__map-link {
  font-size: .8rem; font-weight: 600;
  color: rgba(167,139,250,.72); text-decoration: none;
  transition: color .18s;
}
.hero__map-link:hover { color: #c4b5fd; }

.hero__scroll-cue {
  position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
  z-index: 2; color: rgba(255,255,255,.3);
  animation: scroll-bounce 2.2s ease-in-out infinite;
}

/* ════════════════════════════════════
   STEPS
════════════════════════════════════ */
.steps-section { padding: 5rem 0; }

.section-header { margin-bottom: 2.5rem; }
.section-h2 {
  font-size: clamp(1.55rem, 3vw, 2.1rem);
  font-weight: 900; letter-spacing: -.045em;
  color: #f1f5f9; margin: .35rem 0 0;
}

.steps-grid {
  display: grid; gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.step-card {
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 22px;
  background: rgba(255,255,255,.025);
  padding: 1.85rem;
  display: flex; flex-direction: column; gap: .8rem;
  transition: border-color .25s, background .25s, transform .22s, box-shadow .25s;
}
.step-card:hover {
  border-color: rgba(139,92,246,.28);
  background: rgba(139,92,246,.04);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,.3), 0 0 0 1px rgba(139,92,246,.1);
}

.step-card--accent {
  background: radial-gradient(ellipse at top left, rgba(109,40,217,.22) 0%, transparent 65%),
    rgba(255,255,255,.035);
  border-color: rgba(139,92,246,.28);
}
.step-card--accent:hover {
  border-color: rgba(139,92,246,.5);
  box-shadow: 0 12px 40px rgba(0,0,0,.3), 0 0 32px rgba(109,40,217,.15);
}

.step-card__num {
  font-size: .62rem; font-weight: 900; letter-spacing: .16em;
  color: rgba(139,92,246,.65);
}
.step-card__title {
  font-size: 1.08rem; font-weight: 900; color: #f1f5f9; margin: 0;
}
.step-card__desc {
  font-size: .84rem; line-height: 1.62; color: rgba(148,163,184,.85); margin: 0; flex: 1;
}
.step-card__link {
  display: inline-block; font-size: .82rem; font-weight: 700;
  color: #a78bfa; text-decoration: none;
  transition: color .18s, letter-spacing .18s;
}
.step-card__link:hover { color: #c4b5fd; letter-spacing: .01em; }
.step-card__link--muted { color: rgba(148,163,184,.45); pointer-events: none; }

/* ════════════════════════════════════
   LAUNCHER
════════════════════════════════════ */
.launcher-section { padding: 0 0 5rem; }

.launcher-card {
  position: relative; overflow: hidden;
  border: 1px solid rgba(139,92,246,.32);
  border-radius: 28px;
  background: radial-gradient(ellipse at top left, rgba(109,40,217,.3) 0%, transparent 55%),
    linear-gradient(135deg, rgba(20,16,42,.98), rgba(10,10,22,1));
  padding: 2.75rem;
  display: grid; gap: 2.5rem;
  grid-template-columns: 1fr auto;
  align-items: center;
  transition: box-shadow .3s;
}
.launcher-card:hover {
  box-shadow: 0 0 80px rgba(109,40,217,.15), 0 24px 60px rgba(0,0,0,.4);
}
@media (max-width: 768px) { .launcher-card { grid-template-columns: 1fr; } }

.launcher-card__glow {
  position: absolute; width: 500px; height: 350px;
  background: rgba(109,40,217,.18);
  filter: blur(100px); border-radius: 999px;
  top: -100px; left: -80px; pointer-events: none;
}

.launcher-card__title {
  font-size: clamp(1.6rem, 3vw, 2.3rem);
  font-weight: 900; letter-spacing: -.045em; color: #fff;
  margin: .4rem 0 .8rem;
}
.launcher-card__desc {
  font-size: .9rem; line-height: 1.72;
  color: rgba(255,255,255,.52); margin: 0 0 1.4rem; max-width: 480px;
}

.launcher-features {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: .5rem;
}
.launcher-features li {
  display: flex; align-items: center; gap: .6rem;
  font-size: .84rem; font-weight: 600; color: rgba(255,255,255,.62);
}
.lf-dot {
  width: 5px; height: 5px; border-radius: 999px; flex-shrink: 0;
  background: #a78bfa; box-shadow: 0 0 6px rgba(167,139,250,.65);
}

.launcher-download-box {
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 22px;
  background: rgba(255,255,255,.04);
  padding: 1.6rem 1.85rem;
  display: flex; flex-direction: column; align-items: center; gap: .9rem;
  text-align: center; min-width: 230px;
  backdrop-filter: blur(10px);
  transition: border-color .25s;
}
.launcher-download-box:hover { border-color: rgba(139,92,246,.35); }

.ldb-label {
  font-size: .65rem; font-weight: 700; letter-spacing: .18em;
  text-transform: uppercase; color: rgba(167,139,250,.8); margin: 0;
}
.ldb-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .9rem 1.7rem; border-radius: 15px;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: #fff; font-weight: 800; font-size: .95rem;
  text-decoration: none; white-space: nowrap;
  animation: ldb-pulse 3s ease-in-out infinite;
  transition: transform .18s;
}
.ldb-btn:hover { transform: translateY(-2px); }
.ldb-note {
  font-size: .75rem; line-height: 1.6; color: rgba(255,255,255,.38); margin: 0;
}
.ldb-note a { color: rgba(167,139,250,.75); text-decoration: none; transition: color .18s; }
.ldb-note a:hover { color: #c4b5fd; }

/* ════════════════════════════════════
   FEATURES
════════════════════════════════════ */
.features-section { padding: 0 0 5rem; }

.features-grid {
  display: grid; gap: .8rem;
  grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
}

.feat-card {
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 20px; background: rgba(255,255,255,.022);
  padding: 1.6rem; display: flex; flex-direction: column; gap: .8rem;
  transition: border-color .25s, background .25s, transform .22s, box-shadow .25s;
}
.feat-card:hover {
  border-color: rgba(139,92,246,.25);
  background: rgba(139,92,246,.05);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,.25), 0 0 0 1px rgba(139,92,246,.08);
}

.feat-card__icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: transform .22s;
}
.feat-card:hover .feat-card__icon { transform: scale(1.08); }

.feat-icon--violet { background: rgba(139,92,246,.14);  border: 1px solid rgba(139,92,246,.24); color: #a78bfa; }
.feat-icon--sky    { background: rgba(56,189,248,.11);  border: 1px solid rgba(56,189,248,.22);  color: #7dd3fc; }
.feat-icon--green  { background: rgba(74,222,128,.11);  border: 1px solid rgba(74,222,128,.22);  color: #86efac; }
.feat-icon--amber  { background: rgba(251,191,36,.09);  border: 1px solid rgba(251,191,36,.2);   color: #fcd34d; }
.feat-icon--rose   { background: rgba(251,113,133,.09); border: 1px solid rgba(251,113,133,.2);  color: #fda4af; }
.feat-icon--indigo { background: rgba(99,102,241,.11);  border: 1px solid rgba(99,102,241,.22);  color: #a5b4fc; }

.feat-card__title {
  font-size: .95rem; font-weight: 800; color: #e2e8f0; margin: 0;
}
.feat-card__desc {
  font-size: .81rem; line-height: 1.62; color: rgba(100,116,139,.95); margin: 0;
}

/* ════════════════════════════════════
   CTA
════════════════════════════════════ */
.cta-section { padding: 0 0 6rem; }

.cta-card {
  position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,.09); border-radius: 28px;
  background: radial-gradient(ellipse at center top, rgba(109,40,217,.22) 0%, transparent 55%),
    linear-gradient(180deg, rgba(18,14,36,.98), rgba(8,8,18,1));
  padding: 5rem 2rem;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}

.cta-card__glow {
  position: absolute; width: 600px; height: 200px;
  background: rgba(109,40,217,.16); filter: blur(90px);
  border-radius: 999px; top: -30px; left: 50%; transform: translateX(-50%);
  pointer-events: none;
}
.cta-card__orb {
  position: absolute; border-radius: 999px; pointer-events: none; filter: blur(70px);
}
.cta-card__orb--1 {
  width: 300px; height: 200px;
  background: rgba(56,189,248,.07);
  bottom: -40px; left: -60px;
  animation: orb-float-2 14s ease-in-out infinite alternate;
}
.cta-card__orb--2 {
  width: 250px; height: 180px;
  background: rgba(167,139,250,.07);
  bottom: -30px; right: -50px;
  animation: orb-float-1 11s ease-in-out infinite alternate;
}

.cta-card__title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900; letter-spacing: -.055em; color: #fff;
  margin: .5rem 0 .8rem;
}
.cta-card__desc {
  font-size: .95rem; color: rgba(255,255,255,.46);
  margin: 0 0 2.2rem; max-width: 360px;
}

.cta-actions {
  display: flex; flex-wrap: wrap; gap: .65rem;
  justify-content: center; margin-bottom: 2rem;
}

.cta-links {
  display: flex; flex-wrap: wrap; gap: .55rem;
  align-items: center; justify-content: center;
}
.cta-link {
  font-size: .78rem; font-weight: 600;
  color: rgba(148,163,184,.48); text-decoration: none;
  transition: color .18s;
}
.cta-link:hover { color: rgba(255,255,255,.72); }
.cta-links span { color: rgba(255,255,255,.14); }

/* ════════════════════════════════════
   SPOTLIGHT — свет за мышью
════════════════════════════════════ */
.step-card::after,
.feat-card::after,
.launcher-card::after,
.cta-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity .35s ease;
  pointer-events: none;
}

.step-card::after,
.feat-card::after {
  background: radial-gradient(
    circle 220px at var(--mx, 50%) var(--my, 50%),
    rgba(139, 92, 246, .13) 0%,
    transparent 70%
  );
}
.launcher-card::after {
  background: radial-gradient(
    circle 300px at var(--mx, 50%) var(--my, 50%),
    rgba(139, 92, 246, .16) 0%,
    transparent 65%
  );
}
.cta-card::after {
  background: radial-gradient(
    circle 340px at var(--mx, 50%) var(--my, 50%),
    rgba(139, 92, 246, .13) 0%,
    rgba(56, 189, 248, .05) 50%,
    transparent 70%
  );
}

.step-card.lit::after,
.feat-card.lit::after,
.launcher-card.lit::after,
.cta-card.lit::after { opacity: 1; }

/* ════════════════════════════════════
   MINECRAFT FLOATING ITEMS
════════════════════════════════════ */
@keyframes mc-float-a {
  0%, 100% { transform: translateY(0)    rotate(-5deg)  scale(1);    }
  50%       { transform: translateY(-22px) rotate(3deg)   scale(1.04); }
}
@keyframes mc-float-b {
  0%, 100% { transform: translateY(0)    rotate(8deg)   scale(1);    }
  50%       { transform: translateY(-16px) rotate(2deg)   scale(0.97); }
}
@keyframes mc-float-c {
  0%, 100% { transform: translateY(0)    rotate(-10deg) scale(1);    }
  50%       { transform: translateY(-26px) rotate(-4deg)  scale(1.06); }
}
@keyframes mc-float-d {
  0%, 100% { transform: translateY(0)    rotate(12deg)  scale(1);    }
  50%       { transform: translateY(-13px) rotate(6deg)   scale(0.96); }
}
@keyframes mc-float-e {
  0%, 100% { transform: translateY(0)    rotate(3deg)   scale(1);    }
  50%       { transform: translateY(-19px) rotate(-5deg)  scale(1.03); }
}
@keyframes mc-stage-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.hero__mc-stage {
  position: absolute;
  top: 0; bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(1180px, 100vw);
  pointer-events: none;
  z-index: 1;
  animation: mc-stage-in 1.4s ease-out 1.1s both;
}

.mc-item {
  position: absolute;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  user-select: none;
  pointer-events: none;
}

.mc-item--sword {
  width: 108px; height: 108px;
  top: 14%; right: 18%;
  opacity: 0.42;
  animation: mc-float-a 7.5s ease-in-out infinite;
  filter: drop-shadow(0 0 18px rgba(103,232,249,.55)) drop-shadow(0 4px 8px rgba(0,0,0,.4));
}
.mc-item--beacon {
  width: 84px; height: 84px;
  top: 40%; right: 7%;
  opacity: 0.34;
  animation: mc-float-b 9.2s ease-in-out infinite;
  filter: drop-shadow(0 0 14px rgba(56,189,248,.5)) drop-shadow(0 4px 8px rgba(0,0,0,.4));
}
.mc-item--star {
  width: 76px; height: 76px;
  top: 8%; right: 32%;
  opacity: 0.32;
  animation: mc-float-c 11s ease-in-out infinite;
  filter: drop-shadow(0 0 12px rgba(251,191,36,.55)) drop-shadow(0 4px 8px rgba(0,0,0,.4));
}
.mc-item--egg {
  width: 70px; height: 70px;
  top: 60%; right: 11%;
  opacity: 0.30;
  animation: mc-float-d 8.3s ease-in-out infinite;
  filter: drop-shadow(0 0 12px rgba(167,139,250,.5)) drop-shadow(0 4px 8px rgba(0,0,0,.4));
}
.mc-item--diamond {
  width: 64px; height: 64px;
  top: 26%; right: 35%;
  opacity: 0.33;
  animation: mc-float-e 6.8s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(103,232,249,.5)) drop-shadow(0 4px 6px rgba(0,0,0,.35));
}
.mc-item--table {
  width: 82px; height: 82px;
  top: 72%; right: 26%;
  opacity: 0.28;
  animation: mc-float-a 10.5s ease-in-out infinite reverse;
  filter: drop-shadow(0 0 12px rgba(139,92,246,.45)) drop-shadow(0 4px 8px rgba(0,0,0,.4));
}
.mc-item--obsidian {
  width: 66px; height: 66px;
  top: 46%; right: 38%;
  opacity: 0.22;
  animation: mc-float-b 13s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(109,40,217,.4)) drop-shadow(0 4px 6px rgba(0,0,0,.35));
}

@media (max-width: 1100px) {
  .hero__mc-stage { display: none; }
}
</style>
