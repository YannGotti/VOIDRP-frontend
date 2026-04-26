<script setup>
import { siteConfig } from '../config.site'

const updatedAt = '26 апреля 2026 года'

const operator = {
  name: 'Администрация проекта VoidRP',
  site: siteConfig.siteUrl,
  email: 'support@void-rp.ru',
  telegram: siteConfig.telegramUrl,
}

const collectedData = [
  'логин аккаунта на сайте',
  'игровой ник Minecraft',
  'адрес электронной почты',
  'пароль в защищённом виде, без хранения открытого пароля',
  'технические данные сессии: токены входа, дата входа, устройство, IP-адрес, user-agent',
  'данные публичного профиля, если пользователь сам их заполняет: отображаемое имя, описание, статус, изображения профиля',
  'данные игрового взаимодействия, связанные с аккаунтом: государство, роль, активность, заявки, публичная статистика',
]

const goals = [
  'регистрация и вход в аккаунт VoidRP',
  'подтверждение электронной почты и восстановление доступа',
  'работа личного кабинета, публичного профиля и лаунчера',
  'связь аккаунта сайта с игровым аккаунтом Minecraft',
  'обеспечение безопасности, защита от взломов, спама, обхода блокировок и нарушений правил',
  'ведение игровой статистики, рейтингов, государств, альянсов и иных публичных игровых разделов',
  'рассылка технических уведомлений, связанных с аккаунтом и безопасностью',
]

const rights = [
  'получить сведения об обработке своих персональных данных',
  'попросить уточнить, заблокировать или удалить некорректные данные',
  'отозвать согласие на обработку персональных данных, если дальнейшая обработка не требуется по закону или для исполнения соглашения',
  'обратиться к администрации проекта по вопросам персональных данных',
  'обжаловать действия оператора в уполномоченный орган по защите прав субъектов персональных данных',
]

const securityMeasures = [
  'использование защищённого соединения HTTPS',
  'хранение паролей только в хэшированном виде',
  'ограничение доступа к административным инструментам',
  'использование токенов доступа и refresh-сессий',
  'ведение технических журналов для безопасности и расследования инцидентов',
  'ограничение обработки данных целями, указанными в настоящей политике',
]
</script>

