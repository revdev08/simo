// Comprueba que cada fragmento de texto_fuente aparezca literalmente en alguna de las fuentes (.txt) de una carpeta.
// Los fragmentos se separan por "[...]"; solo se normalizan los espacios. Si un fragmento no aparece tal cual,
// dice qué tanto coincide sin tildes ni puntuación, para distinguir una errata de un texto que no existe.
// Si junto a <norma>.txt está <norma>.tachados.txt (los segmentos tachados del HTML del Senado, uno por línea),
// avisa cuando un fragmento de esa norma cita texto declarado inexequible.
// Uso (desde la raíz del proyecto): node scripts/banco/verificar-fragmentos.mjs <carpeta_fuentes> <borrador.json> [otro.json ...]
// Sale con código 1 si algún fragmento no tiene respaldo o cita texto tachado.
import fs from 'node:fs'
import path from 'node:path'

const [dir, ...archivos] = process.argv.slice(2)
if (!dir || !archivos.length) {
  console.error('Uso: node scripts/banco/verificar-fragmentos.mjs <carpeta_fuentes> <borrador.json> [otro.json ...]')
  process.exit(2)
}

const norm = (s) => s.replace(/\s+/g, ' ').trim()
const simple = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
const fuentes = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.txt') && !f.endsWith('.tachados.txt'))
  .map((f) => {
    const t = norm(fs.readFileSync(path.join(dir, f), 'utf8'))
    return { f, t, s: simple(t) }
  })

// Tachados de una norma: solo se comparan con los fragmentos que salen de esa misma norma
const tachadosDe = (fuente) => {
  const archivo = path.join(dir, fuente.replace(/\.txt$/, '.tachados.txt'))
  if (!fs.existsSync(archivo)) return []
  return fs
    .readFileSync(archivo, 'utf8')
    .split(/\r?\n/)
    .map(norm)
    .filter((l) => l.length >= 12)
}

const preguntas = archivos.flatMap((a) => JSON.parse(fs.readFileSync(a, 'utf8')))
let exactos = 0
const problemas = []
for (const q of preguntas) {
  if (!q.texto_fuente) continue
  for (const frag of q.texto_fuente.split(/\[\.\.\.\]|\[…\]/).map(norm).filter((f) => f.length > 25)) {
    const origen = fuentes.find((x) => x.t.includes(frag))
    if (origen) {
      const tachado = tachadosDe(origen.f).find((l) => frag.includes(l))
      if (tachado) problemas.push(`${q.id}: cita texto TACHADO (inexequible) de ${origen.f}: "${tachado.slice(0, 70)}…"`)
      else exactos++
      continue
    }
    const sf = simple(frag)
    const ventanas = []
    for (let i = 0; i + 60 <= sf.length; i += 60) ventanas.push(sf.slice(i, i + 60))
    if (!ventanas.length) ventanas.push(sf)
    const mejor = Math.max(0, ...fuentes.map((x) => ventanas.filter((w) => x.s.includes(w)).length / ventanas.length))
    problemas.push(`${q.id}: no aparece literal (coincide ${Math.round(mejor * 100)}% sin tildes ni puntuación): "${frag.slice(0, 80)}…"`)
  }
}

console.log(`Fragmentos literales: ${exactos} · con problemas: ${problemas.length}`)
if (problemas.length) {
  console.log(problemas.join('\n'))
  process.exit(1)
}
