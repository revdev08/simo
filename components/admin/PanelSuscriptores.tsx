import Link from 'next/link'
import type { Cobro, FilaDia, PagoDelPanel, SuscripcionReciente } from '@/lib/admin/metricas'
import ActualizarMercadoPago from './ActualizarMercadoPago'
import BarrasPorDia from './BarrasPorDia'

const ESTADO_PAGO: Record<string, string> = {
  approved: 'aprobado',
  rejected: 'rechazado',
  refunded: 'devuelto',
  cancelled: 'cancelado',
  in_process: 'en revisión',
  pending: 'pendiente',
  charged_back: 'contracargo',
}

const MOTIVO_RECHAZO: Record<string, string> = {
  cc_rejected_insufficient_amount: 'fondos insuficientes',
  cc_rejected_bad_filled_security_code: 'código de seguridad incorrecto',
  cc_rejected_bad_filled_date: 'fecha de vencimiento incorrecta',
  cc_rejected_bad_filled_card_number: 'número de tarjeta incorrecto',
  cc_rejected_bad_filled_other: 'datos de la tarjeta incorrectos',
  cc_rejected_call_for_authorize: 'el banco pide autorizar el pago',
  cc_rejected_card_disabled: 'tarjeta inactiva',
  cc_rejected_card_error: 'error de la tarjeta',
  cc_rejected_duplicated_payment: 'pago duplicado',
  cc_rejected_high_risk: 'prevención de fraude',
  cc_rejected_max_attempts: 'demasiados intentos',
  cc_rejected_blacklist: 'tarjeta bloqueada',
  cc_rejected_other_reason: 'rechazado por el banco',
}

