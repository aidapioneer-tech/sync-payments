#!/usr/bin/env bash
#
# verify.sh — единая проверка "Definition of Done" перед коммитом / PR.
# Прогоняет детерминированную установку, линт, тайпчек и production-сборку.
# Падает на первой же ошибке (set -e). Зеркало — verify.ps1 (Windows).
#
# Проверка паритета ключей локалей будет добавлена сюда на шаге i18n.
#
set -euo pipefail

cd "$(dirname "$0")"

echo "==> [1/6] pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile

echo "==> [2/6] format:check (prettier)"
pnpm format:check

echo "==> [3/6] lint (eslint)"
pnpm lint

echo "==> [4/6] typecheck (nuxt typecheck / vue-tsc)"
pnpm typecheck

echo "==> [5/6] test (vitest)"
pnpm test

echo "==> [6/6] build (nuxt generate)"
pnpm generate

echo ""
echo "OK verify: format + lint + typecheck + test + build — всё зелёное"
