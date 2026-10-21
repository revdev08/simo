import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin/acceso'
import { resumenCancelaciones } from '@/lib/admin/cancelaciones'

export const metadata = { title: 'Cancelaciones · Administración', robots: { index: false, follow: false } }

const RANGOS = [7, 30, 90]
const fechaHora = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' })
const fecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Bogota' })

export default async function CancelacionesPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/')
  if (!(await esAdmin())) notFound()

  const { dias: pedido } = await searchParams
  const dias = RANGOS.includes(Number(pedido)) ? Number(pedido) : 30
  const r = await resumenCancelaciones(dias)

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cancelaciones</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Quienes cancelaron la renovación desde «Mi progreso» y por qué. Las cancelaciones hechas directamente en Mercado Pago no aparecen aquí.
            </p>
          </div>
          <nav className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Periodo">
            {RANGOS.map((d) => (
              <Link
                key={d}
                href={`/admin/cancelaciones?dias=${d}`}
                aria-current={d === dias ? 'page' : undefined}
                className={`rounded-lg px-3 py-1.5 font-medium ${d === dias ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {d} días
              </Link>
            ))}
          </nav>
        </header>

        {!r.ok ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{r.error}</p>
        ) : (
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
                Motivos · {r.datos.total} {r.datos.total === 1 ? 'cancelación' : 'cancelaciones'}
              </h2>
              {r.datos.porMotivo.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">Ninguna en este periodo.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                  {r.datos.porMotivo.map((m) => (
                    <li key={m.motivo} className="flex justify-between gap-3 px-5 py-2">
                      <span className="text-slate-700 dark:text-slate-300">{m.motivo}</span>
                      <span className="tabular-nums text-slate-500 dark:text-slate-400">{m.veces}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">Recientes</h2>
              {r.datos.recientes.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">Ninguna en este periodo.</p>
              ) : (
                <div className="max-h-[36rem] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white text-left text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-medium sm:px-5">Fecha</th>
                        <th className="px-3 py-2 font-medium sm:px-5">Correo</th>
                        <th className="px-3 py-2 font-medium sm:px-5">Plan</th>
                        <th className="px-3 py-2 font-medium sm:px-5">Motivo</th>
                        <th className="px-3 py-2 font-medium sm:px-5">Acceso hasta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.datos.recientes.map((c, i) => (
                        <tr key={i} className="border-t border-slate-100 align-top dark:border-slate-800">
                          <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300 sm:px-5">{fechaHora.format(new Date(c.fecha))}</td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300 sm:px-5">{c.correo ?? '—'}</td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300 sm:px-5">{c.plan ?? '—'}</td>
                          <td className="px-3 py-2 text-slate-800 dark:text-slate-200 sm:px-5">
                            {c.motivo}
                            {c.comentario && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">«{c.comentario}»</p>}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300 sm:px-5">{c.accesoHasta ? fecha.format(new Date(c.accesoHasta)) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