// Resumen de los pagos reales de una suscripción
function Pagos({ cobros, resumen }: { cobros: Cobro[] | null; resumen: number }) {
  if (!cobros) return <span className="text-slate-400 dark:text-slate-500" title={`No se pudieron consultar los pagos (el resumen de Mercado Pago dice ${resumen})`}>Sin verificar</span>
  if (!cobros.length) return <span className="text-slate-400 dark:text-slate-500">Sin pagos</span>
  const aprobados = cobros.filter((c) => c.estado === 'approved').length
  const aproximado = cobros.some((c) => c.aproximado)
  if (aprobados) {
    return (
      <span
        className="text-emerald-700 dark:text-emerald-400"
        title={aproximado ? 'Pago asociado por la cuenta de Mercado Pago y la hora, porque no traía el id de la suscripción' : undefined}
      >
        ✓ {aprobados} {aprobados === 1 ? 'aprobado' : 'aprobados'}
        {aproximado && ' ≈'}
        {cobros.length > aprobados && <span className="text-slate-500 dark:text-slate-400"> de {cobros.length}</span>}
      </span>
    )
  }
  const ultimo = cobros[0]
  const motivo = MOTIVO_RECHAZO[ultimo.detalle]
  return (
    <span className="text-rose-700 dark:text-rose-400" title={ultimo.detalle}>
      ✕ {ESTADO_PAGO[ultimo.estado] ?? ultimo.estado}
      {motivo && <span className="block text-xs text-slate-500 dark:text-slate-400">{motivo}</span>}
      {cobros.length > 1 && <span className="block text-xs text-slate-500 dark:text-slate-400">{cobros.length} intentos</span>}
    </span>
  )
}

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
const suma = (filas: FilaDia[], campo: 'registros' | 'nuevas' | 'recurrentes') => filas.reduce((s, f) => s + (f[campo] ?? 0), 0)

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
  generadoMercadoPago,
  minutosCache,
  nuevos,
  pruebas,
  sinSuscripcion,
}: {
  dias: number
  rangos: number[]
  filas: FilaDia[]
  totalUsuarios: number | null
  activas: number | null
  recientes: SuscripcionReciente[] | null
  errores: string[]
  generado: string
  generadoMercadoPago: string | null // los datos de Mercado Pago vienen de una caché y pueden ser de hace unos minutos
  minutosCache: number
  nuevos: PagoDelPanel[] | null // los suscriptores nuevos del periodo, del más reciente al más antiguo
  pruebas: number // compras de prueba del periodo, que no cuentan
  sinSuscripcion: number // suscripciones contadas por su pago porque Mercado Pago aún no las lista
}) {
  const hayRegistros = filas.length > 0 && filas[0].registros !== null
  const haySuscripciones = filas.length > 0 && filas[0].nuevas !== null
  const hoy = filas[filas.length - 1]
  const ayer = filas.length > 1 ? filas[filas.length - 2] : null
  const nuevasPeriodo = suma(filas, 'nuevas')
  const registrosPeriodo = suma(filas, 'registros')
  const conversion = hayRegistros && haySuscripciones && registrosPeriodo > 0 ? (nuevasPeriodo / registrosPeriodo) * 100 : null

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Suscriptores por día</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Hora de Colombia · registros actualizados {fechaHora.format(new Date(generado))}
              {generadoMercadoPago && (
                <span title={`Para no pasar el límite de peticiones de Mercado Pago, sus datos se consultan como mucho cada ${minutosCache} minutos`}>
                  {' '}· Mercado Pago {fechaHora.format(new Date(generadoMercadoPago))}
                </span>
              )}
            </p>
            {sinSuscripcion > 0 && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {sinSuscripcion === 1
                  ? 'Una suscripción reciente aún no aparece en la lista de Mercado Pago; ya se cuenta por su pago.'
                  : `${sinSuscripcion} suscripciones recientes aún no aparecen en la lista de Mercado Pago; ya se cuentan por su pago.`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {generadoMercadoPago && <ActualizarMercadoPago />}
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
            <Cifra etiqueta={ayer ? `Ayer · ${diaTexto(ayer.dia)}` : 'Ayer'} valor={numero.format(ayer?.nuevas ?? 0)} detalle="suscriptores nuevos" />
            <Cifra
              etiqueta={`Últimos ${dias} días`}
              valor={numero.format(nuevasPeriodo)}
              detalle={`suscriptores nuevos · ${numero.format(suma(filas, 'recurrentes'))} pagos recurrentes`}
            />
            <Cifra etiqueta="Activos ahora" valor={activas === null ? '—' : numero.format(activas)} detalle="con el cobro autorizado en Mercado Pago" />
          </section>
        )}

        {hayRegistros && (
          <section className="grid gap-3 sm:grid-cols-4">
            <Cifra etiqueta="Registros hoy" valor={numero.format(hoy.registros ?? 0)} />
            <Cifra etiqueta={ayer ? `Registros ayer · ${diaTexto(ayer.dia)}` : 'Registros ayer'} valor={numero.format(ayer?.registros ?? 0)} />
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

        {nuevos && (
          <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Quiénes son los {numero.format(nuevos.length)} suscriptores nuevos de los últimos {dias} días
              </h2>
              {pruebas > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  No incluye {pruebas} {pruebas === 1 ? 'compra' : 'compras'} de prueba de $2.000
                </span>
              )}
            </div>
            {nuevos.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">Ninguno en este periodo.</p>
            ) : (
              <div className="max-h-[24rem] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white text-left text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-medium sm:px-5">Primer pago</th>
                      <th className="px-3 py-2 font-medium sm:px-5">Correo</th>
                      <th className="px-3 py-2 text-right font-medium sm:px-5">Valor</th>
                      <th className="px-3 py-2 font-medium sm:px-5">Hoy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nuevos.map((n, i) => (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300 sm:px-5">{fechaHora.format(new Date(n.hora))}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300 sm:px-5">
                          {n.correo ?? '—'}
                          {n.correo && n.correoDeMercadoPago && (
                            <span
                              title="Correo con el que pagó en Mercado Pago: no se encontró su cuenta de SIMO y puede ser otro correo"
                              className="ml-1.5 rounded bg-sky-50 px-1 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                            >
                              MP
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300 sm:px-5">
                          {n.monto === null ? '—' : pesos.format(n.monto)}
                        </td>
                        <td className="px-3 py-2 sm:px-5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${n.activa ? ESTADOS.authorized.clase : ESTADOS.cancelled.clase}`}>
                            {n.activa ? 'Activa' : 'Sin cobro activo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

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
                    <th className="px-3 py-2 sm:px-5 text-right font-medium">Pagos</th>
                    <th className="px-3 py-2 sm:px-5 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((s, i) => {
                    const estado = ESTADOS[s.estado] ?? { texto: s.estado, clase: ESTADOS.pending.clase }
                    return (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="whitespace-nowrap px-3 py-2 sm:px-5 text-slate-700 dark:text-slate-300">{fechaHora.format(new Date(s.fecha))}</td>
                        <td className="px-3 py-2 sm:px-5 text-slate-700 dark:text-slate-300">
                          {s.correo ?? '—'}
                          {s.correoDeMercadoPago && (
                            <span
                              title="Correo con el que pagó en Mercado Pago: no se encontró su cuenta de SIMO y puede ser otro correo"
                              className="ml-1.5 rounded bg-sky-50 px-1 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                            >
                              MP
                            </span>
                          )}
                          {s.pagador && (
                            <span
                              title="Misma cuenta de Mercado Pago que las otras filas con esta letra"
                              className="ml-1.5 rounded bg-violet-50 px-1 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                            >
                              Pagador {s.pagador}
                            </span>
                          )}
                          {s.estado === 'authorized' && !s.enlazada && (
                            <span
                              title="Pagó, pero esta suscripción no está asociada a ningún usuario de SIMO: revisa si tiene acceso"
                              className="mt-0.5 block text-xs font-medium text-amber-700 dark:text-amber-400"
                            >
                              ⚠ Sin cuenta de SIMO enlazada
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 sm:px-5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estado.clase}`}>{estado.texto}</span>
                        </td>
                        <td className="px-3 py-2 sm:px-5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                          <Pagos cobros={s.cobros} resumen={s.cobrosResumen} />
                        </td>
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
                    {haySuscripciones && <th className="px-3 py-2 sm:px-5 text-right font-medium">Recurrentes</th>}
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
                      {haySuscripciones && <td className="px-3 py-2 sm:px-5 text-right text-slate-500 dark:text-slate-400">{f.recurrentes}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Suscriptor nuevo: persona cuyo primer pago aprobado fue ese día (fecha de aprobación del pago, hora de Colombia). No cuentan los intentos
          rechazados. «Recurrentes» son los pagos aprobados de quienes ya habían pagado antes: renovaciones mensuales y personas que vuelven a
          suscribirse. Las compras de prueba del plan de $2.000 no cuentan en ningún total. Un día pasado solo cambia si se devuelve un pago. Los totales
          de 7, 30 y 90 días son ventanas móviles: cada día entra el de hoy y sale el más antiguo, así que pueden bajar aunque nadie cancele. «Siguen activos» son los nuevos de ese día que hoy tienen el cobro autorizado. Los registros vienen de Clerk. El correo es el de la cuenta en SIMO; con «MP», es el correo con el que pagó en Mercado Pago. «Pagador A», «B»…: suscripciones hechas desde la misma cuenta de Mercado Pago. Los datos de Mercado Pago se renuevan como mucho cada {minutosCache} minutos para no pasar su límite de peticiones; si Mercado Pago falla al renovarlos, se muestran los últimos que se pudieron leer.
        </p>
      </div>
    </main>
  )
}
