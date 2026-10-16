// node scripts/banco/blind.mjs strip <out.json> <in1.json> [in2.json...]  → preguntas sin clave ni explicaciones
// node scripts/banco/blind.mjs compare <respuestas.json> <in1.json> [in2.json...] → coincidencias
import fs from 'node:fs'
const [mode, target, ...inputs] = process.argv.slice(2)
const items = inputs.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')))

if (mode === 'strip') {
  const blind = items.map((q) => ({
    id: q.id,
    pregunta: q.pregunta,
    opciones: q.opciones.map((o) => ({ id: o.id, texto: o.texto })),
  }))
  fs.writeFileSync(target, JSON.stringify(blind, null, 2))
  console.log(`${blind.length} preguntas sin clave → ${target}`)
} else if (mode === 'compare') {
  const answers = Object.fromEntries(JSON.parse(fs.readFileSync(target, 'utf8')).map((a) => [a.id, a]))
  let ok = 0
  for (const q of items) {
    const a = answers[q.id]
    if (!a) { console.log(`${q.id}: SIN RESPUESTA`); continue }
    const match = a.respuesta === q.respuestaCorrecta
    const flags = [!match && `difiere (clave ${q.respuestaCorrecta}, ciego ${a.respuesta})`, a.otras_defendibles?.length && `otras defendibles: ${a.otras_defendibles.join(',')}`, a.confianza === 'baja' && 'confianza baja'].filter(Boolean)
    if (match && !flags.length) ok++
    else console.log(`${q.id}: ${flags.join(' · ')}\n    ${a.razon ?? ''}`)
  }
  console.log(`\nLimpias: ${ok}/${items.length}`)
}
