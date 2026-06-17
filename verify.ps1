#
# verify.ps1 — единая проверка "Definition of Done" перед коммитом / PR (Windows).
# Прогоняет детерминированную установку, линт, тайпчек и production-сборку.
# Падает на первой же ошибке. Зеркало — verify.sh (linux/macOS).
#
# Шаги test (Vitest) и проверка паритета локалей будут добавлены сюда
# на соответствующих шагах модернизации.
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

Invoke-Step '[1/4] pnpm install --frozen-lockfile' 'pnpm install --frozen-lockfile'
Invoke-Step '[2/4] lint (eslint)'                   'pnpm lint'
Invoke-Step '[3/4] typecheck (nuxt typecheck)'      'pnpm typecheck'
Invoke-Step '[4/4] build (nuxt generate)'           'pnpm generate'

Write-Host ''
Write-Host 'OK verify: lint + typecheck + build — всё зелёное' -ForegroundColor Green
