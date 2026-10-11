import React from 'react'

// Muestra el enunciado respetando párrafos y convierte las líneas con "|" en una tabla.
// Los enunciados largos (textos de lectura, casos extensos) se muestran en letra normal para que se lean bien.
const LARGO = 400

// Fila de tabla: tres o más celdas, o dos celdas si la línea vecina también es fila (tablas de dos columnas)
function isTableLine(lines: string[], i: number) {
  const celdas = (l: string | undefined) => (l?.includes('|') ? l.trim().replace(/^\||\|$/g, '').split('|').length : 0)
  const n = celdas(lines[i])
  return n >= 3 || (n === 2 && (celdas(lines[i - 1]) >= 2 || celdas(lines[i + 1]) >= 2))
}

// Pseudocódigo: líneas numeradas ("1. racha ← 0"). Se sangran según los bloques si/para/mientras.
const NUMERADA = /^(\d+)\.\s+(.*)$/
const ABRE = /^(si\b.*\bentonces|para\b.*\bhacer|mientras\b.*\bhacer|repetir|si no|sino)$/i
const CIERRA = /^(fin\b|si no$|sino$|hasta\b)/i

function sangrarPseudocodigo(lineas: string[]): string[] {
  const ancho = String(lineas.length).length
  let nivel = 0
  return lineas.map((l) => {
    const [, num, cuerpo] = l.match(NUMERADA)!
    if (CIERRA.test(cuerpo)) nivel = Math.max(0, nivel - 1)
    const salida = `${num.padStart(ancho)}  ${'   '.repeat(nivel)}${cuerpo}`
    if (ABRE.test(cuerpo)) nivel++
    return salida
  })
}

export default function QuestionText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n')
  const blocks: ({ type: 'p'; text: string } | { type: 'table'; rows: string[][] } | { type: 'code'; lines: string[] })[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    // Un bloque de líneas numeradas seguidas con asignaciones (←) se muestra como código
    if (NUMERADA.test(line)) {
      let j = i
      while (j < lines.length && NUMERADA.test(lines[j].trim())) j++
      const grupo = lines.slice(i, j).map((l) => l.trim())
      if (grupo.length >= 3 && grupo.some((l) => l.includes('←'))) {
        blocks.push({ type: 'code', lines: sangrarPseudocodigo(grupo) })
        i = j - 1
        continue
      }
    }
    if (isTableLine(lines, i)) {
      const cells = line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      // Las filas separadoras tipo "---|---" no se muestran
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue
      const last = blocks[blocks.length - 1]
      if (last?.type === 'table') last.rows.push(cells)
      else blocks.push({ type: 'table', rows: [cells] })
    } else {
      blocks.push({ type: 'p', text: line })
    }
  }

  const long = text.length > LARGO
  const pClass = long
    ? 'text-base sm:text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-100'
    : 'text-xl sm:text-2xl font-bold leading-relaxed text-slate-900 dark:text-white'

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((b, i) =>
        b.type === 'p' ? (
          <p key={i} className={pClass}>{b.text}</p>
        ) : b.type === 'code' ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
          >
            {b.lines.join('\n')}
          </pre>
        ) : (
          <div key={i} className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm tabular-nums">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {b.rows[0].map((c, j) => (
                    <th key={j} className="px-3 py-2 text-left font-bold text-slate-700 dark:text-slate-200">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.slice(1).map((row, r) => (
                  <tr key={r} className="border-t border-slate-100 dark:border-slate-800">
                    {row.map((c, j) => (
                      <td key={j} className="px-3 py-2 text-slate-700 dark:text-slate-300">{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
