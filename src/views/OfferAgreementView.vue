<script setup>
import { siteConfig } from '../config.site'

const updatedAt = '26 апреля 2026 года'

const operator = {
  name: 'Миронов А.А. (физическое лицо)',
  site: siteConfig.siteUrl,
  email: 'support@void-rp.ru',
  telegram: siteConfig.telegramUrl,
}

const toc = [
  { id: 'terms',       label: 'Термины' },
  { id: 'acceptance',  label: 'Акцепт оферты' },
  { id: 'subject',     label: 'Предмет договора' },
  { id: 'account',     label: 'Регистрация и аккаунт' },
  { id: 'rights',      label: 'Права пользователя' },
  { id: 'duties',      label: 'Обязанности пользователя' },
  { id: 'prohibited',  label: 'Запрещённые действия' },
  { id: 'content',     label: 'Контент и права на объекты' },
  { id: 'admin',       label: 'Права администрации' },
  { id: 'moderation',  label: 'Модерация' },
  { id: 'gamerul',     label: 'Игровые правила' },
  { id: 'paid',        label: 'Платные функции' },
  { id: 'liability',   label: 'Ограничение ответственности' },
  { id: 'personal',    label: 'Персональные данные' },
  { id: 'changes',     label: 'Изменение условий' },
  { id: 'contact',     label: 'Контакты' },
]

const serviceIncludes = [
  'доступ к сайту и публичным страницам проекта',
  'регистрацию и использование аккаунта VoidRP',
  'личный кабинет и настройки публичного профиля',
  'загрузку и использование официального лаунчера',
  'доступ к игровому серверу Minecraft при соблюдении технических требований и правил',
  'участие в игровых механиках: государства, альянсы, рейтинги, профиль, статистика и иные разделы',
]

const userDuties = [
  'указывать достоверные данные при регистрации аккаунта',
  'не передавать аккаунт, токены, пароли и доступ к лаунчеру третьим лицам',
  'соблюдать правила сервера, Discord/Telegram-сообщества и внутриигровые правила проекта',
  'самостоятельно обеспечивать безопасность своего устройства, почты и пароля',
]

const prohibitedActions = [
  'использовать чит-клиенты, эксплойты, макросы и запрещённые модификации',
  'намеренно применять уязвимости игрового кода или дюп-механики',
  'оскорблять, угрожать или преследовать других игроков и администрацию',
  'распространять спам, постороннюю рекламу и вредоносные ссылки',
  'выдавать себя за администрацию или другого пользователя',
  'пытаться получить несанкционированный доступ к сервисам и аккаунтам',
  'публиковать запрещённый контент: экстремистский, насильственный, дискриминационный или незаконный',
  'создавать несколько аккаунтов для обхода наказаний, ограничений или игровых лимитов',
]

const adminRights = [
  'ограничить или заблокировать доступ при нарушении правил проекта',
  'удалить или скрыть публичные материалы, нарушающие правила или закон',
  'изменять игровые механики, баланс, цены, правила, состав модов и технические требования',
  'проводить технические работы, перезапуски, обновления и временно ограничивать доступ к сервисам',
  'исправлять последствия багов, откатывать ошибочные операции, удалять дубли и некорректные игровые значения',
  'отказать в обслуживании при попытках вреда проекту, обхода ограничений или угроз безопасности',
]

const limitations = [
  'проект может быть временно недоступен из-за технических работ, аварий, атак, обновлений или внешних причин',
  'игровой прогресс может изменяться из-за баланса, исправления багов, обновлений модов или правил',
  'администрация не гарантирует постоянную доступность конкретных модов, предметов, регионов, механик или цен',
  'пользователь отвечает за совместимость своего устройства, Java, лаунчера, модпака и сетевого подключения',
]
</script>

