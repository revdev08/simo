import { Wallet } from 'lucide-react'
import { saldoMercadoPago } from '@/lib/admin/saldoMercadoPago'
import ActualizarSaldo from './ActualizarSaldo'

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

// Título y contenido a la izquierda, botón de actualizar a la derecha (debajo en celular)
function Tarjeta({ esperando, children, pie }: { esperando: boolean; children: React.ReactNode; pie?: React.ReactNode }) {
  return (
    <section className={caja}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <Titulo />
          {children}
        </div>
        <ActualizarSaldo esperando={esperando} />
      </div>
      {pie}
    </section>
  )
}

export default async function SaldoMercadoPago() {
  const r = await saldoMercadoPago()

  if (!r.ok) {
    return (
      <Tarjeta esperando={false}>
        <p className="mt-2 max-w-2xl text-sm text-amber-700 dark:text-amber-300">No se pudo leer el saldo de Mercado Pago: {r.error}</p>
      </Tarjeta>
    )
  }

  const d = r.datos
  if (d.saldo === null) {
    return (
      <Tarjeta esperando={d.actualizando}>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {d.actualizando
            ? 'Mercado Pago está preparando el primer reporte de dinero liberado. El saldo aparece aquí en unos minutos.'
            : (d.aviso ?? 'Todavía no hay un reporte de dinero liberado.')}
        </p>
        {d.diagnostico && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Último reporte pedido: {d.diagnostico}.</p>}
      </Tarjeta>
    )
  }

  return (
    <Tarjeta
      esperando={d.actualizando}
      pie={
        <>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
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
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            No incluye el dinero que aún está por liberar. Mercado Pago aclara que el reporte es informativo y puede no
            coincidir al peso con el saldo de la cuenta.
            {d.descuadre !== null && ` Las filas del reporte no suman lo mismo que su total (diferencia de ${pesos.format(d.descuadre)}).`}
            {d.aviso && ` ${d.aviso}`}
          </p>
        </>
      }
    >
      <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">{pesos.format(d.saldo)}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {d.corte ? `Al ${fechaHora.format(new Date(d.corte))}` : 'Último reporte'} · según el reporte de dinero liberado
        {d.actualizando && ' · Mercado Pago está preparando uno más reciente'}
      </p>
    </Tarjeta>
  )
}
