// Publica borradores en data/preguntas anotando la resolución a ciegas. Configurable por lote.
// Uso (desde la raíz del proyecto): node scripts/banco/merge-lote.mjs <config.json>
// config: { "respuestas": ["ruta/resp1.json", ...],   // primera resolución; las siguientes reemplazan por id
//           "destinos": { "archivo.json": ["docs/banco/lote10/tri_a.json", ...] },
//           "dryRun": false }
import fs from 'node:fs'
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
const cfg = read(process.argv[2])

const answers = {}
for (const f of cfg.respuestas) for (const a of read(f)) answers[String(a.id)] = a

let total = 0
const problemas = []
for (const [destino, fuentes] of Object.entries(cfg.destinos)) {
  const nuevos = fuentes.flatMap((f) => read(f))
  for (const q of nuevos) {
    const a = answers[String(q.id)]
    if (!a) { problemas.push(`${q.id}: sin resolución a ciegas`); continue }
    q.revision = q.revision ?? {}
    const defendibles = (a.otras_defendibles ?? []).filter((x) => x && x !== a.respuesta)
    const coincide = a.respuesta === q.respuestaCorrecta && !defendibles.length
    // Si la trampa cercana ya se revisó y se dejó nota, cuenta como coincidencia
    const revisada = a.respuesta === q.respuestaCorrecta && defendibles.length && a.revisada === true
    q.revision.resolucion_ciega = coincide || revisada ? 'coincide' : a.respuesta === q.respuestaCorrecta ? 'ambigua' : 'difiere'
    q.revision.p_estimado = typeof a.p_estimado === 'number' && a.p_estimado <= 1 ? Math.round(a.p_estimado * 100) : a.p_estimado
    if (a.nota_revision) q.revision.nota = a.nota_revision
    if (q.revision.resolucion_ciega !== 'coincide') {
      problemas.push(`${q.id}: ${q.revision.resolucion_ciega} (ciego ${a.respuesta}, clave ${q.respuestaCorrecta}${defendibles.length ? `, defendibles ${defendibles.join(',')}` : ''})`)
    }
  }
  const file = `data/preguntas/${destino}`
  const existentes = fs.existsSync(file) ? read(file) : []
  const idsNuevos = new Set(nuevos.map((q) => String(q.id)))
  const final = [...existentes.filter((q) => !idsNuevos.has(String(q.id))), ...nuevos]
  if (!cfg.dryRun) fs.writeFileSync(file, JSON.stringify(final, null, 2) + '\n')
  total += nuevos.length
  console.log(`${destino}: +${nuevos.length} (total ${final.length})${cfg.dryRun ? ' [prueba]' : ''}`)
}
console.log(`Total: ${total}`)
if (problemas.length) console.log('Revisar:\n  ' + problemas.join('\n  '))
