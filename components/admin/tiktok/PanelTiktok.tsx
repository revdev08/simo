import Link from 'next/link'
import type { Periodo, Publicacion, ResumenMiembro } from '@/lib/admin/tiktok'
import { quitarPublicacion } from '@/app/admin/tiktok/acciones'
import FormularioPublicacion from './FormularioPublicacion'

const numero = new Intl.NumberFormat('es-CO')
const fechaHora = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' })
const diaCorto = new Intl.DateTimeFormat('es-CO', { day: 'numeric', timeZone: 'UTC' })
const diaSemana = new Intl.DateTimeFormat('es-CO', { weekday: 'narrow', timeZone: 'UTC' })
const fechaDia = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
const comoFecha = (dia: string) => new Date(`${dia}T12:00:00Z`)

const PERIODOS: { valor: Periodo; texto: string }[] = [
  { valor: 7, texto: '7 días' },
  { valor: 30, texto: '30 días' },
  { valor: 90, texto: '90 días' },
  { valor: 'todo', texto: 'Todo' },
]

// Celdas de la cuadrícula: un solo tono que se oscurece con la cantidad de videos del día
function claseCelda(n: number, meta: number) {
  if (n >= meta) return 'bg-blue-700 text-white dark:bg-blue-400 dark:text-slate-950'
  if (n >= meta - 1) return 'bg-blue-500 text-white dark:bg-blue-600'
  if (n >= Math.ceil(meta / 2)) return 'bg-blue-300 text-slate-900 dark:bg-blue-800 dark:text-white'
  if (n > 0) return 'bg-blue-100 text-slate-900 dark:bg-blue-950 dark:text-blue-100'
  return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
}

function Avatar({ nombre, foto }: { nombre: string; foto: string | null }) {
  return foto ? (
    // eslint-disable-next-line @next/next/no-img-element -- foto de perfil de Clerk, pequeña y de otro dominio
    <img src={foto} alt="" className="h-9 w-9 rounded-full object-cover" />
  ) : (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
      {nombre.slice(0, 1).toUpperCase()}
    </span>
  )
}

function Barra({ valor, meta }: { valor: number; meta: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={meta}>
      <div className={`h-full rounded-full ${valor >= meta ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'}`} style={{ width: `${Math.min(valor / meta, 1) * 100}%` }} />
    </div>
  )
}

