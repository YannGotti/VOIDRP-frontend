<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { siteConfig } from '../config.site'

const CHECK_STORAGE_KEY = 'voidrp-expert-progression-guide-v1'

const checked = ref({})

const introCards = [
  { label: 'Главная идея', title: 'Не спидранить один мод', text: 'Сборка построена так, чтобы технологии, магия, измерения и боссы открывали друг друга постепенно.', icon: '🧩' },
  { label: 'Правило крафтов', title: 'Удалили — дали замену', text: 'Ключевые рецепты усложняются точечно. База остаётся играбельной, но требует больше подготовки.', icon: '⚙️' },
  { label: 'Финальная цель', title: 'Пройти всю сборку', text: 'Draconic Evolution и Avaritia требуют Create, магию, IE, Mekanism, AE2, боссов и автоматизацию.', icon: '🏆' },
]

const routeSteps = [
  'Ваниль+ / выживание',
  'Farmer\'s Delight / еда',
  'Create / первая механика',
  'Aether + Mahou Tsukai / магия',
  'Immersive Engineering / сталь',
  'Twilight + DeeperDarker',
  'Mekanism / промышленность',
  'AE2 / хранение и автокрафт',
  'Industrial Foregoing',
  'Cataclysm / боссы',
  'Draconic Evolution',
  'Avaritia / финал',
]

const stages = [
  {
    id: 'survival',
    number: '01',
    title: 'Базовое выживание',
    tags: ['Ваниль+', 'Farmer\'s Delight', 'удобство'],
    goal: 'Стабилизировать еду, хранение, базовую добычу и подготовить материалы для первого технологического рывка.',
    unlocks: [
      'Рюкзак, компас природы, путевой камень',
      'Книги, карта, сундуки, базовые инструменты',
      'Ресурсы под Create: железо, медь, редстоун, золото, цинк',
    ],
    checks: [
      'Есть безопасная база, еда и первичный склад',
      'Сделан рюкзак или подготовлены материалы',
      'Есть ресурсы под первые Create-механизмы',
    ],
  },
  {
    id: 'create',
    number: '02',
    title: 'Create — первая технологическая эпоха',
    tags: ['Create', 'автоматизация', 'механизмы'],
    goal: 'Построить первую механику: пресс, миксер, деплоер, crushing wheels и производственные линии.',
    unlocks: [
      'Андезитовый сплав, Вал, Шестерня, Большая шестерня',
      'Механический пресс, Миксер, Установщик',
      'Грубый механизм, Ядро точного механизма, Андезитовая рама',
    ],
    checks: [
      'Работает линия с Механический пресс',
      'Есть Механический установщик и Миксер',
      'Крафтятся Точный механизм / ядро',
    ],
  },
  {
    id: 'early_magic',
    number: '03',
    title: 'Ранняя магия и первые измерения',
    tags: ['Aether', 'Mahou Tsukai', 'магический мост'],
    goal: 'Открыть магические компоненты, которые нужны для технологий средней игры.',
    unlocks: [
      'Ресурсы Эфира для небесного ядра',
      'Компоненты Mahou Tsukai для магического механизма',
      'Первые техно-магические связки',
    ],
    checks: [
      'Есть доступ к Aether и базовым ресурсам',
      'Начат Mahou Tsukai',
      'Крафтятся Магический механизм и Небесное ядро',
    ],
  },
  {
    id: 'industry',
    number: '04',
    title: 'Тяжёлая промышленность и сталь',
    tags: ['Immersive Engineering', 'сталь', 'TFMG'],
    goal: 'Сделать сталь обязательным мостом между Create, магией и Mekanism.',
    unlocks: [
      'Обработанное дерево, Коксовый кирпич, Доменный кирпич',
      'Стальная машинная рама, Тяжёлое инженерное ядро',
      'Металлический пресс, Промышленная дробилка, Конденсаторы',
    ],
    checks: [
      'Налажено производство стали',
      'Собраны Металлический пресс и Дробилка',
      'Есть Тяжёлое инженерное ядро',
    ],
  },
  {
    id: 'midgame',
    number: '05',
    title: 'Twilight, DeeperDarker и старт Mekanism',
    tags: ['Twilight Forest', 'DeeperDarker', 'Mekanism'],
    goal: 'Получить тёмные и лесные ключи прогрессии, затем открыть первые Mekanism-машины.',
    unlocks: [
      'Тёмное ядро, Сумеречная печать',
      'Металлургический инфузер, Базовая управляющая схема',
      'Дробилка, Энергетическая плавильня, Базовый энергетический куб',
    ],
    checks: [
      'Получены Twilight / DeeperDarker материалы',
      'Крафтятся Тёмное ядро и печати',
      'Работает стартовый Mekanism',
    ],
  },
  {
    id: 'ae2',
    number: '06',
    title: 'AE2, хранение и автокрафт',
    tags: ['AE2', 'Хранение', 'автокрафт'],
    goal: 'Перейти от временного склада к полноценной сети хранения и автоматизации.',
    unlocks: [
      'Зарядник, Прессователь, процессоры',
      'МЭ-накопитель, МЭ-контроллер, Ячейки хранения',
      'Поставщик шаблонов, Молекулярный сборщик',
    ],
    checks: [
      'AE2-сеть включена и стабильно работает',
      'Есть автокрафт через Поставщик / Молекулярный сборщик',
      'Основные ресурсы заведены в хранение',
    ],
  },
  {
    id: 'automation',
    number: '07',
    title: 'Industrial Foregoing и автоматизация',
    tags: ['Industrial Foregoing', 'ресурсы', 'автоматизация'],
    goal: 'Автоматизировать фермы, мобов, ресурсы и подготовить базу к позднему потреблению.',
    unlocks: [
      'Жидкостный экстрактор, Камера растворения',
      'Сеятель / сборщик растений, Дробилка мобов',
      'Лазерный бур и крупные ресурсные линии',
    ],
    checks: [
      'Есть пластиковая цепочка и Камера растворения',
      'Запущены фермы растений или мобов',
      'Готова ресурсная база под боссов',
    ],
  },
  {
    id: 'bosses',
    number: '08',
    title: 'Боссы, Cataclysm и вход в финал',
    tags: ['Cataclysm', 'боссы', 'поздняя игра'],
    goal: 'Собрать добычу с боссов, закрыть поздние печати и подготовить компоненты для Draconic Evolution.',
    unlocks: [
      'Печать Катаклизма и компоненты с боссов',
      'Ядро измерительной сходимости и поздние ядра',
      'Доступ к Draconic Evolution без перескока',
    ],
    checks: [
      'Есть нормальная броня, еда и расходники',
      'Получена нужная добыча с боссов',
      'Можно крафтить компоненты для Draconic Evolution',
    ],
  },
  {
    id: 'endgame',
    number: '09',
    title: 'Draconic Evolution и Avaritia',
    tags: ['Draconic Evolution', 'Avaritia', 'финал'],
    goal: 'Финальная цель: сверхдорогие компоненты, огромная энергия, массовый автокрафт.',
    unlocks: [
      'Ядро виверны, Пробуждённое ядро, инжекторы',
      'Экстремальный верстак, Компрессор, Нейтронный коллектор',
      'Катализатор бесконечности, Слиток бесконечности',
    ],
    checks: [
      'Есть Драконий крафт и стабильная энергия',
      'Автоматизированы дорогие промежуточные компоненты',
      'Начат или завершён Катализатор бесконечности',
    ],
  },
]

