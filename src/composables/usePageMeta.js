const BASE_URL = 'https://void-rp.ru'
const SITE_NAME = 'VoidRP'
const DEFAULT_IMAGE = `${BASE_URL}/og-cover.jpg`

function setMeta(name, content, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Обновляет все SEO-теги страницы.
 * @param {{ title?: string, description?: string, image?: string, url?: string, noindex?: boolean }} opts
 */
export function usePageMeta(opts = {}) {
  const {
    title = SITE_NAME,
    description = 'VoidRP — Minecraft roleplay сервер с экономикой, государствами и альянсами.',
    image = DEFAULT_IMAGE,
    url = BASE_URL + window.location.pathname,
    noindex = false,
  } = opts

  const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`

  document.title = fullTitle

  setMeta('description', description)
  setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow')

  setMeta('og:title', fullTitle, 'property')
  setMeta('og:description', description, 'property')
  setMeta('og:image', image, 'property')
  setMeta('og:url', url, 'property')
  setMeta('og:type', 'website', 'property')
  setMeta('og:site_name', SITE_NAME, 'property')

  setMeta('twitter:title', fullTitle)
  setMeta('twitter:description', description)
  setMeta('twitter:image', image)

  setLink('canonical', url)
}
