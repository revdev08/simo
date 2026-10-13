// Columnas por día con un valor al pasar el cursor. Una sola serie por gráfico: el título dice qué se cuenta.
const fechaCorta = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const etiqueta = (dia: string) => fechaCorta.format(new Date(`${dia}T12:00:00Z`)).replace('.', '')

// Tope del eje redondeado (1, 2, 5, 10, 20, 50…) para que las marcas sean números limpios
function topeLimpio(max: number) {
  if (max <= 1) return 1
  const base = 10 ** Math.floor(Math.log10(max))
  return ([1, 2, 5, 10].map((m) => m * base).find((t) => t >= max) ?? 10 * base)
}

export default function BarrasPorDia({
  titulo,
  unidad,
  filas,
  colorBarra,
}: {
  titulo: string
  unidad: [string, string] // singular y plural, para el texto al pasar el cursor
  filas: { dia: string; valor: number }[]
  colorBarra: string // clases de fondo de Tailwind, con su variante oscura
}) {
  const tope = topeLimpio(Math.max(...filas.map((f) => f.valor), 0))
  const medio = tope / 2
  const marcas = [tope, Number.isInteger(medio) ? medio : null, 0].filter((m): m is number => m !== null)
  const total = filas.reduce((s, f) => s + f.valor, 0)
  const centro = filas[Math.floor((filas.length - 1) / 2)]

  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <figcaption className="mb-4 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{titulo}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {total} en {filas.length} días
        </span>
      </figcaption>

      <div className="flex gap-2">
        {/* Eje vertical: solo el tope, la mitad y el cero */}
        <div className="relative h-40 w-6 shrink-0 text-right text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
          {marcas.map((m) => (
            <span key={m} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - m / tope) * 100}%` }}>
              {m}
            </span>
          ))}
        </div>

        <div className="relative h-40 flex-1">
          {marcas.map((m) => (
            <div
              key={m}
              className={`absolute inset-x-0 border-t ${m === 0 ? 'border-slate-300 dark:border-slate-600' : 'border-dashed border-slate-100 dark:border-slate-800'}`}
              style={{ top: `${(1 - m / tope) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-stretch gap-[2px]">
            {filas.map((f) => (
              <div key={f.dia} className="group relative flex flex-1 items-end justify-center">
                <div
                  className={`w-full max-w-6 rounded-t ${colorBarra} transition-opacity group-hover:opacity-80`}
                  style={{ height: `${(f.valor / tope) * 100}%` }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block dark:bg-slate-700">
                  {etiqueta(f.dia)}: <span className="font-semibold">{f.valor}</span> {f.valor === 1 ? unidad[0] : unidad[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Eje horizontal: primer día, el del medio y hoy */}
      <div className="ml-8 mt-2 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>{etiqueta(filas[0].dia)}</span>
        <span>{etiqueta(centro.dia)}</span>
        <span>Hoy</span>
      </div>
    </figure>
  )
}