<template>
  <div id="top" class="py-6 md:py-8">
    <div class="container-shell max-w-5xl">

      <!-- Hero -->
      <div class="legal-hero mb-5">
        <div class="legal-hero__badge">Публичная оферта</div>
        <h1 class="legal-hero__title">
          Договор оферты на использование<br class="hidden sm:block"> сервисов VoidRP
        </h1>
        <p class="legal-hero__desc">
          Настоящий документ является публичной офертой и определяет условия использования сайта,
          аккаунта, лаунчера, игрового сервера Minecraft и связанных сервисов {{ siteConfig.serverName }}.
        </p>

        <div class="legal-hero__meta">
          <div class="legal-meta-cell">
            <p class="metric-label">Дата редакции</p>
            <p class="legal-meta-val">{{ updatedAt }}</p>
          </div>
          <div class="legal-meta-cell">
            <p class="metric-label">Сайт</p>
            <p class="legal-meta-val break-all">{{ operator.site }}</p>
          </div>
          <div class="legal-meta-cell">
            <p class="metric-label">Контакт</p>
            <p class="legal-meta-val break-all">{{ operator.email }}</p>
          </div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="legal-layout">

        <!-- Sticky TOC sidebar -->
        <aside class="legal-toc">
          <p class="legal-toc__heading">Содержание</p>
          <nav class="legal-toc__nav">
            <a
              v-for="(item, i) in toc"
              :key="item.id"
              :href="`#${item.id}`"
              class="legal-toc__link"
            >
              <span class="legal-toc__num">{{ i + 1 }}</span>
              {{ item.label }}
            </a>
          </nav>
          <div class="legal-toc__footer">
            <a href="#top" class="legal-toc__top">↑ Наверх</a>
            <RouterLink to="/privacy" class="legal-toc__doc">Политика конф. →</RouterLink>
          </div>
        </aside>

        <!-- Content -->
        <div class="legal-sections">

          <section id="terms" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">1</span>Термины</h2>
            <div class="legal-text">
              <p>
                1.1. Проект — информационно-развлекательный игровой проект {{ siteConfig.serverName }},
                включающий сайт, API, личный кабинет, лаунчер, игровой сервер Minecraft и связанные разделы.
              </p>
              <p>
                1.2. Администрация — {{ operator.name }}, управляющий проектом и определяющий правила его работы.
              </p>
              <p>
                1.3. Пользователь — физическое лицо, которое регистрирует аккаунт, использует сайт, лаунчер,
                игровой сервер или иные сервисы проекта.
              </p>
              <p>
                1.4. Аккаунт — учётная запись пользователя, связанная с логином, email, игровым ником Minecraft
                и техническими данными доступа.
              </p>
              <p>
                1.5. Пользовательский контент — текстовые и графические материалы, размещаемые пользователем
                в публичных разделах сайта: описания профиля, изображения и иные публикации.
                Игровые объекты, постройки, предметы и валюта пользовательским контентом не являются.
              </p>
              <p>
                1.6. Акцепт — полное и безоговорочное принятие условий настоящей оферты.
              </p>
            </div>
          </section>

          <section id="acceptance" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">2</span>Акцепт оферты</h2>
            <div class="legal-text">
              <p>
                2.1. Акцептом оферты считается любое из следующих действий: регистрация аккаунта, вход в личный кабинет,
                подтверждение почты, запуск лаунчера, вход на игровой сервер, продолжение игры после публикации условий.
              </p>
              <p>
                2.2. Совершая акцепт, пользователь подтверждает, что прочитал оферту, понял её условия и согласен их соблюдать.
              </p>
              <p>
                2.3. Если пользователь не согласен с условиями оферты, он обязан прекратить использование сайта,
                лаунчера и игрового сервера.
              </p>
            </div>
          </section>

          <section id="subject" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">3</span>Предмет договора</h2>
            <p class="legal-muted">
              Администрация предоставляет пользователю доступ к сервисам проекта при условии соблюдения настоящей оферты,
              политики конфиденциальности, правил сервера и технических требований.
            </p>
            <div class="mt-4 grid gap-2">
              <div v-for="item in serviceIncludes" :key="item" class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>{{ item }}</p>
              </div>
            </div>
          </section>

          <section id="account" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">4</span>Регистрация и аккаунт</h2>
            <div class="legal-text">
              <p>
                4.1. Для доступа к части функций пользователь создаёт аккаунт, указывает логин, игровой ник,
                email и пароль.
              </p>
              <p>
                4.2. Для регистрации аккаунта пользователю должно быть не менее 13 лет. Если регистрация требует
                согласия законного представителя, пользователь обязан получить его самостоятельно.
              </p>
              <p>
                4.3. Один пользователь может иметь только один аккаунт. Регистрация нескольких аккаунтов одним
                человеком разрешается только с явного согласия администрации.
              </p>
              <p>
                4.4. Пользователь обязан хранить пароль и доступ к почте в безопасности. Все действия,
                совершённые через аккаунт пользователя, считаются действиями владельца аккаунта, пока не доказано обратное.
              </p>
              <p>
                4.5. Администрация вправе ограничить доступ к аккаунту при подозрении на взлом, нарушение правил,
                обход авторизации или угрозу безопасности проекта.
              </p>
            </div>
          </section>

          <section id="rights" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">5</span>Права пользователя</h2>
            <div class="legal-text">
              <p>5.1. Пользователь имеет право:</p>
            </div>
            <div class="mt-3 grid gap-2">
              <div class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>использовать весь доступный функционал проекта в рамках настоящей оферты и правил сервера</p>
              </div>
              <div class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>участвовать в игровых механиках: государства, альянсы, рейтинги, рынок, публичный профиль</p>
              </div>
              <div class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>размещать контент в публичном профиле и других доступных разделах в рамках правил проекта</p>
              </div>
              <div class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>обращаться в администрацию по вопросам аккаунта, технических проблем, нарушений и спорных ситуаций</p>
              </div>
              <div class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>запросить удаление своего аккаунта, обратившись к администрации через email или Telegram</p>
              </div>
              <div class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>сообщить о нарушениях правил другими пользователями или об ошибках в работе проекта</p>
              </div>
            </div>
          </section>

          <section id="duties" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">6</span>Обязанности пользователя</h2>
            <div class="mt-4 grid gap-2">
              <div v-for="item in userDuties" :key="item" class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>{{ item }}</p>
              </div>
            </div>
          </section>

          <section id="prohibited" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">7</span>Запрещённые действия</h2>
            <div class="legal-text">
              <p>7.1. Пользователю запрещается:</p>
            </div>
            <div class="mt-3 grid gap-2">
              <div v-for="item in prohibitedActions" :key="item" class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>{{ item }}</p>
              </div>
            </div>
            <div class="legal-text mt-4">
              <p>
                7.2. Запрещённые действия определяются настоящей офертой, правилами сервера и законодательством РФ.
                Незнание правил не освобождает пользователя от ответственности.
              </p>
            </div>
          </section>

          <section id="content" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">8</span>Контент и права на объекты проекта</h2>
            <div class="legal-text">
              <p>
                8.1. Весь контент игрового мира — постройки, предметы, игровая валюта, регионы, территории,
                названия государств и альянсов, игровые объекты и иные элементы — является частью сервиса
                и принадлежит администрации проекта.
              </p>
              <p>
                8.2. Пользователь не приобретает права собственности ни на какие объекты игрового мира
                в результате игровой деятельности, независимо от времени, усилий или вложений.
              </p>
              <p>
                8.3. Размещая текстовый или графический контент в публичных разделах сайта (профиль, описание,
                изображения), пользователь предоставляет администрации право на его хранение и отображение
                в рамках сервиса.
              </p>
              <p>
                8.4. Пользователь самостоятельно несёт ответственность за содержание публикуемых материалов.
                Администрация вправе удалить или изменить любой контент, нарушающий правила проекта,
                настоящую оферту или законодательство РФ.
              </p>
            </div>
          </section>

          <section id="admin" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">9</span>Права администрации</h2>
            <div class="mt-4 grid gap-2">
              <div v-for="item in adminRights" :key="item" class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>{{ item }}</p>
              </div>
            </div>
          </section>

          <section id="moderation" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">10</span>Модерация и меры воздействия</h2>
            <div class="legal-text">
              <p>
                10.1. Администрация вправе применять меры воздействия при нарушении настоящей оферты или правил сервера,
                в том числе без предварительного уведомления пользователя, если нарушение требует немедленного реагирования.
              </p>
            </div>
            <div class="mt-4 grid gap-2">
              <div class="legal-row"><span class="legal-row__bullet">◆</span><p>предупреждение</p></div>
              <div class="legal-row"><span class="legal-row__bullet">◆</span><p>временное ограничение отдельных функций аккаунта</p></div>
              <div class="legal-row"><span class="legal-row__bullet">◆</span><p>временная блокировка аккаунта или доступа к серверу</p></div>
              <div class="legal-row"><span class="legal-row__bullet">◆</span><p>постоянная блокировка при систематических или грубых нарушениях</p></div>
            </div>
            <div class="legal-text mt-4">
              <p>
                10.2. Администрация не несёт ответственности за действия пользователей и их последствия,
                однако принимает разумные меры по обеспечению безопасной среды в проекте.
              </p>
            </div>
          </section>

          <section id="gamerul" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">11</span>Игровые правила, баланс и виртуальные объекты</h2>
            <div class="legal-text">
              <p>
                11.1. Игровые предметы, валюта, регионы, роли, очки, рейтинги, государства, альянсы и иные игровые элементы
                являются частью игрового процесса и не являются денежными средствами или имуществом пользователя.
              </p>
              <p>
                11.2. Администрация вправе изменять баланс, рецепты, цены, награды, правила экономики, ограничения,
                права ролей и иные игровые параметры.
              </p>
              <p>
                11.3. При обнаружении бага, дюпа, ошибки начисления или некорректной операции администрация вправе
                исправить последствия, включая списание ошибочно полученных значений, откат операций или блокировку нарушителей.
              </p>
              <p>
                11.4. Использование ошибок, эксплойтов, уязвимостей, обходов авторизации, читов, запрещённых модификаций
                или автоматизации, нарушающей правила сервера, запрещено.
              </p>
            </div>
          </section>

          <section id="paid" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">12</span>Платные функции и поддержка проекта</h2>
            <div class="legal-text">
              <p>
                12.1. Если на проекте подключаются платные цифровые функции, пожертвования, подписки или иные способы
                поддержки, их условия указываются на соответствующей странице оплаты или описания услуги.
              </p>
              <p>
                12.2. Платная поддержка проекта является добровольной дополнительной опцией и не является
                обязательным условием использования сервиса.
              </p>
              <p>
                12.3. Добровольная поддержка проекта не является покупкой права нарушать правила, обходить ограничения,
                требовать индивидуального преимущества или вмешательства в игровой баланс.
              </p>
              <p>
                12.4. Возвраты по платным функциям рассматриваются администрацией с учётом характера услуги,
                факта её оказания, технических логов, правил платёжной системы и требований законодательства РФ.
              </p>
            </div>
          </section>

          <section id="liability" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">13</span>Ограничение ответственности</h2>
            <div class="legal-text">
              <p>
                13.1. Сервис предоставляется «как есть» без каких-либо гарантий бесперебойной работы,
                доступности конкретных игровых функций или сохранности внутриигрового прогресса.
              </p>
              <p>
                13.2. Пользователь несёт ответственность за нарушение правил проекта, законодательства РФ,
                прав других пользователей и третьих лиц.
              </p>
              <p>
                13.3. Администрация не отвечает за невозможность доступа к проекту, если она вызвана действиями
                пользователя, его устройством, интернет-провайдером, блокировками, сторонним ПО, модами,
                настройками firewall/антивируса или иными внешними причинами.
              </p>
              <p>
                13.4. Администрация не несёт ответственности за пользовательский контент, сообщения, названия,
                изображения, постройки и иные материалы, размещённые игроками, но вправе модерировать их.
              </p>
            </div>
            <div class="mt-4 grid gap-2">
              <div v-for="item in limitations" :key="item" class="legal-row">
                <span class="legal-row__bullet">◆</span>
                <p>{{ item }}</p>
              </div>
            </div>
          </section>

          <section id="personal" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">14</span>Персональные данные</h2>
            <div class="legal-text">
              <p>
                14.1. Обработка персональных данных осуществляется в соответствии с политикой конфиденциальности проекта.
              </p>
              <p>
                14.2. Правовым основанием обработки персональных данных является:
              </p>
            </div>
            <div class="mt-3 grid gap-2">
              <div class="legal-row"><span class="legal-row__bullet">◆</span><p>согласие пользователя</p></div>
              <div class="legal-row"><span class="legal-row__bullet">◆</span><p>необходимость исполнения настоящего договора оферты</p></div>
            </div>
            <div class="legal-text mt-4">
              <p>
                14.3. Регистрируясь и используя проект, пользователь соглашается с обработкой данных,
                необходимых для работы аккаунта, сайта, лаунчера, безопасности и игровых функций.
              </p>
              <p>
                14.4. Политика конфиденциальности доступна по адресу:
                <RouterLink to="/privacy" class="legal-link">void-rp.ru/privacy</RouterLink>.
              </p>
            </div>
          </section>

          <section id="changes" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">15</span>Изменение условий</h2>
            <div class="legal-text">
              <p>
                15.1. Администрация вправе изменять настоящую оферту. Актуальная редакция всегда доступна на сайте.
                Новая версия вступает в силу с момента публикации, если в ней не указана иная дата.
              </p>
              <p>
                15.2. Продолжение использования проекта после публикации новой редакции означает согласие
                пользователя с обновлёнными условиями.
              </p>
            </div>
          </section>

          <section id="contact" class="surface-card legal-section">
            <h2 class="legal-title"><span class="legal-num">16</span>Контакты</h2>
            <div class="legal-text">
              <p>
                По вопросам настоящей оферты, аккаунта, доступа и спорных ситуаций можно обратиться
                к администрации проекта.
              </p>
              <p>
                Email: <a class="legal-link" :href="`mailto:${operator.email}`">{{ operator.email }}</a>
              </p>
              <p>
                Telegram: <a class="legal-link" :href="operator.telegram" target="_blank" rel="noreferrer">{{ operator.telegram }}</a>
              </p>
            </div>
          </section>

          <!-- Bottom nav -->
          <div class="legal-bottom-nav">
            <RouterLink to="/register" class="btn btn-outline btn-sm">← Регистрация</RouterLink>
            <RouterLink to="/" class="btn btn-ghost btn-sm">На главную</RouterLink>
            <RouterLink to="/privacy" class="btn btn-ghost btn-sm ml-auto">Политика конф. →</RouterLink>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Hero ─────────────────────────────────────────────── */
