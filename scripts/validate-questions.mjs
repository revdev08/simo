// Valida el banco de preguntas y reporta señales de calidad.
// Uso: node scripts/validate-questions.mjs [rutas...]   (archivos .json o carpetas; por defecto questions.json)
// Todas las rutas se validan juntas, así que también detecta ids repetidos entre archivos.
// Sale con código 1 si encuentra errores de estructura.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['questions.json']
const files = paths.flatMap((p) =>
  statSync(p).isDirectory()
    ? readdirSync(p).filter((f) => f.endsWith('.json')).map((f) => join(p, f))
    : [p]
)
const questions = files.flatMap((f) => JSON.parse(readFileSync(f, 'utf8')))

const LETTERS = ['A', 'B', 'C', 'D']
const DIFICULTADES = ['Baja', 'Media', 'Alta']
const ESTADOS = ['borrador', 'beta', 'estable', 'en_revision', 'retirada']
const INACTIVOS = ['borrador', 'en_revision', 'retirada']
// Formato v2 (docs/banco/GUIA_REDACCION.md): preguntas con campo "version"
const V2_REQUIRED = ['capa', 'formato', 'nivel', 'subtema']
// La capa 2 (aptitud y comportamentales) no siempre tiene norma; las demás sí
const V2_NORMATIVE = ['norma', 'articulos', 'texto_fuente']

const errors = []
const warnings = []
const err = (id, msg) => errors.push(`#${id}: ${msg}`)
// \b no reconoce letras con tilde, así que los bordes se definen con \p{L}
const ABSOLUTAS = /(?<!\p{L})(siempre|nunca|únicamente|solamente|exclusivamente|en ningún caso|todos los casos)(?!\p{L})/iu

// Reglas extra para el formato v2: campos de trazabilidad, explicación por opción y sesgos de redacción
function checkV2(q) {
  for (const field of q.capa === 2 ? V2_REQUIRED : [...V2_REQUIRED, ...V2_NORMATIVE]) {
    const v = q[field]
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length)) {
      err(q.id, `v2: falta "${field}"`)
    }
  }
  if (!['caso', 'conocimiento_aplicado'].includes(q.formato)) err(q.id, `v2: formato inválido "${q.formato}"`)
  if (!Array.isArray(q.opciones)) return
  q.opciones.forEach((o) => {
    if (typeof o.explicacion !== 'string' || !o.explicacion.trim()) err(q.id, `v2: la opción ${o.id} no tiene explicación`)
  })
  const key = q.opciones.find((o) => o.id === q.respuestaCorrecta)
  const others = q.opciones.filter((o) => o !== key)
  if (!key || others.some((o) => typeof o.texto !== 'string')) return
  const maxOther = Math.max(...others.map((o) => o.texto.length))
  const minOther = Math.min(...others.map((o) => o.texto.length))
  if (key.texto.length > maxOther * 1.2) warnings.push(`#${q.id}: la clave es >20% más larga que cualquier distractor`)
  if (key.texto.length < minOther * 0.7) warnings.push(`#${q.id}: la clave es mucho más corta que los distractores`)
  if (others.some((o) => ABSOLUTAS.test(o.texto)) && !ABSOLUTAS.test(key.texto)) {
    warnings.push(`#${q.id}: palabras absolutas solo en distractores (pista)`)
  }
}

// Estructura
const seenIds = new Set()
const seenStems = new Map()
for (const q of questions) {
  const validId = Number.isInteger(q.id) || (typeof q.id === 'string' && /^[A-Z0-9-]+$/.test(q.id))
  if (!validId) { errors.push(`id inválido: ${JSON.stringify(q.id)}`); continue }
  if (seenIds.has(q.id)) err(q.id, 'id duplicado')
  seenIds.add(q.id)

  for (const field of ['modulo', 'tema', 'pregunta', 'explicacionIA']) {
    if (typeof q[field] !== 'string' || !q[field].trim()) err(q.id, `campo "${field}" vacío o ausente`)
  }
  if (!DIFICULTADES.includes(q.dificultad)) err(q.id, `dificultad inválida: ${q.dificultad}`)
  if (q.estado !== undefined && !ESTADOS.includes(q.estado)) err(q.id, `estado desconocido: ${q.estado}`)

  if (!Array.isArray(q.opciones) || q.opciones.length !== 4) {
    err(q.id, 'debe tener exactamente 4 opciones')
  } else {
    q.opciones.forEach((o, i) => {
      if (o.id !== LETTERS[i]) err(q.id, `la opción ${i + 1} debe tener id "${LETTERS[i]}" (tiene "${o.id}")`)
      if (typeof o.texto !== 'string' || !o.texto.trim()) err(q.id, `la opción ${o.id} no tiene texto`)
    })
    const textos = q.opciones.map((o) => String(o.texto ?? '').trim().toLowerCase())
    if (new Set(textos).size !== textos.length) err(q.id, 'tiene opciones con el mismo texto')
    if (!q.opciones.some((o) => o.id === q.respuestaCorrecta)) err(q.id, `la clave "${q.respuestaCorrecta}" no existe`)
    if (textos.some((t) => /todas las anteriores|ninguna de las anteriores|son correctas/.test(t))) {
      warnings.push(`#${q.id}: usa "todas/ninguna de las anteriores" o "son correctas"`)
    }
  }

  if (q.version !== undefined) checkV2(q)

  const stem = String(q.pregunta ?? '').trim().toLowerCase()
  if (seenStems.has(stem)) warnings.push(`#${q.id}: mismo enunciado que #${seenStems.get(stem)}`)
  else seenStems.set(stem, q.id)
}

// Señales de calidad (no bloquean)
const valid = questions.filter((q) => Array.isArray(q.opciones) && q.opciones.every((o) => typeof o.texto === 'string'))
const keyIsLongest = valid.filter((q) => {
  const lens = q.opciones.map((o) => o.texto.length)
  const key = q.opciones.find((o) => o.id === q.respuestaCorrecta)
  return key && key.texto.length === Math.max(...lens) && lens.filter((l) => l === key.texto.length).length === 1
}).length
const keyDist = Object.fromEntries(LETTERS.map((l) => [l, questions.filter((q) => q.respuestaCorrecta === l).length]))
const byModule = {}
for (const q of questions) byModule[q.modulo] = (byModule[q.modulo] ?? 0) + 1
const enRevision = questions.filter((q) => INACTIVOS.includes(q.estado)).map((q) => q.id)

const pct = (n) => `${((100 * n) / questions.length).toFixed(1)}%`
console.log(`Preguntas: ${questions.length} (${questions.length - enRevision.length} activas)`)
console.log('Por módulo:', byModule)
console.log('Reparto de claves:', keyDist)
console.log(`Clave = opción más larga: ${keyIsLongest} (${pct(keyIsLongest)}; lo esperable por azar es ~25%)`)
if (enRevision.length) console.log(`Inactivas (ocultas en la práctica): ${enRevision.join(', ')}`)

if (warnings.length) {
  console.log(`\nAdvertencias (${warnings.length}):`)
  warnings.forEach((w) => console.log(`  - ${w}`))
}
if (errors.length) {
  console.error(`\nErrores (${errors.length}):`)
  errors.forEach((e) => console.error(`  - ${e}`))
  process.exit(1)
}
console.log('\nEstructura OK')
