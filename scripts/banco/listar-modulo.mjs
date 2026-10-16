// Lista las preguntas activas de un módulo para no repetirlas.
// Uso (desde la raíz del proyecto): node scripts/banco/listar-modulo.mjs "Nombre exacto del módulo"
import fs from 'node:fs'
import path from 'node:path'
const modulo = process.argv[2]
const all = [
  ...JSON.parse(fs.readFileSync('questions.json', 'utf8')),
  ...fs.readdirSync('data/preguntas').filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(fs.readFileSync(path.join('data/preguntas', f), 'utf8'))),
].filter((q) => q.modulo === modulo && !['retirada', 'borrador'].includes(q.estado))
console.log(`${all.length} preguntas activas en "${modulo}"`)
for (const q of all) console.log(`${q.id} · ${q.tema}${q.subtema ? ' / ' + q.subtema : ''}${q.articulos ? ' · ' + q.articulos.join('; ') : ''}\n   ${q.pregunta.replace(/\s+/g, ' ').slice(0, 160)}`)