.legal-hero {
  border: 1px solid rgba(139, 92, 246, 0.22);
  border-radius: 24px;
  background:
    radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.28) 0%, transparent 48%),
    linear-gradient(135deg, rgba(22, 28, 52, 0.98), rgba(10, 14, 28, 1));
  padding: 1.75rem 1.75rem 1.5rem;
}

.legal-hero__badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(139, 92, 246, 0.28);
  background: rgba(139, 92, 246, 0.12);
  padding: .32rem .8rem;
  font-size: .65rem;
  font-weight: 800;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #c4b0ff;
  margin-bottom: .9rem;
}

.legal-hero__title {
  font-size: clamp(1.35rem, 3.5vw, 2rem);
  font-weight: 900;
  letter-spacing: -.035em;
  color: #f8fbff;
  line-height: 1.15;
  margin: 0 0 .75rem;
}

.legal-hero__desc {
  font-size: .9rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, .5);
  margin: 0 0 1.25rem;
  max-width: 64ch;
}

.legal-hero__meta {
  display: grid;
  gap: .75rem;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

.legal-meta-cell {
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 12px;
  background: rgba(0, 0, 0, .18);
  padding: .75rem .9rem;
}

.legal-meta-val {
  margin-top: .35rem;
  font-size: .85rem;
  font-weight: 700;
  color: rgb(226 232 240);
}

/* ── Layout ───────────────────────────────────────────── */
.legal-layout {
  display: grid;
  gap: 1.25rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .legal-layout {
    grid-template-columns: 200px 1fr;
  }
}

/* ── TOC sidebar ──────────────────────────────────────── */
.legal-toc {
  display: none;
}

@media (min-width: 1024px) {
  .legal-toc {
    display: flex;
    flex-direction: column;
    gap: .2rem;
    position: sticky;
    top: 5rem;
    border: 1px solid rgba(255, 255, 255, .07);
    border-radius: 18px;
    background: rgba(255, 255, 255, .02);
    padding: 1rem;
  }
}

.legal-toc__heading {
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin: 0 0 .6rem;
  padding: 0 .35rem;
}

.legal-toc__nav {
  display: flex;
  flex-direction: column;
  gap: .1rem;
}

.legal-toc__link {
  display: flex;
  align-items: center;
  gap: .5rem;
  border-radius: 8px;
  padding: .38rem .5rem;
  font-size: .78rem;
  font-weight: 600;
  color: rgb(100 116 139);
  transition: background .15s, color .15s;
  line-height: 1.35;
}

.legal-toc__link:hover {
  background: rgba(139, 92, 246, .1);
  color: #d4c4ff;
}

.legal-toc__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.3rem;
  height: 1.3rem;
  border-radius: 5px;
  background: rgba(139, 92, 246, .14);
  color: rgb(167 139 250);
  font-size: .62rem;
  font-weight: 900;
  flex-shrink: 0;
}

