import React from 'react'

// Muestra el enunciado respetando párrafos y convierte las líneas con "|" en una tabla.
// Los enunciados largos (textos de lectura, casos extensos) se muestran en letra normal para que se lean bien.
const LARGO = 400

function isTableLine(line: string) {
  return line.includes('|') && line.split('|').length >= 3
}

export default function QuestionText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n')
  const blocks: ({ type: 'p'; text: string } | { type: 'table'; rows: string[][] })[] = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (isTableLine(line)) {
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
