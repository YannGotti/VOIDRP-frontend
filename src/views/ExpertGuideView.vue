<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { siteConfig } from '../config.site'

const CHECK_STORAGE_KEY = 'voidrp-expert-progression-guide-v1'

const checked = ref({})

const introCards = [
  {
    label: 'Главная идея',
    title: 'Не спидранить один мод',
    text: 'Сборка построена так, чтобы технологии, магия, измерения и боссы открывали друг друга постепенно.',
    tone: 'green',
  },
  {
    label: 'Правило крафтов',
    title: 'Удалили — дали замену',
    text: 'Ключевые рецепты усложняются точечно. База остаётся играбельной, но требует больше подготовки.',
    tone: 'blue',
  },
  {
    label: 'Финальная цель',
    title: 'Пройти всю сборку',
    text: 'Draconic Evolution и Avaritia требуют Create, магию, IE, Mekanism, AE2, боссов и автоматизацию.',
    tone: 'gold',
  },
]

const routeSteps = [
  'Ваниль+ / выживание',
  'Farmer’s Delight / еда и кожа',
  'Create / первая механика',
  'Aether + Mahou Tsukai / ранняя магия',
  'Immersive Engineering / сталь',
  'Twilight + DeeperDarker / ключи средней игры',
  'Mekanism / развитая промышленность',
  'AE2 / хранение и автокрафт',
  'Industrial Foregoing / автоматизация',
  'Cataclysm / боссы',
  'Draconic Evolution',
  'Avaritia / финал',
]

