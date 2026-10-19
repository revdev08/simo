// Comprueba que cada competencia de las fichas de una convocatoria apunte a un tema y que los módulos y las
// etiquetas existan. Muestra los temas sin preguntas ordenados por las vacantes que reúnen.
// Uso (desde la raíz del proyecto): node scripts/opec/verificar-temas.mjs dian-2676
import fs from 'node:fs'

const slug = process.argv[2] ?? 'dian-2676'
const leer = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
export const clave = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]+/g, '')

const { opecs } = leer(`data/opec/${slug}.json`)
const { temas } = leer(`data/opec/temas-${slug}.json`)
const etiquetas = fs.existsSync(`data/opec/etiquetas-${slug}.json`) ? leer(`data/opec/etiquetas-${slug}.json`).preguntas : {}

// Preguntas activas por módulo e ids existentes
const INACTIVAS = ['borrador', 'en_revision', 'retirada']
const porModulo = {}
const ids = new Set()
for (const f of fs.readdirSync('data/preguntas').filter((x) => x.endsWith('.json'))) {
  for (const q of leer(`data/preguntas/${f}`)) {
    if (INACTIVAS.includes(q.estado)) continue
    porModulo[q.modulo] = (porModulo[q.modulo] ?? 0) + 1
    ids.add(String(q.id))
  }
}
for (const q of leer('questions.json')) if (q.activa !== false) porModulo[q.modulo] = (porModulo[q.modulo] ?? 0) + 1

const errores = []
const temaDe = new Map()
const idsTema = new Set(temas.map((t) => t.id))
for (const t of temas) {
  for (const c of t.competencias) {
    const k = clave(c)
    if (temaDe.has(k) && temaDe.get(k) !== t.id) errores.push(`«${c}» está en ${temaDe.get(k)} y en ${t.id}`)
    temaDe.set(k, t.id)
  }
  for (const m of t.modulos) if (!porModulo[m]) errores.push(`${t.id}: el módulo «${m}» no existe o no tiene preguntas`)
  if (t.etiqueta && !t.descripcion) errores.push(`${t.id}: un tema que se etiqueta necesita descripción`)
}
const etiquetadas = {}
for (const [id, lista] of Object.entries(etiquetas)) {
  if (!ids.has(id)) errores.push(`etiquetas: la pregunta ${id} no existe o no está activa`)
  for (const t of lista) {
    if (!idsTema.has(t)) errores.push(`etiquetas: ${id} usa el tema inexistente ${t}`)
    else if (!temas.find((x) => x.id === t).etiqueta) errores.push(`etiquetas: ${id} usa ${t}, que no se etiqueta`)
    etiquetadas[t] = (etiquetadas[t] ?? 0) + 1
  }
}

// Cobertura por tema, ponderada por las vacantes de las OPEC que lo piden
const resumen = new Map(temas.map((t) => [t.id, { tema: t, opec: 0, vacantes: 0 }]))
const sinTema = new Map()
for (const o of opecs) {
  const vistos = new Set()
  for (const c of [...o.competenciasFuncionales, ...o.competenciasBasicas]) {
    const id = temaDe.get(clave(c))
    if (!id) {
      sinTema.set(c, (sinTema.get(c) ?? 0) + 1)
      continue
    }
    if (vistos.has(id)) continue
    vistos.add(id)
    resumen.get(id).opec++
    resumen.get(id).vacantes += o.totalVacantes
  }
}
for (const [c, n] of sinTema) errores.push(`Sin tema (${n} OPEC): «${c}»`)

const filas = [...resumen.values()].map((r) => {
  const n = (r.tema.etiqueta ? (etiquetadas[r.tema.id] ?? 0) : 0) + r.tema.modulos.reduce((s, m) => s + (porModulo[m] ?? 0), 0)
  return { ...r, preguntas: n, etiquetadas: etiquetadas[r.tema.id] ?? 0 }
})
console.log(`${temas.length} temas · ${errores.length} errores`)
if (errores.length) console.log('  ' + errores.join('\n  '))
console.log('\nTemas sin preguntas, por vacantes:')
for (const f of filas.filter((x) => x.preguntas === 0).sort((a, b) => b.vacantes - a.vacantes)) console.log(`  ${String(f.vacantes).padStart(5)} vac · ${String(f.opec).padStart(3)} OPEC · ${f.tema.id}${f.tema.etiqueta ? ' (falta etiquetar o escribir)' : ''}`)
console.log('\nTemas etiquetados:')
for (const f of filas.filter((x) => x.tema.etiqueta).sort((a, b) => b.vacantes - a.vacantes)) console.log(`  ${String(f.vacantes).padStart(5)} vac · ${String(f.etiquetadas).padStart(3)} preguntas · ${f.tema.id}`)
process.exitCode = errores.length ? 1 : 0
