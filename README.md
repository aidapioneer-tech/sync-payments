# sync-payments

Приложение Bitrix24 «Распределение оплат». Встраивается во вкладку карточки
смарт-процесса «Оплаты» и помогает распределять пришедший платёж по связанным
сделкам клиента.

## Стек

- Nuxt 4 (Vue 3, SPA — `ssr: false`, статическая генерация)
- Tailwind 4 + UI-кит `@bitrix24/b24ui-nuxt` и иконки `@bitrix24/b24icons-vue`
- Bitrix24 SDK `@bitrix24/b24jssdk` (+ `@bitrix24/b24jssdk-nuxt`)
- pnpm, Node 22+, TypeScript (strict), ESLint + Prettier, Vitest

Тип приложения — **LOCAL** (одно-портальный режим). Правила разработки см. в
[CLAUDE.md](CLAUDE.md).

## Требования

- Node.js 22+
- pnpm (версия зафиксирована в поле `packageManager`)

## Команды

```bash
pnpm install            # установка зависимостей
pnpm dev                # дев-сервер
pnpm generate           # production-сборка в .output/public
pnpm lint               # eslint
pnpm typecheck          # nuxt typecheck (vue-tsc, strict)
pnpm test               # vitest
pnpm format             # prettier --write
./verify.sh             # полный прогон DoD (verify.ps1 для Windows)
```

## Адреса (prod)

- https://app.aidapioneer.by/sync-payments/index.html
- https://app.aidapioneer.by/sync-payments/install.html

## Запрашиваемые scope Bitrix24

- `user_brief`
- `placement`
- `crm`
