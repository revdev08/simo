import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin/acceso'
import { resumenEjes } from '@/lib/admin/ejes'

export const metadata = { title: 'Ejes temáticos · Administración', robots: { index: false, follow: false } }

const RANGOS = [7, 30, 90]
const numero = new Intl.NumberFormat('es-CO')

// Lista completa para revisarla fuera del panel (la tabla se ve con desplazamiento). Con BOM para que Excel lea las tildes.
const celda = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
const csvFaltantes = (filas: { eje: string; veces: number; convocatorias: string[] }[]) =>
  String.fromCharCode(0xfeff) + ['eje,veces,donde', ...filas.map((f) => [celda(f.eje), f.veces, celda(f.convocatorias.join(' · '))].join(','))].join('\n')

function Dato({ titulo, valor, nota }: { titulo: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{titulo}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{valor}</p>
      {nota && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{nota}</p>}
    </div>
  )
}

export default async function EjesPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/')
  if (!(await esAdmin())) notFound()

  const { dias: pedido } = await searchParams
  const dias = RANGOS.includes(Number(pedido)) ? Number(pedido) : 30
  const r = await resumenEjes(dias)

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ejes temáticos que piden los aspirantes</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Lo que pegan en «Ajusta el plan a tu empleo» y no reconocemos: son los temas para los que faltan preguntas. No se guarda quién lo pegó.
            </p>
          </div>
          <nav className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Periodo">
            {RANGOS.map((d) => (
              <Link
                key={d}
                href={`/admin/ejes?dias=${d}`}
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
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <Dato titulo="Consultas" valor={numero.format(r.datos.consultas)} nota={`${numero.format(r.datos.ejesPegados)} ejes pegados`} />
              <Dato
                titulo="Con algún eje sin cubrir"
                valor={numero.format(r.datos.conFaltantes)}
                nota={r.datos.consultas ? `${Math.round((100 * r.datos.conFaltantes) / r.datos.consultas)}% de las consultas` : undefined}
              />
              <Dato
                titulo="Ejes sin cubrir"
                valor={numero.format(r.datos.ejesSinCobertura)}
                nota={r.datos.ejesPegados ? `${Math.round((100 * r.datos.ejesSinCobertura) / r.datos.ejesPegados)}% de los ejes pegados` : undefined}
              />
            </section>
            {r.datos.truncado && (
              <p className="text-xs text-slate-500 dark:text-slate-400">Se muestran solo las 5.000 consultas más recientes del periodo.</p>
            )}

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">Por convocatoria</h2>
                {r.datos.porConvocatoria.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">Sin consultas en este periodo.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                    {r.datos.porConvocatoria.map((c) => (
                      <li key={c.nombre} className="flex justify-between gap-3 px-5 py-2">
                        <span className="text-slate-700 dark:text-slate-300">{c.nombre}</span>
                        <span className="tabular-nums text-slate-500 dark:text-slate-400">{numero.format(c.consultas)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Ejes sin preguntas, de más a menos pedidos</h2>
                  {r.datos.faltantes.length > 0 && (
                    <a
                      href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvFaltantes(r.datos.faltantes))}`}
                      download={`ejes-sin-preguntas-${dias}-dias.csv`}
                      className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Descargar la lista completa (CSV)
                    </a>
                  )}
                </div>
                {r.datos.faltantes.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">Ninguno en este periodo.</p>
                ) : (
                  <div className="max-h-[36rem] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white text-left text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                        <tr>
                          <th className="px-3 py-2 font-medium sm:px-5">Eje</th>
                          <th className="px-3 py-2 text-right font-medium sm:px-5">Veces</th>
                          <th className="px-3 py-2 font-medium sm:px-5">Dónde</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.datos.faltantes.map((f) => (
                          <tr key={f.eje} className="border-t border-slate-100 align-top dark:border-slate-800">
                            <td className="px-3 py-2 text-slate-800 dark:text-slate-200 sm:px-5">{f.eje}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300 sm:px-5">{numero.format(f.veces)}</td>
                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 sm:px-5">{f.convocatorias.join(' · ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
