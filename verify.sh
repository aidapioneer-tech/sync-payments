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

echo "==> [1/5] pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile

echo "==> [2/5] format:check (prettier)"
pnpm format:check

echo "==> [3/5] lint (eslint)"
pnpm lint

echo "==> [4/5] typecheck (nuxt typecheck / vue-tsc)"
pnpm typecheck

echo "==> [5/5] build (nuxt generate)"
pnpm generate

echo ""
echo "OK verify: format + lint + typecheck + build — всё зелёное"
