export const siteConfig = {
  siteUrl: 'https://void-rp.ru',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.void-rp.ru/api/v1',
  serverName: 'VoidRP',
  serverIp: 'void-rp.ru',
  serverVersion: '1.21.1',
  launcherPortableUrl:
    import.meta.env.VITE_LAUNCHER_PORTABLE_URL ||
    'https://void-rp.ru/launcher/self-update/VoidRpLauncher.exe',
  dynmapUrl: 'https://void-rp.ru/map',
  discordUrl: 'https://discord.gg/yourinvite',
  telegramUrl: 'https://t.me/voidRPminecraft',
  monitoringChartUrl: 'https://minecraftrating.ru/server_chart/396033/',
  hero: {
    badge: 'VoidRP • Better MC 5',
    title: 'Большой модовый мир и удобный старт через официальный лаунчер',
    description:
      'Добро пожаловать на VoidRP — сервер по сборке Better MC 5 с красивым миром, онлайн-картой и единым аккаунтом для сайта и лаунчера.',
  },
  features: [
    {
      title: 'Единый аккаунт',
      description:
        'Один аккаунт для сайта, лаунчера и будущего игрового входа без лишних ручных действий.',
      icon: '🔐',
    },
    {
      title: 'Быстрый старт',
      description:
        'Зарегистрируйся, скачай лаунчер и заходи на сервер без поиска нужных файлов вручную.',
      icon: '🚀',
    },
    {
      title: 'Профиль игрока',
      description:
        'Управляй аккаунтом, следи за статусом почты и позже сможешь работать со скином и статистикой.',
      icon: '👤',
    },
    {
      title: 'Карта и сообщество',
      description:
        'Карта мира, новости проекта и полезные ссылки доступны в одном месте.',
      icon: '🗺️',
    },
  ],
}