const crossLinks = [
  ['Farmer\'s Delight', 'еда, кожа, ремесленная база', 'рюкзаки, комфортный старт и подготовка к Create'],
  ['Create', 'механическая обработка и первые механизмы', 'рамки, схемы, IE и магические компоненты'],
  ['Aether + Mahou Tsukai', 'ранняя магия и sky/arcane-ядра', 'часть технологических рецептов'],
  ['Immersive Engineering', 'сталь, провода, тяжёлая промышленность', 'Mekanism и машины средней игры'],
  ['Twilight + DeeperDarker', 'тёмные ядра, трофеи, печати', 'Mekanism, AE2 и финал-гейты'],
  ['Mekanism', 'энергия, переработка, circuits', 'AE2, IF, Draconic-подготовка'],
  ['AE2', 'хранение, процессоры, автокрафт', 'массовую автоматизацию и Avaritia'],
  ['Cataclysm', 'добыча с боссов и поздние печати', 'Draconic Evolution'],
  ['Draconic Evolution', 'сверхпоздние ядра и энергия', 'Avaritia'],
]

const tips = [
  { title: 'Не уходи в один мод', text: 'Держи несколько целей одновременно: еда, хранение, Create, магия, сталь и энергия.' },
  { title: 'Сохраняй промежуточные компоненты', text: 'VoidRP-компоненты часто используются повторно — делай их партиями.' },
  { title: 'Не откладывай магию', text: 'Aether, Mahou, Twilight и DeeperDarker нужны уже для средней игры.' },
  { title: 'Автоматизируй рано', text: 'AE2 придёт позже, но первые Create-линии нужно строить как можно раньше.' },
]

