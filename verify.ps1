#
# verify.ps1 — единая проверка "Definition of Done" перед коммитом / PR (Windows).
# Прогоняет детерминированную установку, линт, тайпчек и production-сборку.
# Падает на первой же ошибке. Зеркало — verify.sh (linux/macOS).
#
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Invoke-Step($Title, $Cmd) {
    Write-Host "==> $Title"
    & cmd /c $Cmd
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAIL: $Title (exit $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Invoke-Step '[1/7] pnpm install --frozen-lockfile' 'pnpm install --frozen-lockfile'
Invoke-Step '[2/7] format:check (prettier)'         'pnpm format:check'
Invoke-Step '[3/7] lint (eslint)'                   'pnpm lint'
Invoke-Step '[4/7] typecheck (nuxt typecheck)'      'pnpm typecheck'
Invoke-Step '[5/7] locales (паритет ключей i18n)'   'pnpm check:locales'
Invoke-Step '[6/7] test (vitest)'                   'pnpm test'
Invoke-Step '[7/7] build (nuxt generate)'           'pnpm generate'

Write-Host ''
Write-Host 'OK verify: format + lint + typecheck + locales + test + build — всё зелёное' -ForegroundColor Green
