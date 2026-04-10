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
    title: 'Большой модовый мир с понятным стартом через официальный лаунчер',
    description:
      'Создай аккаунт, скачай лаунчер и заходи на сервер без ручной настройки. Всё важное для старта уже собрано на сайте.',
  },
  features: [
    {
      title: 'Один вход для всего',
      description:
        'Один аккаунт подходит для сайта, профиля и официального лаунчера.',
      icon: '🔐',
    },
    {
      title: 'Понятный старт',
      description:
        'Сайт показывает путь по шагам: регистрация, скачивание лаунчера и вход в игру.',
      icon: '🚀',
    },
    {
      title: 'Личный кабинет',
      description:
        'В профиле виден твой ник, почта и важные действия по аккаунту.',
      icon: '👤',
    },
    {
      title: 'Карта и новости',
      description:
        'Карта мира, Telegram и полезные ссылки находятся в одном месте.',
      icon: '🗺️',
    },
  ],
}
