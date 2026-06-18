#!/usr/bin/env node
// Проверяет паритет ключей между локалями i18n/locales/*.json.
// Падает (exit 1), если у какой-то локали есть лишние или недостающие ключи
// относительно эталонной (ru). Это часть Definition of Done.

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = join(__dirname, '..', 'i18n', 'locales')
const referenceLocale = 'ru'

/** Рекурсивно собирает полный путь до каждого листа объекта. */
function flattenKeys(obj, prefix = '') {
  const keys = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, path))
    } else {
      keys.push(path)
    }
  }
  return keys.sort()
}

const files = readdirSync(localesDir).filter((f) => f.endsWith('.json'))
const locales = Object.fromEntries(
  files.map((f) => [
    f.replace(/\.json$/, ''),
    flattenKeys(JSON.parse(readFileSync(join(localesDir, f), 'utf-8')))
  ])
)

if (!locales[referenceLocale]) {
  console.error(`Нет эталонной локали ${referenceLocale}.json в ${localesDir}`)
  process.exit(1)
}

const reference = new Set(locales[referenceLocale])
let hasError = false

for (const [code, keys] of Object.entries(locales)) {
  if (code === referenceLocale) continue
  const current = new Set(keys)
  const missing = [...reference].filter((k) => !current.has(k))
  const extra = [...current].filter((k) => !reference.has(k))
  if (missing.length || extra.length) {
    hasError = true
    console.error(`Локаль "${code}" не совпадает с "${referenceLocale}":`)
    if (missing.length) console.error(`  нет ключей: ${missing.join(', ')}`)
    if (extra.length) console.error(`  лишние ключи: ${extra.join(', ')}`)
  }
}

if (hasError) {
  process.exit(1)
}

console.log(`OK: паритет ключей локалей (${Object.keys(locales).join(', ')}) соблюдён`)
