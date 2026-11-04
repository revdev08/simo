import { Wallet } from 'lucide-react'
import { saldoMercadoPago } from '@/lib/admin/saldoMercadoPago'

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const fechaHora = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' })
const fecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' })

const caja = 'rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900'

function Titulo() {
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
      <Wallet className="h-4 w-4" aria-hidden />
      Dinero disponible en Mercado Pago
    </p>
  )
}

// Mientras se consulta el reporte (puede tardar unos segundos), el resto del panel ya se ve
export function SaldoCargando() {
  return (
    <section className={caja} aria-busy="true">
      <Titulo />
      <div className="mt-2 h-8 w-40 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    </section>
  )
}

export default async function SaldoMercadoPago() {
  const r = await saldoMercadoPago()

  if (!r.ok) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        No se pudo leer el saldo de Mercado Pago: {r.error}
      </p>
    )
  }

  const d = r.datos
  if (d.saldo === null) {
    return (
      <section className={caja}>
        <Titulo />
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {d.actualizando
            ? 'Mercado Pago está preparando el primer reporte de dinero liberado. El saldo aparece aquí en unos minutos.'
            : (d.aviso ?? 'Todavía no hay un reporte de dinero liberado.')}
        </p>
        {d.diagnostico && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Último reporte pedido: {d.diagnostico}.</p>}
      </section>
    )
  }

  return (
    <section className={`${caja} flex flex-wrap items-end justify-between gap-x-8 gap-y-4`}>
      <div>
        <Titulo />
        <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">{pesos.format(d.saldo)}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {d.corte ? `Al ${fechaHora.format(new Date(d.corte))}` : 'Último reporte'} · según el reporte de dinero liberado
          {d.actualizando && ' · ya se pidió uno más reciente'}
        </p>
      </div>
      <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        {d.liberado !== null && (
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Liberado{d.desde ? ` desde el ${fecha.format(new Date(d.desde))}` : ''}</dt>
            <dd className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{pesos.format(d.liberado)}</dd>
          </div>
        )}
        {d.retirado !== null && (
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Retirado en ese periodo</dt>
            <dd className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{pesos.format(d.retirado)}</dd>
          </div>
        )}
      </dl>
      <p className="w-full text-xs text-slate-500 dark:text-slate-400">
        No incluye el dinero que aún está por liberar. Mercado Pago aclara que el reporte es informativo y puede no coincidir
        al peso con el saldo de la cuenta.
        {d.descuadre !== null && ` Las filas del reporte no suman lo mismo que su total (diferencia de ${pesos.format(d.descuadre)}).`}
        {d.aviso && ` ${d.aviso}`}
      </p>
    </section>
  )
}