export default function PanelTiktok({
  periodo,
  hoy,
  meta,
  inicio,
  resumen,
  cuadricula,
  recientes,
  miUsuario,
  errores,
}: {
  periodo: Periodo
  hoy: string
  meta: number
  inicio: string
  resumen: ResumenMiembro[]
  cuadricula: string[] // días de la cuadrícula, del más antiguo a hoy
  recientes: (Publicacion & { nombre: string })[]
  miUsuario: string
  errores: string[]
}) {
  const yo = resumen.find((r) => r.miembro.id === miUsuario)
  const hayVistas = resumen.some((r) => r.vistas !== null)
  const textoPeriodo = periodo === 'todo' ? 'desde el inicio' : `en ${periodo} días`

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publicaciones en TikTok</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Meta: {meta} videos por persona al día · hora de Colombia · {fechaDia.format(comoFecha(hoy))}
            </p>
          </div>
          <nav className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Periodo">
            {PERIODOS.map((p) => (
              <Link
                key={p.valor}
                href={`/admin/tiktok?periodo=${p.valor}`}
                aria-current={p.valor === periodo ? 'page' : undefined}
                className={`rounded-lg px-3 py-1.5 font-medium ${p.valor === periodo ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {p.texto}
              </Link>
            ))}
          </nav>
        </header>

        {errores.map((e) => (
          <p key={e} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {e}
          </p>
        ))}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Registrar un video</h2>
            {yo && (
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Hoy llevas <span className="font-semibold text-slate-900 dark:text-white">{yo.hoy}</span> de {meta}
              </span>
            )}
          </div>
          {yo && (
            <div className="mb-4">
              <Barra valor={yo.hoy} meta={meta} />
            </div>
          )}
          <FormularioPublicacion />
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {resumen.map((r) => {
            const cumplimiento = r.diasEvaluados ? Math.round((r.diasCumplidos / r.diasEvaluados) * 100) : null
            return (
              <article key={r.miembro.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <Avatar nombre={r.miembro.nombre} foto={r.miembro.foto} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {r.miembro.nombre}
                      {r.miembro.id === miUsuario && <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">(tú)</span>}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{r.miembro.correo}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Hoy</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {r.hoy} / {meta} {r.hoy >= meta && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
                    </span>
                  </div>
                  <Barra valor={r.hoy} meta={meta} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Días cumplidos</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white">
                      {cumplimiento === null ? '—' : `${cumplimiento} %`}
                      {r.diasEvaluados > 0 && (
                        <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                          {r.diasCumplidos} de {r.diasEvaluados}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Racha</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white">
                      {r.racha} {r.racha === 1 ? 'día' : 'días'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Videos {textoPeriodo}</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white">{numero.format(r.publicadas)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Visualizaciones</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white" title={hayVistas ? undefined : 'Llegan cuando se conecte la app de TikTok'}>
                      {r.vistas === null ? '—' : numero.format(r.vistas)}
                    </dd>
                  </div>
                </dl>
              </article>
            )
          })}
        </section>

        {resumen.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Videos por día · últimos {cuadricula.length} días</h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400" aria-hidden>
                <span>0</span>
                {[1, Math.ceil(meta / 2), meta - 1, meta].map((n) => (
                  <span key={n} className={`h-3 w-3 rounded-sm ${claseCelda(n, meta)}`} />
                ))}
                <span>{meta}+</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="border-separate border-spacing-[3px] text-xs">
                <thead>
                  <tr>
                    <th />
                    {cuadricula.map((d) => (
                      <th key={d} className="w-7 min-w-7 text-center font-normal text-slate-400 dark:text-slate-500">
                        <span className="block">{diaSemana.format(comoFecha(d))}</span>
                        <span className="block">{diaCorto.format(comoFecha(d))}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resumen.map((r) => (
                    <tr key={r.miembro.id}>
                      <th scope="row" className="max-w-28 truncate pr-2 text-left font-medium text-slate-700 dark:text-slate-300">
                        {r.miembro.nombre.split(' ')[0]}
                      </th>
                      {cuadricula.map((d) => {
                        const n = r.porDia[d] ?? 0
                        const antes = d < inicio
                        return (
                          <td
                            key={d}
                            title={`${fechaDia.format(comoFecha(d))}: ${n} de ${meta}${antes ? ' (antes del control)' : ''}`}
                            className={`h-7 w-7 min-w-7 rounded-md text-center font-semibold tabular-nums ${antes ? 'border border-dashed border-slate-200 text-slate-400 dark:border-slate-700' : claseCelda(n, meta)} ${d === hoy ? 'ring-2 ring-slate-400 ring-offset-1 dark:ring-slate-500 dark:ring-offset-slate-900' : ''}`}
                          >
                            {n || ''}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">Últimos videos registrados</h2>
          {recientes.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">Todavía no hay videos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium sm:px-5">Publicado</th>
                    <th className="px-3 py-2 font-medium sm:px-5">Persona</th>
                    <th className="px-3 py-2 font-medium sm:px-5">Video</th>
                    {hayVistas && <th className="px-3 py-2 text-right font-medium sm:px-5">Vistas</th>}
                    <th className="px-3 py-2 sm:px-5" />
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300 sm:px-5">{fechaHora.format(new Date(p.publicadaEn))}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300 sm:px-5">{p.nombre}</td>
                      <td className="px-3 py-2 sm:px-5">
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                          @{p.autor ?? 'video'}
                        </a>
                      </td>
                      {hayVistas && (
                        <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300 sm:px-5">{p.vistas === null ? '—' : numero.format(p.vistas)}</td>
                      )}
                      <td className="px-3 py-2 text-right sm:px-5">
                        {p.userId === miUsuario && (
                          <form action={quitarPublicacion}>
                            <input type="hidden" name="id" value={p.id} />
                            <button type="submit" className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400">
                              Quitar
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Cada video cuenta el día en que se publicó en TikTok (la hora sale del propio enlace), no el día en que se registró, así que no sirve
          registrar videos viejos para completar el día. Un día está cumplido con {meta} videos o más; el de hoy cuenta cuando termina. El
          control empezó el {fechaDia.format(comoFecha(inicio))}. {hayVistas ? '' : 'Las visualizaciones aparecerán cuando se conecte la app de TikTok.'}
        </p>
      </div>
    </main>
  )
}
