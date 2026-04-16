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
    badge: 'VoidRP • официальный старт через лаунчер',
    title: 'Большой модовый мир без ручной настройки клиента',
    description:
      'Создай аккаунт, скачай официальный лаунчер и заходи на сервер без путаницы. Сайт показывает только то, что действительно нужно обычному игроку.',
  },
  features: [
    {
      title: 'Один аккаунт',
      description:
        'Сайт, публичный профиль и официальный лаунчер работают через один вход без лишних шагов.',
      icon: '🔐',
    },
    {
      title: 'Понятный путь к игре',
      description:
        'Регистрация, письмо подтверждения, загрузка лаунчера и запуск собраны в одну ясную цепочку.',
      icon: '🚀',
    },
    {
      title: 'Живой профиль игрока',
      description:
        'Аватар, баннер, фон и описание действительно меняют внешний вид публичной страницы.',
      icon: '🧩',
    },
    {
      title: 'Сообщества и карта',
      description:
        'Государства, рейтинг и карта мира доступны в одном чистом интерфейсе без визуального мусора.',
      icon: '🗺️',
    },
  ],
}