const totalChecks = computed(() => stages.reduce((sum, stage) => sum + stage.checks.length, 0))
const completedChecks = computed(() => Object.values(checked.value).filter(Boolean).length)
const completionPercent = computed(() => {
  if (!totalChecks.value) return 0
  return Math.round((completedChecks.value / totalChecks.value) * 100)
})

function checkKey(stage, index) { return `${stage.id}-${index}` }
function resetProgress() { checked.value = {} }

onMounted(() => {
  try {
    const raw = window.localStorage.getItem(CHECK_STORAGE_KEY)
    checked.value = raw ? JSON.parse(raw) || {} : {}
  } catch {
    checked.value = {}
  }
})

watch(checked, (value) => {
  try { window.localStorage.setItem(CHECK_STORAGE_KEY, JSON.stringify(value)) }
  catch { /* private mode — progress won't be saved */ }
}, { deep: true })
</script>

<template>
  <section class="gp py-3 md:py-4">
    <div class="container-shell max-w-[1380px] space-y-3">

      <!-- ─── HEADER ─── -->
      <header class="gp-header">
        <div class="gp-header__left">
          <p class="gp-eyebrow">Гайд · VoidRP Expert</p>
          <h1 class="gp-h1">Progression Rebuild</h1>
          <p class="gp-desc">
            Полное прохождение экспертной сборки для Minecraft {{ siteConfig.serverVersion }}:
            от базового выживания до Draconic Evolution и Avaritia.
          </p>
          <div class="gp-header__actions">
            <RouterLink to="/download-launcher" class="btn btn-primary btn-sm">Скачать лаунчер</RouterLink>
            <RouterLink to="/links" class="btn btn-outline btn-sm">Ссылки</RouterLink>
            <button type="button" class="btn btn-ghost btn-sm" @click="resetProgress">Сбросить прогресс</button>
          </div>
        </div>

        <div class="gp-progress">
          <div class="gp-progress__top">
            <span class="gp-progress__label">Прогресс гайда</span>
            <span class="gp-progress__fraction">{{ completedChecks }}/{{ totalChecks }}</span>
          </div>
          <div class="gp-progress__num">{{ completionPercent }}%</div>
          <div class="gp-progress__bar-track">
            <div class="gp-progress__bar-fill" :style="{ width: `${completionPercent}%` }"></div>
          </div>
          <p class="gp-progress__hint">Отмечай этапы — прогресс сохраняется в браузере</p>
        </div>
      </header>

      <!-- ─── INTRO CARDS ─── -->
      <div class="gp-intro-grid">
        <div v-for="card in introCards" :key="card.title" class="gp-intro-card">
          <span class="gp-intro-icon">{{ card.icon }}</span>
          <div>
            <p class="gp-intro-label">{{ card.label }}</p>
            <h3 class="gp-intro-title">{{ card.title }}</h3>
            <p class="gp-intro-text">{{ card.text }}</p>
          </div>
        </div>
      </div>

      <!-- ─── MAIN: sidebar + stages ─── -->
      <div class="gp-layout">

        <!-- sticky nav -->
        <aside class="gp-nav surface-card">
          <p class="gp-nav__label">Маршрут</p>
          <nav class="gp-nav__list">
            <a v-for="stage in stages" :key="stage.id" :href="`#${stage.id}`" class="gp-nav-link">
              <span class="gp-nav-link__num">{{ stage.number }}</span>
              <span class="gp-nav-link__title">{{ stage.title }}</span>
            </a>
          </nav>

          <div class="gp-nav__route">
            <p class="gp-nav__label" style="margin-top:.75rem">Прогрессия</p>
            <ol class="gp-route">
              <li v-for="(step, i) in routeSteps" :key="step">
                <span>{{ i + 1 }}</span>{{ step }}
              </li>
            </ol>
          </div>
        </aside>

        <!-- stages -->
        <div class="gp-stages">
          <article v-for="stage in stages" :id="stage.id" :key="stage.id" class="surface-card gp-stage">
            <div class="gp-stage__header">
              <div>
                <div class="gp-stage__num">Этап {{ stage.number }}</div>
                <h2 class="gp-stage__title">{{ stage.title }}</h2>
                <p class="gp-stage__goal">{{ stage.goal }}</p>
              </div>
              <div class="gp-tags">
                <span v-for="tag in stage.tags" :key="tag" class="gp-tag">{{ tag }}</span>
              </div>
            </div>

            <div class="gp-stage__body">
              <div class="gp-list-block">
                <p class="gp-list-label">Что открывает</p>
                <ul class="gp-unlocks">
                  <li v-for="item in stage.unlocks" :key="item">
                    <span class="gp-diamond">◆</span>{{ item }}
                  </li>
                </ul>
              </div>

              <div class="gp-list-block">
                <p class="gp-list-label">Чеклист</p>
                <div class="gp-checklist">
                  <label v-for="(item, index) in stage.checks" :key="item" class="gp-check" :class="{ done: checked[checkKey(stage, index)] }">
                    <input v-model="checked[checkKey(stage, index)]" type="checkbox" />
                    <span>{{ item }}</span>
                  </label>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- ─── CROSS-LINKS TABLE ─── -->
      <div class="surface-card gp-card">
        <h2 class="gp-section-title">Связи модов — почему нельзя пропускать ветки</h2>
        <div class="gp-table-wrap">
          <table class="gp-table">
            <thead>
              <tr>
                <th>Мод / этап</th>
                <th>Что даёт</th>
                <th>Что открывает</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in crossLinks" :key="row[0]">
                <td><strong>{{ row[0] }}</strong></td>
                <td>{{ row[1] }}</td>
                <td>{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── TIPS ─── -->
      <div class="surface-card gp-card">
        <h2 class="gp-section-title">Как проходить без лишней боли</h2>
        <div class="gp-tips-grid">
          <div v-for="tip in tips" :key="tip.title" class="gp-tip">
            <strong>{{ tip.title }}</strong>
            <small>{{ tip.text }}</small>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ─── Header ─── */
.gp-header {
  display: grid;
  gap: 1rem;
  align-items: start;
}

@media (min-width: 860px) {
  .gp-header { grid-template-columns: 1fr 260px; }
}

.gp-eyebrow {
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin: 0 0 .3rem;
}

.gp-h1 {
  font-size: 1.5rem;
  font-weight: 900;
  color: #f8fbff;
  margin: 0 0 .4rem;
  letter-spacing: -.03em;
}

.gp-desc {
  font-size: .83rem;
  line-height: 1.6;
  color: rgb(100 116 139);
  margin: 0 0 .75rem;
  max-width: 520px;
}

.gp-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}

