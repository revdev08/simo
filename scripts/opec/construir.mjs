// Arma data/opec/<slug>.json con las OPEC de una convocatoria: lo que trae SIMO (denominación, vacantes, salario,
// documento de la ficha) más lo extraído de cada ficha del Manual de Funciones (proceso, propósito, funciones y
// competencias). No guarda nada de inscripciones: la respuesta anónima de SIMO trae datos de otras personas.
// Uso: node scripts/opec/construir.mjs <carpeta_descarga> <slug>
//   <carpeta_descarga> tiene opec.json (de descargar.mjs) y fichas_*.json (la extracción de las fichas)
import fs from 'node:fs'
import path from 'node:path'

const [carpeta, slug] = process.argv.slice(2)
if (!carpeta || !slug) {
  console.error('Uso: node scripts/opec/construir.mjs <carpeta_descarga> <slug>')
  process.exit(1)
}

const simo = JSON.parse(fs.readFileSync(path.join(carpeta, 'opec.json'), 'utf8'))
const fichas = new Map(
  fs
    .readdirSync(carpeta)
    .filter((f) => /^fichas_\d+\.json$/.test(f))
    .flatMap((f) => JSON.parse(fs.readFileSync(path.join(carpeta, f), 'utf8')))
    .map((f) => [Number(f.opec), f]),
)

// Área o dependencia que algunas fichas traen en una celda suelta junto al subproceso o a «Aplicación de la Ficha».
// La extracción la dejó a veces como último subproceso; aquí se saca a su propio campo.
const AREAS = {
  236791: 'Laboratorio Muestras Inorgánicas',
  236855: 'Procesamiento de Datos',
  236857: 'Procesamiento de Datos',
  236859: 'Soluciones y Desarrollo',
  236860: 'Soluciones y Desarrollo',
  236861: 'Soluciones y Desarrollo',
  236863: 'Soluciones y Desarrollo',
  236865: 'Soluciones y Desarrollo',
  236867: 'Infraestructura Tecnológica y de Operaciones',
  236868: 'Infraestructura Tecnológica y de Operaciones',
  236869: 'Infraestructura Tecnológica y de Operaciones',
  236870: 'Infraestructura Tecnológica y de Operaciones',
  236888: 'Despacho',
  236892: 'SST',
  242683: 'Laboratorio Materiales',
  242684: 'Laboratorio',
  242686: 'Laboratorio Materiales',
  242687: 'Laboratorio Muestras Orgánicas',
  242690: 'Tecnología',
  242691: 'Estudios Económicos',
  242696: 'SST',
  242698: 'Análisis e Inteligencia de Datos',
  246933: 'Mantenimiento',
}
const mayuscula = (s) => s.replace(/^\p{Ll}/u, (c) => c.toUpperCase())
// «Cumplimiento de obligaciones tributarias, cumplimiento de obligaciones aduaneras…» son dos procesos
const separarProcesos = (lista) => lista.flatMap((p) => p.split(/,\s*(?=cumplimiento de obligaciones)/i)).map((p) => mayuscula(p.trim())).filter(Boolean)

// «GESTOR II» → «Gestor II»
const denominacion = (s) => s.toLowerCase().replace(/^\p{L}/u, (c) => c.toUpperCase()).replace(/\b(i|ii|iii|iv|v)\b/g, (r) => r.toUpperCase())
const limpiar = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()

// Perfil del plan de estudio de la convocatoria que le corresponde a cada empleo
function perfilDe(nombre, procesos) {
  if (/^facilitador/i.test(nombre)) return 'facilitador'
  const p = procesos.join(' ').toLowerCase()
  if (p.includes('tributarias')) return 'tributos'
  if (p.includes('aduaneras')) return 'aduanas'
  return 'apoyo'
}

const errores = []
const opecs = simo
  .map(({ id, empleo: e }) => {
    const f = fichas.get(id)
    if (!f) errores.push(`OPEC ${id}: falta la extracción de su ficha`)
    const nombre = denominacion(e.denominacion.nombre)
    const procesos = separarProcesos(f?.procesos ?? [])
    const area = AREAS[id] ?? null
    const subprocesos = (f?.subprocesos ?? []).map((s) => mayuscula(limpiar(s))).filter((s) => s && s !== area)
    const vacantes = e.vacantes
      .map((v) => ({ municipio: limpiar(v.municipio?.nombre), departamento: limpiar(v.municipio?.departamento?.nombre), cantidad: Number(v.cantidad ?? 0) }))
      .filter((v) => v.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad || a.municipio.localeCompare(b.municipio))
    return {
      opec: id,
      denominacion: nombre,
      codigo: e.codigoEmpleo,
      grado: String(Number(e.gradoNivel?.grado ?? e.gradoDenominacion?.grado)),
      nivel: e.gradoNivel?.nivelNombre ?? null,
      ficha: f?.ficha || (e.descripcion.match(/^([A-Z]{2}-[A-Z]{2}-\d{4})/)?.[1] ?? null),
      procesos,
      subprocesos,
      area,
      aplicacion: f?.aplicacion || null,
      proposito: limpiar(f?.proposito) || null,
      funciones: (f?.funciones ?? []).map(limpiar).filter(Boolean),
      competenciasBasicas: (f?.competencias_basicas ?? []).map(limpiar).filter(Boolean),
      competenciasFuncionales: (f?.competencias_funcionales ?? []).map(limpiar).filter(Boolean),
      asignacion: e.asignacionSalarial ?? null,
      vigenciaSalarial: e.vigenciaSalarial ?? null,
      totalVacantes: vacantes.reduce((s, v) => s + v.cantidad, 0),
      vacantes,
      documento: e.documento?.version ?? null,
      perfil: perfilDe(nombre, procesos),
    }
  })
  .sort((a, b) => a.opec - b.opec)

// El mismo proceso aparece con distintas mayúsculas («Información, innovación y tecnología»): se usa la forma más común
const formas = new Map()
for (const p of opecs.flatMap((o) => o.procesos)) {
  const k = p.toLowerCase()
  const f = formas.get(k) ?? new Map()
  f.set(p, (f.get(p) ?? 0) + 1)
  formas.set(k, f)
}
const canonica = (p) => [...formas.get(p.toLowerCase())].sort((a, b) => b[1] - a[1])[0][0]
for (const o of opecs) o.procesos = [...new Set(o.procesos.map(canonica))]

for (const o of opecs) {
  if (!o.competenciasFuncionales.length) errores.push(`OPEC ${o.opec}: sin competencias funcionales`)
  if (!o.procesos.length) errores.push(`OPEC ${o.opec}: sin proceso`)
}

const destino = path.join('data', 'opec', `${slug}.json`)
fs.mkdirSync(path.dirname(destino), { recursive: true })
fs.writeFileSync(destino, JSON.stringify({ actualizado: new Date().toISOString().slice(0, 10), fuente: 'SIMO (CNSC), oferta pública histórica y fichas del Manual Específico de Funciones', opecs }, null, 2) + '\n')

const porPerfil = {}
for (const o of opecs) porPerfil[o.perfil] = (porPerfil[o.perfil] ?? 0) + 1
console.log(`${destino}: ${opecs.length} OPEC, ${opecs.reduce((s, o) => s + o.totalVacantes, 0)} vacantes · por perfil ${JSON.stringify(porPerfil)}`)
if (errores.length) console.log(`Revisar (${errores.length}):\n  ${errores.join('\n  ')}`)
