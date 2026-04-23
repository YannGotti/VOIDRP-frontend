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
    badge: 'VoidRP • официальный вход через сайт и лаунчер',
    title: 'Заходи на VOID RP',
    description:
      'Создай аккаунт, подтверди почту, скачай официальный лаунчер и заходи в игру. Сайт объясняет всё простым языком и ведёт по шагам.',
  },
  features: [
    {
      title: 'Один аккаунт',
      description:
        'Сайт, кабинет, профиль и официальный лаунчер работают через один вход без лишних действий.',
      icon: '🔐',
    },
    {
      title: 'Быстрый старт',
      description:
        'Регистрация, подтверждение почты и запуск игры собраны в понятную последовательность шагов.',
      icon: '🚀',
    },
    {
      title: 'Удобный профиль',
      description:
        'Можно настроить аватар, баннер, фон и описание, чтобы страница игрока выглядела живо и аккуратно.',
      icon: '🧩',
    },
    {
      title: 'Всё важное рядом',
      description:
        'Государства, рейтинг, карта мира и нужные ссылки доступны в одном месте без перегруженного интерфейса.',
      icon: '🗺️',
    },
  ],
}