/* ─── Progress ─── */
.gp-progress {
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(20,26,50,.98), rgba(12,17,32,1));
  padding: 1rem;
}

.gp-progress__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .3rem;
}

.gp-progress__label {
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(255,255,255,.4);
}

.gp-progress__fraction {
  font-size: .72rem;
  font-weight: 700;
  color: rgba(255,255,255,.4);
}

.gp-progress__num {
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -.04em;
  margin-bottom: .6rem;
}

.gp-progress__bar-track {
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,.1);
  overflow: hidden;
  margin-bottom: .6rem;
}

.gp-progress__bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #34d399, #86efac);
  transition: width .4s ease;
}

.gp-progress__hint {
  font-size: .72rem;
  color: rgba(255,255,255,.35);
  margin: 0;
}

/* ─── Intro cards ─── */
.gp-intro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: .5rem;
}

.gp-intro-card {
  display: flex;
  align-items: flex-start;
  gap: .75rem;
  border: 1px solid rgba(148,163,184,.1);
  border-radius: 16px;
  background: rgba(255,255,255,.025);
  padding: .85rem;
}

.gp-intro-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(139,92,246,.1);
  border: 1px solid rgba(139,92,246,.15);
}

.gp-intro-label {
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin: 0 0 .15rem;
}

.gp-intro-title {
  font-size: .92rem;
  font-weight: 800;
  color: rgb(226 232 240);
  margin: 0 0 .25rem;
}

.gp-intro-text {
  font-size: .78rem;
  line-height: 1.55;
  color: rgb(100 116 139);
  margin: 0;
}

/* ─── Layout ─── */
.gp-layout {
  display: grid;
  gap: .75rem;
}

@media (min-width: 1024px) {
  .gp-layout { grid-template-columns: 220px minmax(0, 1fr); }
}

/* ─── Sidebar nav ─── */
.gp-nav {
  padding: .85rem;
  position: sticky;
  top: 5rem;
  height: fit-content;
  max-height: calc(100vh - 7rem);
  overflow-y: auto;
}

@media (max-width: 1023px) {
  .gp-nav { position: relative; top: 0; max-height: none; }
}

.gp-nav__label {
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin: 0 0 .5rem;
}

.gp-nav__list {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}

