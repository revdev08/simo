// Extrae sin clave solo las preguntas corregidas (version >= 2) para la segunda resolución a ciegas.
// Uso: node scripts/banco/strip-cambiadas.mjs <salida.json> <borrador1.json> [borrador2.json ...]
import fs from 'node:fs'
const [out, ...inputs] = process.argv.slice(2)
const items = inputs.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8'))).filter((q) => (q.version ?? 1) >= 2)
const blind = items.map((q) => ({ id: q.id, pregunta: q.pregunta, opciones: q.opciones.map((o) => ({ id: o.id, texto: o.texto })) }))
fs.writeFileSync(out, JSON.stringify(blind, null, 2))
console.log(`${blind.length} preguntas corregidas → ${out}: ${blind.map((q) => q.id).join(', ')}`)
