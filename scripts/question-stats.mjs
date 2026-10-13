// Informe de calidad de las preguntas a partir del uso real.
// Uso: node --env-file=.env.local scripts/question-stats.mjs [salida.md]
// Necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY, y las tablas de lib/question-feedback.sql.
//
// Usa solo el PRIMER intento de cada usuario en cada pregunta (versión actual) y marca:
// - muy fáciles (aciertos > 95%) o muy difíciles (< 25%): en la prueba real se anulan las de < 5% o > 95%
// - baja discriminación: los que aciertan no son los que mejor van en el resto del banco
// - distractores que casi nadie elige
// - reportes de errores pendientes
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const MIN_USUARIOS = 20 // por debajo de esto los porcentajes no son confiables
const PAGE = 1000

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (usa --env-file=.env.local).')
  process.exit(1)
}
const supabase = createClient(url, key)

// Banco local: para saber módulo, versión y formato de cada pregunta
const bank = [
  ...JSON.parse(readFileSync('questions.json', 'utf8')),
  ...readdirSync('data/preguntas').filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(join('data/preguntas', f), 'utf8'))),
]
const byId = new Map(bank.map((q) => [String(q.id), q]))

async function fetchAll(table, columns, order) {
  const rows = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select(columns).order(order).range(from, from + PAGE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...data)
    if (data.length < PAGE) return rows
  }
}

const attempts = await fetchAll('question_attempts', 'user_id, question_id, question_version, selected_option, is_correct, time_ms, created_at', 'created_at')
const reports = await fetchAll('question_reports', 'question_id, question_version, motivo, comentario, estado, created_at', 'created_at')

// Primer intento por usuario y pregunta, solo de la versión vigente de la pregunta
const first = new Map()
for (const a of attempts) {
  const q = byId.get(a.question_id)
  if (!q || (q.version ?? 1) !== a.question_version) continue
  const k = `${a.user_id}|${a.question_id}`
  if (!first.has(k)) first.set(k, a)
}
const firsts = [...first.values()]

// Rendimiento de cada usuario en el resto del banco, para la discriminación
const userTotals = new Map()
for (const a of firsts) {
  const t = userTotals.get(a.user_id) ?? { n: 0, ok: 0 }
  t.n++
  if (a.is_correct) t.ok++
  userTotals.set(a.user_id, t)
}

const median = (xs) => {
  const s = xs.filter((x) => typeof x === 'number').sort((a, b) => a - b)
  return s.length ? s[Math.floor(s.length / 2)] : null
}

const stats = []
const byQuestion = new Map()
for (const a of firsts) byQuestion.set(a.question_id, [...(byQuestion.get(a.question_id) ?? []), a])
for (const [qid, rows] of byQuestion) {
  const q = byId.get(qid)
  const n = rows.length
  const p = rows.filter((r) => r.is_correct).length / n
  const elegidas = Object.fromEntries(['A', 'B', 'C', 'D'].map((l) => [l, rows.filter((r) => r.selected_option === l).length / n]))
  // Correlación entre acertar esta pregunta y el rendimiento en las demás (sin contar esta)
  const pares = rows
    .map((r) => {
      const t = userTotals.get(r.user_id)
      if (!t || t.n < 6) return null
      return [r.is_correct ? 1 : 0, (t.ok - (r.is_correct ? 1 : 0)) / (t.n - 1)]
    })
    .filter(Boolean)
  let disc = null
  if (pares.length >= MIN_USUARIOS) {
    const mx = pares.reduce((s, [x]) => s + x, 0) / pares.length
    const my = pares.reduce((s, [, y]) => s + y, 0) / pares.length
    const cov = pares.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0)
    const vx = pares.reduce((s, [x]) => s + (x - mx) ** 2, 0)
    const vy = pares.reduce((s, [, y]) => s + (y - my) ** 2, 0)
    disc = vx && vy ? cov / Math.sqrt(vx * vy) : null
  }
  const sjt = q?.formato === 'juicio_situacional'
  const ajuste = sjt
    ? rows.reduce((s, r) => s + (q.opciones.find((o) => o.id === r.selected_option)?.puntaje ?? 0), 0) / (n * 3)
    : null

  const alertas = []
  if (n >= MIN_USUARIOS) {
    if (!sjt && p > 0.95) alertas.push('muy fácil (>95%)')
    if (!sjt && p < 0.25) alertas.push('muy difícil (<25%): revisar clave o ambigüedad')
    if (disc !== null && disc < 0.15) alertas.push(`discrimina poco (${disc.toFixed(2)})`)
    const muertos = Object.entries(elegidas).filter(([l, f]) => l !== q?.respuestaCorrecta && f < 0.03).map(([l]) => l)
    if (muertos.length) alertas.push(`distractores que casi nadie elige: ${muertos.join(', ')}`)
  }
  stats.push({ qid, q, n, p, elegidas, disc, ajuste, tiempo: median(rows.map((r) => r.time_ms)), alertas })
}

