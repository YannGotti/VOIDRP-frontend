# VoidRP Site Starter

Готовая стартовая структура под **Vue 3 + Vite + Vue Router + Tailwind CSS v4 + daisyUI v5**.

## Быстрый старт на Linux

### 1. Проверить Node.js
Нужен Node.js версии `^20.19.0 || >=22.12.0`.

```bash
node -v
```

### 2. Создать проект
Если у тебя Yarn Modern:

```bash
yarn create vue@latest voidrp-site
```

Если команда не сработает:

```bash
yarn dlx create-vue@latest voidrp-site
```

### 3. Выбрать опции
При создании проекта выбери:

- TypeScript: **No**
- JSX: **No**
- Vue Router: **Yes**
- Pinia: **No**
- Vitest: **No**
- E2E: **No**
- ESLint: **Yes**
- Prettier: **Yes** (по желанию)

### 4. Перейти в проект
```bash
cd voidrp-site
```

### 5. Поставить Tailwind и daisyUI
```bash
yarn add -D tailwindcss @tailwindcss/vite daisyui
```

### 6. Заменить файлы из этого архива в свой проект
Скопируй содержимое папок и файлов в свой `voidrp-site`.

### 7. Установить зависимости и запустить
```bash
yarn
yarn dev --host
```

Сайт будет доступен по адресу вроде:

```bash
http://<твой-ip>:5173
```

## Production build
```bash
yarn build
```

Собранный сайт будет в папке `dist/`.

## .env
Создай файл `.env` в корне проекта по примеру `.env.example`.

## Пример JSON для статуса сервера
Фронт ожидает такой ответ от `VITE_STATUS_ENDPOINT`:

```json
{
  "online": true,
  "playersOnline": 7,
  "playersMax": 100,
  "version": "1.21.1",
  "motd": "VoidRP x Better MC 5",
  "latency": 42,
  "samplePlayers": ["YannGotti", "Player2", "Player3"]
}
```

# VOIDRP-frontend
