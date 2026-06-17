#!/usr/bin/env bash
#
# verify.sh — единая проверка "Definition of Done" перед коммитом / PR.
# Прогоняет детерминированную установку, линт, тайпчек и production-сборку.
# Падает на первой же ошибке (set -e). Зеркало — verify.ps1 (Windows).
#
# Шаги test (Vitest) и проверка паритета локалей будут добавлены сюда
# на соответствующих шагах модернизации.
#
set -euo pipefail

cd "$(dirname "$0")"

echo "==> [1/4] pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile

echo "==> [2/4] lint (eslint)"
pnpm lint

echo "==> [3/4] typecheck (nuxt typecheck / vue-tsc)"
pnpm typecheck

echo "==> [4/4] build (nuxt generate)"
pnpm generate

echo ""
echo "OK verify: lint + typecheck + build — всё зелёное"
