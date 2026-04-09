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
    title: 'Большой модовый мир и удобный вход через официальный лаунчер',
    description:
      'На VoidRP тебя ждёт красивый мир, карта сервера, удобный старт и один аккаунт для сайта и лаунчера.',
  },
  features: [
    {
      title: 'Один аккаунт',
      description:
        'Создай аккаунт один раз и используй его и на сайте, и в официальном лаунчере.',
      icon: '🔐',
    },
    {
      title: 'Простой старт',
      description:
        'Зарегистрируйся, скачай лаунчер и заходи в игру без долгой ручной настройки.',
      icon: '🚀',
    },
    {
      title: 'Личный кабинет',
      description:
        'В профиле можно проверить свои данные, почту и позже управлять игровыми возможностями.',
      icon: '👤',
    },
    {
      title: 'Карта и новости',
      description:
        'Карта мира, полезные ссылки и новости проекта собраны в одном месте.',
      icon: '🗺️',
    },
  ],
}