.gp-nav-link {
  display: flex;
  align-items: center;
  gap: .5rem;
  border-radius: 10px;
  padding: .4rem .5rem;
  transition: background .12s, color .12s;
  color: rgb(148 163 184);
}

.gp-nav-link:hover { background: rgba(255,255,255,.05); color: #fff; }

.gp-nav-link__num {
  font-size: .65rem;
  font-weight: 900;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid rgba(134,239,172,.2);
  background: rgba(134,239,172,.07);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(134 239 172);
  flex-shrink: 0;
}

.gp-nav-link__title {
  font-size: .75rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* route list */
.gp-route {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.gp-route li {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .72rem;
  color: rgb(100 116 139);
}

.gp-route li span {
  font-size: .62rem;
  font-weight: 800;
  color: rgb(71 85 105);
  width: 16px;
  flex-shrink: 0;
}

/* ─── Stages ─── */
.gp-stages { display: flex; flex-direction: column; gap: .65rem; }

.gp-stage {
  padding: 1rem;
  scroll-margin-top: 5.5rem;
}

.gp-stage__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .75rem;
  margin-bottom: .75rem;
  flex-wrap: wrap;
}

.gp-stage__num {
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin-bottom: .2rem;
}

.gp-stage__title {
  font-size: 1rem;
  font-weight: 900;
  color: #f0f4ff;
  margin: 0 0 .3rem;
  letter-spacing: -.02em;
}

.gp-stage__goal {
  font-size: .8rem;
  line-height: 1.55;
  color: rgb(100 116 139);
  margin: 0;
  max-width: 520px;
}

.gp-tags { display: flex; flex-wrap: wrap; gap: .3rem; flex-shrink: 0; }

.gp-tag {
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 999px;
  background: rgba(255,255,255,.04);
  padding: .18rem .55rem;
  font-size: .65rem;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: rgb(148 163 184);
}

.gp-stage__body {
  display: grid;
  gap: .5rem;
}

@media (min-width: 640px) {
  .gp-stage__body { grid-template-columns: 1fr 1fr; }
}

.gp-list-block {
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 12px;
  background: rgba(255,255,255,.02);
  padding: .75rem;
}

.gp-list-label {
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin: 0 0 .5rem;
}

.gp-unlocks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: .35rem;
}

.gp-unlocks li {
  display: flex;
  align-items: flex-start;
  gap: .4rem;
  font-size: .8rem;
  line-height: 1.5;
  color: rgb(203 213 225);
}

.gp-diamond { color: rgb(110 231 183); flex-shrink: 0; font-size: .7rem; margin-top: .15rem; }

.gp-checklist { display: flex; flex-direction: column; gap: .3rem; }

.gp-check {
  display: flex;
  align-items: flex-start;
  gap: .5rem;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.025);
  padding: .45rem .55rem;
  font-size: .8rem;
  line-height: 1.45;
  color: rgb(203 213 225);
  cursor: pointer;
  transition: border-color .12s, background .12s;
}

.gp-check input { accent-color: #22c55e; margin-top: .08rem; flex-shrink: 0; }
.gp-check.done { border-color: rgba(34,197,94,.2); background: rgba(34,197,94,.04); color: rgb(134 239 172); }

/* ─── Cards ─── */
.gp-card { padding: 1rem; }

.gp-section-title {
  font-size: .92rem;
  font-weight: 800;
  color: rgb(203 213 225);
  margin: 0 0 .85rem;
}

/* ─── Cross-links table ─── */
.gp-table-wrap { overflow-x: auto; border: 1px solid rgba(255,255,255,.07); border-radius: 12px; }

.gp-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
}

.gp-table th {
  background: rgba(255,255,255,.03);
  border-bottom: 1px solid rgba(255,255,255,.07);
  padding: .42rem .75rem;
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  text-align: left;
}

.gp-table td {
  border-bottom: 1px solid rgba(255,255,255,.05);
  padding: .5rem .75rem;
  font-size: .82rem;
  color: rgb(148 163 184);
  vertical-align: top;
}

.gp-table td strong { color: rgb(226 232 240); font-weight: 700; }
.gp-table tr:last-child td { border-bottom: none; }

/* ─── Tips ─── */
.gp-tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: .5rem;
}

.gp-tip {
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
  background: rgba(255,255,255,.025);
  padding: .75rem;
  display: flex;
  flex-direction: column;
  gap: .3rem;
}

.gp-tip strong { font-size: .85rem; font-weight: 800; color: rgb(226 232 240); }
.gp-tip small { font-size: .78rem; line-height: 1.55; color: rgb(100 116 139); }
</style>
