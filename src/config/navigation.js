import { siteConfig } from '../config.site'

export const primaryNavigation = [
  { label: 'Главная', to: '/', exact: true },
  { label: 'Гайд', to: '/guide' },
  { label: 'Рынок', to: '/market' },
  { label: 'Государства', to: '/nations' },
  { label: 'Рейтинг', to: '/nations/rankings' },
  { label: 'Альянсы', to: '/alliances' },
  { label: 'Ссылки', to: '/links' },
]

export const externalNavigation = [
  { label: 'Карта', href: siteConfig.dynmapUrl },
  { label: 'Discord', href: siteConfig.discordUrl },
]