const pendientes = reports.filter((r) => r.estado === 'nuevo')
const reportesPorPregunta = new Map()
for (const r of pendientes) reportesPorPregunta.set(r.question_id, [...(reportesPorPregunta.get(r.question_id) ?? []), r])

// ---------- Informe ----------
const pct = (x) => (x === null || x === undefined ? '—' : `${Math.round(x * 100)}%`)
const seg = (ms) => (ms === null ? '—' : `${Math.round(ms / 1000)} s`)
const lines = []
lines.push(`# Calidad de las preguntas según el uso`, '')
lines.push(`Generado: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`, '')
lines.push(`- Intentos registrados: ${attempts.length} · primeros intentos usados: ${firsts.length}`)
lines.push(`- Preguntas con datos: ${stats.length} · con al menos ${MIN_USUARIOS} usuarios: ${stats.filter((s) => s.n >= MIN_USUARIOS).length}`)
lines.push(`- Reportes de error sin revisar: ${pendientes.length}`, '')

const conAlertas = stats.filter((s) => s.alertas.length).sort((a, b) => b.n - a.n)
lines.push(`## Preguntas para revisar (${conAlertas.length})`, '')
if (!conAlertas.length) lines.push(`Ninguna todavía${stats.some((s) => s.n >= MIN_USUARIOS) ? '' : ': faltan datos (mínimo ' + MIN_USUARIOS + ' usuarios por pregunta)'}.`, '')
else {
  lines.push('| Pregunta | Módulo | Usuarios | Aciertos | Discriminación | A / B / C / D | Alertas |', '|---|---|---|---|---|---|---|')
  for (const s of conAlertas) {
    const dist = ['A', 'B', 'C', 'D'].map((l) => `${l === s.q?.respuestaCorrecta ? '**' : ''}${pct(s.elegidas[l])}${l === s.q?.respuestaCorrecta ? '**' : ''}`).join(' / ')
    lines.push(`| ${s.qid} | ${s.q?.modulo ?? '?'} | ${s.n} | ${s.ajuste !== null ? `ajuste ${pct(s.ajuste)}` : pct(s.p)} | ${s.disc === null ? '—' : s.disc.toFixed(2)} | ${dist} | ${s.alertas.join('; ')} |`)
  }
  lines.push('', 'En la distribución, la clave va en **negrita**.', '')
}

lines.push(`## Reportes de error sin revisar (${pendientes.length})`, '')
for (const [qid, rs] of [...reportesPorPregunta].sort((a, b) => b[1].length - a[1].length)) {
  lines.push(`### ${qid} · ${byId.get(qid)?.modulo ?? 'pregunta no encontrada'} (${rs.length})`)
  for (const r of rs) lines.push(`- ${r.created_at.slice(0, 10)} · ${r.motivo}${r.comentario ? `: ${r.comentario.replace(/\s+/g, ' ')}` : ''}`)
  lines.push('')
}

lines.push('## Resumen por módulo', '', '| Módulo | Preguntas con datos | Aciertos promedio | Tiempo mediano |', '|---|---|---|---|')
const porModulo = new Map()
for (const s of stats) porModulo.set(s.q?.modulo ?? '?', [...(porModulo.get(s.q?.modulo ?? '?') ?? []), s])
for (const [mod, ss] of [...porModulo].sort()) {
  const p = ss.reduce((a, s) => a + (s.ajuste ?? s.p), 0) / ss.length
  lines.push(`| ${mod} | ${ss.length} | ${pct(p)} | ${seg(median(ss.map((s) => s.tiempo)))} |`)
}

const out = lines.join('\n') + '\n'
const target = process.argv[2]
if (target) {
  writeFileSync(target, out)
  console.log(`Informe guardado en ${target}`)
} else {
  console.log(out)
}