.legal-toc__footer {
  display: flex;
  flex-direction: column;
  gap: .3rem;
  margin-top: .8rem;
  padding-top: .8rem;
  border-top: 1px solid rgba(255, 255, 255, .06);
}

.legal-toc__top,
.legal-toc__doc {
  border-radius: 8px;
  padding: .38rem .5rem;
  font-size: .76rem;
  font-weight: 700;
  color: rgb(100 116 139);
  transition: color .15s;
}

.legal-toc__top:hover { color: #fff; }
.legal-toc__doc:hover { color: #c4b0ff; }

/* ── Content sections ─────────────────────────────────── */
.legal-sections {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.legal-section {
  padding: 1.25rem 1.5rem;
  scroll-margin-top: 5.5rem;
}

@media (min-width: 768px) {
  .legal-section { padding: 1.5rem 1.75rem; }
}

.legal-title {
  display: flex;
  align-items: center;
  gap: .6rem;
  color: rgb(248 250 252);
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: -.02em;
  margin: 0;
}

.legal-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.55rem;
  height: 1.55rem;
  border-radius: 7px;
  background: rgba(139, 92, 246, .18);
  color: rgb(167 139 250);
  font-size: .7rem;
  font-weight: 900;
  flex-shrink: 0;
}

.legal-muted {
  margin-top: .7rem;
  color: rgb(148 163 184);
  font-size: .9rem;
  line-height: 1.75;
}

.legal-text {
  display: grid;
  gap: .7rem;
  margin-top: .9rem;
  color: rgb(203 213 225);
  font-size: .9rem;
  line-height: 1.8;
}

.legal-row {
  display: grid;
  grid-template-columns: 1.1rem minmax(0, 1fr);
  gap: .6rem;
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 10px;
  background: rgba(2, 6, 23, .3);
  padding: .75rem .9rem;
  color: rgb(203 213 225);
  font-size: .88rem;
  line-height: 1.7;
}

.legal-row__bullet {
  color: rgb(167 139 250);
  margin-top: .05rem;
  font-size: .65rem;
}

.legal-link {
  color: rgb(196 181 253);
  font-weight: 800;
  text-decoration: none;
}

.legal-link:hover { color: #fff; }

/* ── Bottom nav ───────────────────────────────────────── */
.legal-bottom-nav {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin-top: .25rem;
}
</style>
