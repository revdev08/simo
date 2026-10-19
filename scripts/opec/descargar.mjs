// Descarga de SIMO (CNSC) las OPEC de una convocatoria y la ficha del Manual de Funciones de cada una.
// Solo lee datos públicos (sin iniciar sesión) y espera entre peticiones para no cargar el servidor.
// Uso: node scripts/opec/descargar.mjs <id_convocatoria_simo> <carpeta_salida>
//   DIAN 2676 - Ingreso: 1011914855
// Deja en la carpeta: opec.json (la lista tal como la da SIMO) y fichas/<opec>.pdf. Después:
//   pdftotext -layout fichas/<opec>.pdf  (genera el .txt que lee construir.mjs)
import fs from 'node:fs'
import path from 'node:path'

const [convocatoria, salida] = process.argv.slice(2)
if (!convocatoria || !salida) {
  console.error('Uso: node scripts/opec/descargar.mjs <id_convocatoria_simo> <carpeta_salida>')
  process.exit(1)
}
const SIMO = 'https://simo.cnsc.gov.co'
const PAUSA_MS = 1500
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
const cabeceras = { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (SIMO Test; lectura de oferta pública)' }

fs.mkdirSync(path.join(salida, 'fichas'), { recursive: true })

const lista = []
for (let pagina = 0; ; pagina++) {
  const r = await fetch(`${SIMO}/empleos/ofertaPublica/historico?search_convocatoria=${convocatoria}&page=${pagina}&size=100`, { headers: cabeceras })
  if (!r.ok) throw new Error(`SIMO respondió ${r.status} en la página ${pagina}`)
  const datos = await r.json()
  lista.push(...datos)
  const total = Number(r.headers.get('content-range')?.split('/')[1] ?? lista.length)
  if (!datos.length || lista.length >= total) break
  await esperar(PAUSA_MS)
}
fs.writeFileSync(path.join(salida, 'opec.json'), JSON.stringify(lista, null, 2))
console.log(`${lista.length} OPEC`)

let nuevas = 0
for (const item of lista) {
  const destino = path.join(salida, 'fichas', `${item.id}.pdf`)
  const doc = item.empleo?.documento?.version
  if (!doc || fs.existsSync(destino)) continue
  await esperar(PAUSA_MS)
  // Un corte de red no detiene la descarga: esa ficha queda pendiente y se baja al volver a correr el script
  const r = await fetch(`${SIMO}/documents/get-document?docId=${encodeURIComponent(doc)}&contentType=application/pdf`, {
    headers: { 'User-Agent': cabeceras['User-Agent'] },
  }).catch((e) => ({ ok: false, status: e.cause?.code ?? e.message, headers: new Headers() }))
  const tipo = r.headers.get('content-type') ?? ''
  if (!r.ok || !tipo.includes('pdf')) {
    console.warn(`OPEC ${item.id}: no se pudo descargar la ficha (${r.status} ${tipo}); vuelve a correr el script`)
    continue
  }
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()))
  nuevas++
}
console.log(`${nuevas} fichas descargadas`)
