import { siteConfig } from '../config.site'

export const primaryNavigation = [
  { label: 'Главная', to: '/', exact: true },
  { label: 'Государства', to: '/nations' },
  { label: 'Рейтинг', to: '/nations/rankings' },
  { label: 'Альянсы', to: '/alliances' },
  { label: 'Ссылки', to: '/links' },
]

export const externalNavigation = [
  { label: 'Карта', href: siteConfig.dynmapUrl },
]