<template>
  <section class="legal-page py-6 md:py-8">
    <div class="container-shell max-w-5xl space-y-4">
      <section class="surface-card p-5 md:p-7">
        <div class="section-kicker !mb-2">VoidRP</div>
        <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-4xl">
          Политика конфиденциальности и обработки персональных данных
        </h1>
        <p class="mt-4 text-sm leading-7 text-slate-400 md:text-[15px]">
          Настоящая политика описывает, какие данные собирает проект {{ siteConfig.serverName }},
          зачем они используются, как защищаются и как пользователь может обратиться по вопросам обработки данных.
        </p>

        <div class="mt-5 grid gap-3 md:grid-cols-3">
          <div class="legal-mini-card">
            <p class="metric-label">Дата редакции</p>
            <p class="mt-2 text-sm font-semibold text-slate-100">{{ updatedAt }}</p>
          </div>
          <div class="legal-mini-card">
            <p class="metric-label">Сайт</p>
            <p class="mt-2 break-all text-sm font-semibold text-slate-100">{{ operator.site }}</p>
          </div>
          <div class="legal-mini-card">
            <p class="metric-label">Контакт</p>
            <p class="mt-2 break-all text-sm font-semibold text-slate-100">{{ operator.email }}</p>
          </div>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">1. Общие положения</h2>
        <div class="legal-text">
          <p>
            1.1. Оператором персональных данных является {{ operator.name }}, осуществляющая администрирование сайта,
            игрового сервера, лаунчера и связанных сервисов {{ siteConfig.serverName }}.
          </p>
          <p>
            1.2. Используя сайт, регистрируя аккаунт, входя в личный кабинет, используя лаунчер или играя на сервере,
            пользователь подтверждает, что ознакомился с настоящей политикой.
          </p>
          <p>
            1.3. Политика применяется к сайту {{ siteConfig.siteUrl }}, API, личному кабинету, лаунчеру,
            игровому серверу Minecraft и связанным публичным разделам проекта.
          </p>
          <p>
            1.4. Если пользователь не согласен с условиями политики, он должен прекратить регистрацию,
            использование сайта, лаунчера и игрового сервера.
          </p>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">2. Какие данные могут обрабатываться</h2>
        <p class="legal-muted">
          Проект обрабатывает только те данные, которые нужны для регистрации, безопасности, работы аккаунта,
          игрового сервиса и публичных функций.
        </p>

        <div class="mt-4 grid gap-2">
          <div v-for="item in collectedData" :key="item" class="legal-row">
            <span>◆</span>
            <p>{{ item }}</p>
          </div>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">3. Цели обработки данных</h2>
        <div class="mt-4 grid gap-2">
          <div v-for="item in goals" :key="item" class="legal-row">
            <span>◆</span>
            <p>{{ item }}</p>
          </div>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">4. Правовые основания обработки</h2>
        <div class="legal-text">
          <p>
            4.1. Обработка персональных данных осуществляется на основании согласия пользователя,
            настоящей политики, договора оферты, пользовательского соглашения проекта и требований законодательства РФ.
          </p>
          <p>
            4.2. Согласие выражается путём регистрации аккаунта, отправки формы, входа в личный кабинет,
            использования лаунчера или продолжения игры на сервере.
          </p>
          <p>
            4.3. Отдельные технические данные могут обрабатываться для защиты сервиса, предотвращения нарушений,
            расследования инцидентов и обеспечения стабильной работы проекта.
          </p>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">5. Публичные данные</h2>
        <div class="legal-text">
          <p>
            5.1. Часть данных может отображаться публично внутри сайта или игры, если это необходимо для работы
            игровых механик: ник, публичный профиль, государство, роль, рейтинг, статистика, заявки, альянсы,
            активность государства и иные игровые сведения.
          </p>
          <p>
            5.2. Пользователь самостоятельно отвечает за информацию, которую размещает в публичном профиле,
            описаниях, названиях, изображениях и иных открытых разделах.
          </p>
          <p>
            5.3. Администрация вправе скрывать, изменять или удалять публичные материалы, если они нарушают правила
            сервера, законодательство РФ, права третьих лиц или мешают нормальной работе проекта.
          </p>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">6. Передача данных третьим лицам</h2>
        <div class="legal-text">
          <p>
            6.1. Персональные данные не продаются третьим лицам.
          </p>
          <p>
            6.2. Данные могут передаваться техническим поставщикам, если это необходимо для работы сайта,
            хостинга, почтовой отправки, защиты инфраструктуры, аналитики ошибок или платежей, если такие функции подключены.
          </p>
          <p>
            6.3. Данные могут быть предоставлены государственным органам только в случаях и порядке,
            предусмотренных законодательством РФ.
          </p>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">7. Хранение и защита данных</h2>
        <div class="mt-4 grid gap-2">
          <div v-for="item in securityMeasures" :key="item" class="legal-row">
            <span>◆</span>
            <p>{{ item }}</p>
          </div>
        </div>

        <div class="legal-text mt-4">
          <p>
            7.1. Данные хранятся столько, сколько необходимо для работы аккаунта, исполнения соглашения,
            защиты проекта, выполнения требований закона и разрешения возможных споров.
          </p>
          <p>
            7.2. После удаления аккаунта часть технических записей может временно сохраняться в журналах безопасности,
            резервных копиях или административной истории, если это необходимо для защиты проекта и соблюдения закона.
          </p>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">8. Права пользователя</h2>
        <div class="mt-4 grid gap-2">
          <div v-for="item in rights" :key="item" class="legal-row">
            <span>◆</span>
            <p>{{ item }}</p>
          </div>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">9. Cookies и технические идентификаторы</h2>
        <div class="legal-text">
          <p>
            9.1. Сайт может использовать cookies, localStorage и аналогичные технологии для сохранения сессии,
            входа в аккаунт, работы интерфейса, защиты от ошибок и улучшения пользовательского опыта.
          </p>
          <p>
            9.2. Пользователь может ограничить использование cookies в настройках браузера, но часть функций сайта
            может работать некорректно.
          </p>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">10. Обращения по персональным данным</h2>
        <div class="legal-text">
          <p>
            10.1. По вопросам обработки персональных данных пользователь может обратиться к администрации проекта.
          </p>
          <p>
            Email: <a class="legal-link" :href="`mailto:${operator.email}`">{{ operator.email }}</a>
          </p>
          <p>
            Telegram: <a class="legal-link" :href="operator.telegram" target="_blank" rel="noreferrer">{{ operator.telegram }}</a>
          </p>
          <p>
            10.2. В обращении нужно указать аккаунт, email, суть запроса и сведения, позволяющие подтвердить,
            что запрос относится именно к аккаунту заявителя.
          </p>
        </div>
      </section>

      <section class="surface-card p-5 md:p-7">
        <h2 class="legal-title">11. Изменение политики</h2>
        <div class="legal-text">
          <p>
            11.1. Администрация может обновлять настоящую политику. Новая редакция вступает в силу с момента
            публикации на сайте, если в тексте не указана иная дата.
          </p>
          <p>
            11.2. Продолжение использования сайта, лаунчера или игрового сервера после публикации новой редакции
            означает согласие пользователя с обновлёнными условиями.
          </p>
        </div>
      </section>

      <div class="flex flex-wrap gap-3">
        <RouterLink to="/register" class="btn btn-outline">Вернуться к регистрации</RouterLink>
        <RouterLink to="/" class="btn btn-ghost">На главную</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.legal-page {
  position: relative;
}

.legal-mini-card,
.legal-row {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  background: rgba(2, 6, 23, 0.38);
}

.legal-mini-card {
  padding: 0.9rem;
}

.legal-title {
  color: rgb(248 250 252);
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.legal-muted {
  margin-top: 0.7rem;
  color: rgb(148 163 184);
  font-size: 0.92rem;
  line-height: 1.75;
}

.legal-text {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.9rem;
  color: rgb(203 213 225);
  font-size: 0.92rem;
  line-height: 1.75;
}

.legal-row {
  display: grid;
  grid-template-columns: 1.2rem minmax(0, 1fr);
  gap: 0.65rem;
  align-items: flex-start;
  padding: 0.8rem 0.9rem;
  color: rgb(203 213 225);
  font-size: 0.9rem;
  line-height: 1.65;
}

.legal-row span {
  color: rgb(167 139 250);
}

.legal-link {
  color: rgb(196 181 253);
  font-weight: 800;
  text-decoration: none;
}

.legal-link:hover {
  color: white;
}
</style>