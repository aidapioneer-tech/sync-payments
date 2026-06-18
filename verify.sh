#!/usr/bin/env bash
#
# verify.sh — единая проверка "Definition of Done" перед коммитом / PR.
# Прогоняет установку, prettier, линт, тайпчек, паритет i18n-ключей, тесты
# и production-сборку. Падает на первой же ошибке (set -e). Зеркало — verify.ps1.
#
set -euo pipefail

cd "$(dirname "$0")"

echo "==> [1/7] pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile

echo "==> [2/7] format:check (prettier)"
pnpm format:check

echo "==> [3/7] lint (eslint)"
pnpm lint

echo "==> [4/7] typecheck (nuxt typecheck / vue-tsc)"
pnpm typecheck

echo "==> [5/7] locales (паритет ключей i18n)"
pnpm check:locales

echo "==> [6/7] test (vitest)"
pnpm test

echo "==> [7/7] build (nuxt generate)"
pnpm generate

echo ""
echo "OK verify: format + lint + typecheck + locales + test + build — всё зелёное"