const stages = [
  {
    id: 'survival',
    number: '01',
    title: 'Базовое выживание и ремесленная основа',
    tags: ['Ваниль+', 'Farmer’s Delight', 'удобство'],
    goal:
      'Стабилизировать еду, хранение, базовую добычу и подготовить материалы для первого технологического рывка.',
    unlocks: [
      'Книги, компас, карта, сундуки, печи и базовые полезные предметы',
      'Рюкзак, компас природы, путевой камень / камень перемещения',
      'Стартовый ресурсный запас под Create: железо, медь, редстоун, золото, цинк',
    ],
    checks: [
      'Есть безопасная база, еда и первичный склад',
      'Сделан рюкзак или подготовлены материалы под него',
      'Есть ресурсы под первые Create-механизмы',
    ],
  },
  {
    id: 'create',
    number: '02',
    title: 'Create — первая технологическая эпоха',
    tags: ['Create', 'автоматизация', 'механизмы'],
    goal:
      'Построить первую механику: пресс, миксер, деплоер, crushing wheels и производственные линии.',
    unlocks: [
      'Андезитовый сплав, Вал, Шестерня, Большая шестерня',
      'Механический пресс, Механический миксер, Механический установщик, Механический резервуар',
      'Грубый механизм, Ядро точного механизма, Андезитовая машинная рама',
    ],
    checks: [
      'Работает линия с Механический пресс',
      'Есть Механический установщик и Механический миксер',
      'Крафтятся Точный механизм / ядро точного механизма',
    ],
  },
  {
    id: 'early_magic',
    number: '03',
    title: 'Ранняя магия и первые измерения',
    tags: ['Aether', 'Mahou Tsukai', 'магический мост'],
    goal:
      'Открыть магические компоненты, которые будут нужны для технологий. Магия здесь не опция, а ключ к средняя игра.',
    unlocks: [
      'Ресурсы Эфира для небесного ядра',
      'Компоненты Mahou Tsukai для магического механизма',
      'Первые техно-магические связки для дальнейших машин',
    ],
    checks: [
      'Есть доступ к Aether и базовым ресурсам измерения',
      'Начат Mahou Tsukai',
      'Крафтятся Магический механизм и Небесное ядро',
    ],
  },
  {
    id: 'industry',
    number: '04',
    title: 'Тяжёлая промышленность и сталь',
    tags: ['Immersive Engineering', 'сталь', 'TFMG'],
    goal:
      'Сделать сталь обязательным мостом между Create, магией и Mekanism. Этот этап открывает серьёзную индустрию.',
    unlocks: [
      'Обработанное дерево, Коксовый кирпич, Доменный кирпич',
      'Стальная машинная рама, Тяжёлое инженерное ядро',
      'Металлический пресс, Промышленная дробилка, Сборщик, Конденсаторы',
    ],
    checks: [
      'Налажено производство стали',
      'Собраны Металлический пресс и Дробилка',
      'Есть Тяжёлое инженерное ядро для дальнейших машин',
    ],
  },
  {
    id: 'средняя игра',
    number: '05',
    title: 'Twilight, DeeperDarker и старт Mekanism',
    tags: ['Twilight Forest', 'DeeperDarker', 'Mekanism'],
    goal:
      'Получить тёмные и лесные ключи прогрессии, затем открыть первые Mekanism-машины и схемы.',
    unlocks: [
      'Тёмное ядро, Сумеречная печать, Печать Катаклизма задел на будущее',
      'Металлургический инфузер, Базовая управляющая схема, Камера обогащения',
      'Дробилка, Энергетическая плавильня, Базовый энергетический куб',
    ],
    checks: [
      'Получены Twilight / DeeperDarker материалы',
      'Крафтятся Тёмное ядро и промежуточные печати',
      'Работает стартовый Mekanism',
    ],
  },
  {
    id: 'ae2',
    number: '06',
    title: 'AE2, хранение и автокрафт',
    tags: ['AE2', 'Хранение', 'автокрафт'],
    goal:
      'Перейти от временного склада к полноценной сети хранения, процессорам и автоматизации.',
    unlocks: [
      'Зарядник, Прессователь, Логический / вычислительный / инженерный процессоры',
      'МЭ-накопитель, МЭ-контроллер, Ячейки хранения',
      'Поставщик шаблонов, Молекулярный сборщик, Процессор автокрафта, Беспроводной доступ',
    ],
    checks: [
      'AE2-сеть включена и стабильно работает',
      'Есть автокрафт через Поставщик шаблонов / Молекулярный сборщик',
      'Основные цепочки ресурсов заведены в хранение',
    ],
  },
  {
    id: 'automation',
    number: '07',
    title: 'Industrial Foregoing и большая автоматизация',
    tags: ['Industrial Foregoing', 'ресурсы', 'автоматизация'],
    goal:
      'Автоматизировать фермы, мобов, ресурсы и подготовить базу к поздние потреблению.',
    unlocks: [
      'Жидкостный экстрактор, Установка переработки латекса, Камера растворения',
      'Сеятель / сборщик растений, Дробилка мобов / дубликатор мобов',
      'Лазерный бур, База рудного лазера и крупные ресурсные линии',
    ],
    checks: [
      'Есть пластиковая цепочка и Камера растворения',
      'Запущены фермы растений или мобов',
      'Подготовлена ресурсная база под боссов и финал',
    ],
  },
  {
    id: 'bosses',
    number: '08',
    title: 'Боссы, Cataclysm и вход в финал',
    tags: ['Cataclysm', 'боссы', 'поздняя игра'],
    goal:
      'Собрать добыча с боссов, закрыть поздние печати и подготовить компоненты для Draconic Evolution.',
    unlocks: [
      'Печать Катаклизма и компоненты с боссов',
      'Ядро измерительной сходимости и поздние ядра',
      'Доступ к Draconic Evolution без перескока прогрессии',
    ],
    checks: [
      'Есть нормальная броня, еда и расходники для боссов',
      'Получен нужный добыча с боссов',
      'Можно крафтить компоненты для Draconic Evolution',
    ],
  },
  {
    id: 'финал',
    number: '09',
    title: 'Draconic Evolution и Avaritia',
    tags: ['Draconic Evolution', 'Avaritia', 'финал'],
    goal:
      'Финальная цель сборки: сверхдорогие компоненты, огромная энергия, массовый автокрафт и завершение всех веток.',
    unlocks: [
      'Ядро виверны, Пробуждённое ядро, Ядро драконьего крафта / инжекторы',
      'Экстремальный верстак, Компрессор, Нейтронный коллектор',
      'Катализатор бесконечности, Слиток бесконечности и финальные предметы',
    ],
    checks: [
      'Есть Драконий крафт и стабильная энергия',
      'Автоматизированы дорогие промежуточные компоненты',
      'Начат или завершён Катализатор бесконечности',
    ],
  },
]

const crossLinks = [
  ['Farmer’s Delight', 'еда, кожа, ремесленная база', 'рюкзаки, комфортный старт и подготовка к Create'],
  ['Create', 'механическая обработка и первые механизмы', 'рамки, схемы, IE и магические компоненты'],
  ['Aether + Mahou Tsukai', 'ранняя магия и sky/arcane-ядра', 'часть технологических рецептов'],
  ['Immersive Engineering', 'сталь, провода, тяжёлая промышленность', 'Mekanism и машины средней игры'],
  ['Twilight + DeeperDarker', 'тёмные ядра, трофеи, progression печати', 'Mekanism, AE2 и финал-гейты'],
  ['Mekanism', 'энергия, переработка, circuits', 'AE2, IF, Draconic-подготовка'],
  ['AE2', 'хранение, процессоры, автокрафт', 'массовую автоматизацию и Avaritia'],
  ['Cataclysm', 'добыча с боссов и поздние печати', 'Draconic Evolution'],
  ['Draconic Evolution', 'сверхпоздние ядра и энергия', 'Avaritia'],
]

