import Link from 'next/link'
import type { FilaDia } from '@/lib/admin/metricas'
import BarrasPorDia from './BarrasPorDia'

export type SuscripcionReciente = { fecha: string; correo: string | null; estado: string; cobros: number; monto: number | null }

const ESTADOS: Record<string, { texto: string; clase: string }> = {
  authorized: { texto: 'Activa', clase: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  paused: { texto: 'Pausada', clase: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  cancelled: { texto: 'Cancelada', clase: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  pending: { texto: 'Pendiente', clase: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

const numero = new Intl.NumberFormat('es-CO')
const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const fechaLarga = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const fechaHora = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' })
const diaTexto = (dia: string) => fechaLarga.format(new Date(`${dia}T12:00:00Z`)).replace(/\./g, '')
const suma = (filas: FilaDia[], campo: 'registros' | 'nuevas') => filas.reduce((s, f) => s + (f[campo] ?? 0), 0)

function Cifra({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{etiqueta}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{detalle}</p>}
    </div>
  )
}

export default function PanelSuscriptores({
  dias,
  rangos,
  filas,
  totalUsuarios,
  activas,
  recientes,
  errores,
  generado,
}: {
  dias: number
  rangos: number[]
  filas: FilaDia[]
  totalUsuarios: number | null
  activas: number | null
  recientes: SuscripcionReciente[] | null
  errores: string[]
  generado: string
}) {
  const hayRegistros = filas.length > 0 && filas[0].registros !== null
  const haySuscripciones = filas.length > 0 && filas[0].nuevas !== null
  const hoy = filas[filas.length - 1]
  const ayer = filas.length > 1 ? filas[filas.length - 2] : null
  const nuevasPeriodo = suma(filas, 'nuevas')
  const registrosPeriodo = suma(filas, 'registros')
  const conversion = hayRegistros && haySuscripciones && registrosPeriodo > 0 ? (nuevasPeriodo / registrosPeriodo) * 100 : null

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Administración</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Suscriptores por día</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Hora de Colombia · actualizado {fechaHora.format(new Date(generado))}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/api/checkout?plan=desarrollador"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
            >
              Compra de prueba · $2.000
            </Link>
            <nav className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Periodo">
              {rangos.map((r) => (
                <Link
                  key={r}
                  href={`/admin?dias=${r}`}
                  aria-current={r === dias ? 'page' : undefined}
                  className={`rounded-lg px-3 py-1.5 font-medium ${r === dias ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  {r} días
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {errores.map((e) => (
          <p key={e} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {e}
          </p>
        ))}

        {haySuscripciones && (
          <section className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-blue-600 p-5 text-white sm:col-span-1">
              <p className="text-xs font-medium text-blue-100">Suscriptores nuevos hoy</p>
              <p className="mt-1 text-5xl font-semibold">{numero.format(hoy.nuevas ?? 0)}</p>
            </div>
            <Cifra etiqueta="Ayer" valor={numero.format(ayer?.nuevas ?? 0)} detalle="suscriptores nuevos" />
            <Cifra etiqueta={`Últimos ${dias} días`} valor={numero.format(nuevasPeriodo)} detalle="suscriptores nuevos" />
            <Cifra etiqueta="Activos ahora" valor={activas === null ? '—' : numero.format(activas)} detalle="con el cobro autorizado" />
          </section>
        )}

        {hayRegistros && (
          <section className="grid gap-3 sm:grid-cols-4">
            <Cifra etiqueta="Registros hoy" valor={numero.format(hoy.registros ?? 0)} />
            <Cifra etiqueta="Registros ayer" valor={numero.format(ayer?.registros ?? 0)} />
            <Cifra etiqueta={`Registros en ${dias} días`} valor={numero.format(registrosPeriodo)} />
            <Cifra
              etiqueta="Conversión del periodo"
              valor={conversion === null ? '—' : `${conversion.toFixed(1).replace('.', ',')} %`}
              detalle={totalUsuarios === null ? undefined : `${numero.format(totalUsuarios)} usuarios en total`}
            />
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-2">
          {haySuscripciones && (
            <BarrasPorDia
              titulo="Suscriptores nuevos por día"
              unidad={['suscriptor', 'suscriptores']}
              filas={filas.map((f) => ({ dia: f.dia, valor: f.nuevas ?? 0 }))}
              colorBarra="bg-blue-600 dark:bg-blue-500"
            />
          )}
          {hayRegistros && (
            <BarrasPorDia
              titulo="Registros por día"
              unidad={['registro', 'registros']}
              filas={filas.map((f) => ({ dia: f.dia, valor: f.registros ?? 0 }))}
              colorBarra="bg-slate-500 dark:bg-slate-400"
            />
          )}
        </section>

        {recientes && recientes.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
              Últimas suscripciones
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2 sm:px-5 font-medium">Fecha</th>
                    <th className="px-3 py-2 sm:px-5 font-medium">Correo</th>
                    <th className="px-3 py-2 sm:px-5 font-medium">Estado</th>
                    <th className="px-3 py-2 sm:px-5 text-right font-medium">Cobros</th>
                    <th className="px-3 py-2 sm:px-5 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((s, i) => {
                    const estado = ESTADOS[s.estado] ?? { texto: s.estado, clase: ESTADOS.pending.clase }
                    return (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="whitespace-nowrap px-3 py-2 sm:px-5 text-slate-700 dark:text-slate-300">{fechaHora.format(new Date(s.fecha))}</td>
                        <td className="px-3 py-2 sm:px-5 text-slate-700 dark:text-slate-300">{s.correo ?? '—'}</td>
                        <td className="px-3 py-2 sm:px-5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estado.clase}`}>{estado.texto}</span>
                        </td>
                        <td className="px-3 py-2 sm:px-5 text-right tabular-nums text-slate-700 dark:text-slate-300">{s.cobros}</td>
                        <td className="whitespace-nowrap px-3 py-2 sm:px-5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                          {s.monto === null ? '—' : pesos.format(s.monto)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {(hayRegistros || haySuscripciones) && (
          <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">Detalle por día</h2>
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white text-left text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2 sm:px-5 font-medium">Día</th>
                    {hayRegistros && <th className="px-3 py-2 sm:px-5 text-right font-medium">Registros</th>}
                    {haySuscripciones && <th className="px-3 py-2 sm:px-5 text-right font-medium">Suscriptores nuevos</th>}
                    {haySuscripciones && <th className="px-3 py-2 sm:px-5 text-right font-medium">Siguen activos</th>}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {[...filas].reverse().map((f) => (
                    <tr key={f.dia} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="whitespace-nowrap px-3 py-2 sm:px-5 text-slate-700 dark:text-slate-300">{f.dia === hoy.dia ? 'Hoy' : diaTexto(f.dia)}</td>
                      {hayRegistros && <td className="px-3 py-2 sm:px-5 text-right text-slate-700 dark:text-slate-300">{f.registros}</td>}
                      {haySuscripciones && (
                        <td className={`px-3 py-2 sm:px-5 text-right ${f.nuevas ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>{f.nuevas}</td>
                      )}
                      {haySuscripciones && <td className="px-3 py-2 sm:px-5 text-right text-slate-500 dark:text-slate-400">{f.siguenActivas}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Suscriptor nuevo: suscripción creada ese día en Mercado Pago que autorizó el cobro o pagó al menos una vez, aunque después la haya cancelado.
          «Siguen activos» son los de ese día que hoy tienen el cobro autorizado. Los registros vienen de Clerk.
        </p>
      </div>
    </main>
  )
}