const milestones = [
  {
    title: 'Быстрый тест базы',
    items: ['Книга', 'Компас', 'Рюкзак', 'Путевой камень', 'Компас природы'],
  },
  {
    title: 'Create age',
    items: ['Механический пресс', 'Механический установщик', 'Точный механизм', 'Андезитовая машинная рама'],
  },
  {
    title: 'магический мост',
    items: ['Магический механизм', 'Небесное ядро', 'Тёмное ядро', 'Сумеречная печать'],
  },
  {
    title: 'Середина / поздняя игра',
    items: ['Металлургический инфузер', 'МЭ-контроллер', 'Ядро виверны', 'Катализатор бесконечности'],
  },
]

const totalChecks = computed(() => stages.reduce((sum, stage) => sum + stage.checks.length, 0))
const completedChecks = computed(() => Object.values(checked.value).filter(Boolean).length)
const completionPercent = computed(() => {
  if (!totalChecks.value) return 0
  return Math.round((completedChecks.value / totalChecks.value) * 100)
})

function checkKey(stage, index) {
  return `${stage.id}-${index}`
}

function resetProgress() {
  checked.value = {}
}

onMounted(() => {
  try {
    const raw = window.localХранение.getItem(CHECK_STORAGE_KEY)
    checked.value = raw ? JSON.parse(raw) || {} : {}
  } catch {
    checked.value = {}
  }
})

watch(
  checked,
  (value) => {
    try {
      window.localХранение.setItem(CHECK_STORAGE_KEY, JSON.stringify(value))
    } catch {
      // localХранение может быть недоступен в приватном режиме — прогресс просто не сохранится.
    }
  },
  { deep: true },
)
</script>

<template>
  <section class="guide-page py-4 md:py-5">
    <div class="container-shell max-w-[1380px] space-y-4">
      <section class="guide-hero gradient-panel overflow-hidden p-4 md:p-6 lg:p-7">
        <div class="guide-hero__grid">
          <div class="min-w-0">
            <div class="section-kicker section-kicker--light !mb-2">Гайд по сборке</div>
            <h1 class="text-2xl font-black leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              VoidRP Expert Progression Rebuild
            </h1>
            <p class="mt-3 max-w-4xl text-sm leading-7 text-white/78 md:text-[15px]">
              Полное прохождение экспертной сборки {{ siteConfig.serverName }} для Minecraft {{ siteConfig.serverVersion }}:
              от базового выживания и Create до магии, Mekanism, AE2, Draconic Evolution и Avaritia.
            </p>

            <div class="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <RouterLink to="/download-launcher" class="btn btn-light">Скачать лаунчер</RouterLink>
              <RouterLink to="/links" class="btn btn-outline border-white/16 bg-black/10 text-white hover:border-white/30">
                Полезные ссылки
              </RouterLink>
              <button type="button" class="btn btn-ghost border-white/10 bg-black/10 text-white" @click="resetProgress">
                Сбросить прогресс гайда
              </button>
            </div>
          </div>

          <aside class="guide-progress-card">
            <div class="text-[11px] font-black uppercase tracking-[0.22em] text-white/58">Прогресс гайда</div>
            <div class="mt-2 flex items-end justify-between gap-3">
              <div class="text-4xl font-black text-white">{{ completionPercent }}%</div>
              <div class="text-right text-xs font-bold uppercase tracking-[0.18em] text-white/54">
                {{ completedChecks }} / {{ totalChecks }}
              </div>
            </div>
            <div class="mt-4 h-3 overflow-hidden rounded-full border border-white/10 bg-black/24">
              <div class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-all" :style="{ width: `${completionPercent}%` }"></div>
            </div>
            <p class="mt-3 text-sm leading-6 text-white/68">
              Отмечай этапы по мере прохождения. Прогресс сохраняется в браузере.
            </p>
          </aside>
        </div>
      </section>

      <section class="grid gap-3 md:grid-cols-3">
        <article v-for="card in introCards" :key="card.title" class="surface-card guide-info-card p-4 md:p-5" :class="`guide-info-card--${card.tone}`">
          <div class="section-kicker !mb-2">{{ card.label }}</div>
          <h2 class="text-lg font-black text-slate-50">{{ card.title }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-400">{{ card.text }}</p>
        </article>
      </section>

      <section class="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside class="guide-sidebar surface-card p-3.5 md:p-4">
          <div class="section-kicker !mb-2">Маршрут</div>
          <nav class="grid gap-1.5">
            <a v-for="stage in stages" :key="stage.id" :href="`#${stage.id}`" class="guide-side-link">
              <span>{{ stage.number }}</span>
              <strong>{{ stage.title }}</strong>
            </a>
          </nav>
        </aside>

        <div class="space-y-4">
          <section class="surface-card p-4 md:p-5">
            <div class="section-kicker !mb-2">Линия прохождения</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Главная прогрессия</h2>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Игрок постепенно открывает моды через соседние ветки. Технологии требуют магию, магия требует обработанные материалы,
              а финал требует почти всю сборку.
            </p>

            <div class="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              <div v-for="(step, index) in routeSteps" :key="step" class="guide-route-step">
                <div class="guide-route-step__num">{{ index + 1 }}</div>
                <div class="text-sm font-bold text-slate-100">{{ step }}</div>
              </div>
            </div>
          </section>

          <article v-for="stage in stages" :id="stage.id" :key="stage.id" class="surface-card guide-stage-card p-4 md:p-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div class="min-w-0">
                <div class="section-kicker !mb-2">Этап {{ stage.number }}</div>
                <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">{{ stage.title }}</h2>
                <p class="mt-2 text-sm leading-6 text-slate-400">{{ stage.goal }}</p>
              </div>
              <div class="flex flex-wrap gap-2 md:justify-end">
                <span v-for="tag in stage.tags" :key="tag" class="guide-tag">{{ tag }}</span>
              </div>
            </div>

            <div class="mt-4 grid gap-3 lg:grid-cols-2">
              <div class="dark-list-card !p-4">
                <p class="metric-label">Что открывает</p>
                <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  <li v-for="item in stage.unlocks" :key="item" class="flex gap-2">
                    <span class="text-emerald-300">◆</span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div class="dark-list-card !p-4">
                <p class="metric-label">Чеклист этапа</p>
                <div class="mt-3 grid gap-2">
                  <label v-for="(item, index) in stage.checks" :key="item" class="guide-check-row">
                    <input v-model="checked[checkKey(stage, index)]" type="checkbox" />
                    <span>{{ item }}</span>
                  </label>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="surface-card p-4 md:p-5">
        <div class="section-kicker !mb-2">Связи модов</div>
        <h2 class="text-xl font-black text-slate-50 md:text-2xl">Почему нельзя пропускать ветки</h2>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          В этой версии сборки моды не живут отдельно. Каждый крупный мод даёт ключи для следующего этапа.
        </p>

        <div class="mt-4 overflow-hidden rounded-[22px] border border-white/8">
          <table class="guide-table">
            <thead>
              <tr>
                <th>Мод / этап</th>
                <th>Что даёт</th>
                <th>Что открывает</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in crossLinks" :key="row[0]">
                <td class="font-black text-slate-100">{{ row[0] }}</td>
                <td>{{ row[1] }}</td>
                <td>{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article v-for="group in milestones" :key="group.title" class="surface-card p-4 md:p-5">
          <div class="section-kicker !mb-2">Проверка</div>
          <h2 class="text-lg font-black text-slate-50">{{ group.title }}</h2>
          <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            <li v-for="item in group.items" :key="item" class="guide-milestone-item">{{ item }}</li>
          </ul>
        </article>
      </section>

      <section class="surface-card p-4 md:p-5">
        <div class="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div>
            <div class="section-kicker !mb-2">Советы</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Как проходить без лишней боли</h2>
            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <div class="dark-list-card">
                <p class="text-sm font-black text-slate-100">Не уходи в один мод</p>
                <p class="mt-1.5 text-sm leading-6 text-slate-400">Держи несколько целей одновременно: еда, хранение, Create, магия, сталь и энергия.</p>
              </div>
              <div class="dark-list-card">
                <p class="text-sm font-black text-slate-100">Сохраняй промежуточные компоненты</p>
                <p class="mt-1.5 text-sm leading-6 text-slate-400">VoidRP-компоненты часто используются повторно, поэтому выгоднее делать их партиями.</p>
              </div>
              <div class="dark-list-card">
                <p class="text-sm font-black text-slate-100">Не откладывай магию</p>
                <p class="mt-1.5 text-sm leading-6 text-slate-400">Aether, Mahou, Twilight и DeeperDarker нужны не “когда-нибудь”, а уже для средняя игра.</p>
              </div>
              <div class="dark-list-card">
                <p class="text-sm font-black text-slate-100">Автоматизируй рано</p>
                <p class="mt-1.5 text-sm leading-6 text-slate-400">AE2 придёт позже, но первые Create-линии нужно строить как можно раньше.</p>
              </div>
            </div>
          </div>

          <aside class="guide-faq-card">
            <div class="section-kicker section-kicker--light !mb-2">FAQ</div>
            <h2 class="text-lg font-black text-white">Почему Mekanism не стартует сразу?</h2>
            <p class="mt-2 text-sm leading-6 text-white/72">
              Потому что старт Mekanism завязан на Create, IE и магические компоненты. Это сделано специально,
              чтобы игрок проходил сборку постепенно, а не перескакивал половину контента.
            </p>
          </aside>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.guide-page {
  position: relative;
}

.guide-page::before {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: -1;
  content: '';
  background:
    radial-gradient(circle at 18% 10%, rgba(34, 197, 94, 0.08), transparent 28%),
    radial-gradient(circle at 80% 18%, rgba(109, 93, 246, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(4, 7, 14, 0.0), rgba(9, 14, 26, 0.24));
}

.guide-hero {
  position: relative;
  isolation: isolate;
}

.guide-hero::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  opacity: 0.2;
  background-image:
    linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 28px 28px;
}

.guide-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 1rem;
  align-items: stretch;
}

.guide-progress-card,
.guide-faq-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.35rem;
  background: linear-gradient(180deg, rgba(5, 8, 15, 0.62), rgba(5, 8, 15, 0.28));
  padding: 1rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
}

.guide-info-card {
  position: relative;
  overflow: hidden;
}

.guide-info-card::after {
  position: absolute;
  right: -34px;
  top: -34px;
  width: 92px;
  height: 92px;
  border-radius: 999px;
  content: '';
  opacity: .22;
}

.guide-info-card--green::after { background: #22c55e; }
.guide-info-card--blue::after { background: #38bdf8; }
.guide-info-card--gold::after { background: #facc15; }

.guide-sidebar {
  position: sticky;
  top: 5rem;
  height: fit-content;
}

.guide-side-link {
  display: grid;
  grid-template-columns: 2.15rem minmax(0, 1fr);
  gap: .65rem;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 1rem;
  padding: .6rem .65rem;
  color: rgb(203 213 225);
  text-decoration: none;
  transition: .18s ease;
}

.guide-side-link:hover {
  border-color: rgba(255,255,255,.1);
  background: rgba(255,255,255,.045);
  color: white;
}

.guide-side-link span,
.guide-route-step__num {
  display: grid;
  min-width: 2.15rem;
  height: 2.15rem;
  place-items: center;
  border-radius: .85rem;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.055);
  color: #86efac;
  font-size: .78rem;
  font-weight: 900;
}

.guide-side-link strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: .84rem;
}

.guide-route-step {
  display: grid;
  grid-template-columns: 2.3rem minmax(0, 1fr);
  gap: .7rem;
  align-items: center;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 1rem;
  background: rgba(255,255,255,.035);
  padding: .72rem;
}

.guide-stage-card {
  scroll-margin-top: 5.5rem;
}

.guide-tag {
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 999px;
  background: rgba(255,255,255,.055);
  padding: .42rem .65rem;
  color: rgb(203 213 225);
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.guide-check-row {
  display: grid;
  grid-template-columns: 1.1rem minmax(0, 1fr);
  gap: .65rem;
  align-items: flex-start;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: .95rem;
  background: rgba(255,255,255,.035);
  padding: .7rem .75rem;
  color: rgb(203 213 225);
  font-size: .86rem;
  line-height: 1.55;
  cursor: pointer;
}

.guide-check-row input {
  margin-top: .22rem;
  accent-color: #22c55e;
}

.guide-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(2, 6, 23, 0.28);
}

.guide-table th,
.guide-table td {
  border-bottom: 1px solid rgba(255,255,255,.07);
  padding: .85rem;
  text-align: left;
  vertical-align: top;
}

.guide-table th {
  background: rgba(255,255,255,.055);
  color: rgb(226 232 240);
  font-size: .7rem;
  font-weight: 900;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.guide-table td {
  color: rgb(148 163 184);
  font-size: .88rem;
  line-height: 1.55;
}

.guide-table tr:last-child td {
  border-bottom: 0;
}

.guide-milestone-item {
  border-radius: .85rem;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.035);
  padding: .55rem .65rem;
}

@media (max-width: 1024px) {
  .guide-hero__grid {
    grid-template-columns: 1fr;
  }

  .guide-sidebar {
    position: relative;
    top: 0;
  }
}

@media (max-width: 760px) {
  .guide-table {
    min-width: 760px;
  }
}
</style>
