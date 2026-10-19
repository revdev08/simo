'use client'

// «Tu suscripción» en Mi progreso: plan, próximo cobro y cancelar la renovación.
// Cancelar es tan claro como suscribirse: dos pasos, sin botones escondidos. Antes de confirmar se pregunta el
// motivo (opcional) y se ofrece lo que podría resolverlo, con lo que de verdad pasa al cancelar.
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { CalendarCheck, CheckCircle2, CreditCard, Info, Loader2 } from 'lucide-react'
import { cancelarSuscripcion, type ResultadoCancelacion } from '@/app/dashboard/report/acciones'
import { MAX_COMENTARIO_CANCELACION, MOTIVOS_CANCELACION, type MotivoCancelacion } from '@/lib/cancelacion'

export type DatosSuscripcion = {
  estado: 'activa' | 'cancelada' | 'pendiente'
  plan: string | null
  valor: number | null
  cadaCuanto: string | null
  accesoHasta: string | null
}

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const fecha = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' }).format(new Date(iso))
const CORREO = 'revolutiondev08@gmail.com'
const enlace = 'font-semibold text-brand-700 underline-offset-2 hover:underline dark:text-brand-300'

// Qué le podría servir según el motivo; sin presión: solo información útil
function Alternativa({ motivo, mensual }: { motivo: MotivoCancelacion | null; mensual: boolean }) {
  if (motivo === 'ya_presente') return <p>¡Mucha suerte con los resultados! Si te presentas a otro concurso, tu progreso sigue aquí.</p>
  if (motivo === 'precio')
    return mensual ? (
      <p>
        El plan semestral sale a unos $15.000 al mes, frente a $39.900 del mensual. Si cancelas, puedes tomarlo cuando termine tu acceso actual.{' '}
        <Link href="/#planes" className={enlace}>Ver planes</Link>
      </p>
    ) : (
      <p>Entendemos. Tu acceso sigue hasta la fecha de abajo, así que puedes aprovecharlo completo antes de irte.</p>
    )
  if (motivo === 'sin_tiempo')
    return (
      <p>
        Puedes ajustar tu plan a 3 horas por semana: te decimos qué estudiar primero según lo que más pesa en tu prueba.{' '}
        <Link href="/dashboard" className={enlace}>Ajustar mi plan</Link>
      </p>
    )
  if (motivo === 'no_encuentro_concurso')
    return (
      <p>
        Pega los ejes temáticos de tu empleo y armamos el plan con ellos, o escríbenos tu convocatoria y tu cargo a{' '}
        <a href={`mailto:${CORREO}`} className={enlace}>{CORREO}</a>.{' '}
        <Link href="/mi-convocatoria" className={enlace}>Armar plan con mis ejes</Link>
      </p>
    )
  if (motivo === 'contenido')
    return (
      <p>
        Cuéntanos qué falló a <a href={`mailto:${CORREO}`} className={enlace}>{CORREO}</a> o reporta la pregunta desde el botón de cada una: las revisamos todas.
      </p>
    )
  return null
}

export default function SuscripcionCard({
  suscripcion,
  respondidas,
  fechaPrueba,
}: {
  suscripcion: DatosSuscripcion
  respondidas: number
  fechaPrueba?: { nombre: string; fecha: string } | null
}) {
  const [paso, setPaso] = useState<'inicio' | 'motivo' | 'confirmar'>('inicio')
  const [motivo, setMotivo] = useState<MotivoCancelacion | null>(null)
  const [comentario, setComentario] = useState('')
  const [resultado, accion, enviando] = useActionState<ResultadoCancelacion, FormData>(cancelarSuscripcion, null)

  const { estado, plan, valor, cadaCuanto, accesoHasta } = suscripcion
  const cancelada = estado === 'cancelada' || resultado?.ok === true
  const hasta = (resultado?.ok ? resultado.accesoHasta : null) ?? accesoHasta
  const antesDeLaPrueba = !!(hasta && fechaPrueba && new Date(hasta) < new Date(`${fechaPrueba.fecha}T23:59:59-05:00`))
  const mantener = () => {
    setPaso('inicio')
    setMotivo(null)
    setComentario('')
  }

  return (
    <section id="suscripcion" aria-labelledby="suscripcion-title" className="scroll-mt-24 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8">
      <h2 id="suscripcion-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        <CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden /> Tu suscripción
      </h2>

      <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-white">
          {plan ?? 'Premium'}
          {valor && cadaCuanto && <span className="font-normal text-slate-600 dark:text-slate-400"> · {pesos.format(valor)} {cadaCuanto}</span>}
        </p>
        {cancelada ? (
          <p className="mt-1">
            Renovación cancelada: no se te volverá a cobrar.{hasta ? ` Sigues con acceso hasta el ${fecha(hasta)}.` : ''}
          </p>
        ) : estado === 'pendiente' ? (
          <p className="mt-1">Tu pago está en proceso con Mercado Pago.</p>
        ) : (
          hasta && <p className="mt-1">Se renueva el {fecha(hasta)}.</p>
        )}
      </div>

      {resultado?.ok && (
        <p role="status" className="mt-4 flex gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden />
          <span>
            Listo, cancelamos la renovación.{hasta ? ` Puedes seguir estudiando hasta el ${fecha(hasta)}.` : ''}
          </span>
        </p>
      )}

      {estado === 'activa' && !cancelada && paso === 'inicio' && (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={() => setPaso('motivo')}
            className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancelar suscripción
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">Puedes cancelar cuando quieras; conservas el acceso hasta el final del periodo pagado.</span>
        </div>
      )}

      {estado === 'activa' && !cancelada && paso === 'motivo' && (
        <fieldset className="mt-5">
          <legend className="font-semibold text-slate-900 dark:text-white">¿Por qué quieres cancelar?</legend>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">Es opcional, pero nos ayuda a mejorar.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {MOTIVOS_CANCELACION.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm ${
                  motivo === m.id ? 'border-brand-600 bg-brand-50 dark:bg-brand-500/10 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300'
                }`}
              >
                <input type="radio" name="motivo-elegido" value={m.id} checked={motivo === m.id} onChange={() => setMotivo(m.id)} className="accent-brand-600" />
                {m.texto}
              </label>
            ))}
          </div>
          {motivo === 'otro' && (
            <label className="mt-3 block text-sm">
              <span className="text-slate-700 dark:text-slate-300">Cuéntanos (opcional)</span>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                maxLength={MAX_COMENTARIO_CANCELACION}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-slate-900 dark:text-slate-100"
              />
            </label>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => setPaso('confirmar')} className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              Continuar
            </button>
            <button type="button" onClick={mantener} className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
              Mantener mi suscripción
            </button>
          </div>
        </fieldset>
      )}

      {estado === 'activa' && !cancelada && paso === 'confirmar' && (
        <form action={accion} className="mt-5 space-y-4">
          <input type="hidden" name="motivo" value={motivo ?? ''} />
          <input type="hidden" name="comentario" value={comentario} />
          {motivo && motivo !== 'otro' && (
            <div className="flex gap-2 rounded-2xl bg-brand-50 dark:bg-brand-500/10 p-4 text-sm text-slate-700 dark:text-slate-200">
              <Info className="w-5 h-5 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
              <Alternativa motivo={motivo} mensual={plan?.includes('mensual') ?? false} />
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Si cancelas:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-emerald-600" aria-hidden /> No se te volverá a cobrar.</li>
              {hasta && (
                <li className="flex gap-2">
                  <CalendarCheck className="mt-0.5 w-4 h-4 shrink-0 text-emerald-600" aria-hidden /> Sigues con acceso hasta el {fecha(hasta)}.
                </li>
              )}
              {respondidas > 0 && (
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-emerald-600" aria-hidden /> Tu progreso queda guardado: {respondidas.toLocaleString('es-CO')}{' '}
                  {respondidas === 1 ? 'pregunta respondida' : 'preguntas respondidas'}.
                </li>
              )}
              {antesDeLaPrueba && fechaPrueba && (
                <li className="flex gap-2 text-amber-800 dark:text-amber-300">
                  <Info className="mt-0.5 w-4 h-4 shrink-0" aria-hidden /> Tu acceso terminaría antes de tu prueba de {fechaPrueba.nombre}, el {fecha(`${fechaPrueba.fecha}T12:00:00-05:00`)}.
                </li>
              )}
            </ul>
          </div>
          {resultado?.ok === false && (
            <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{resultado.error}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={mantener} className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
              Mantener mi suscripción
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-500/50 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60"
            >
              {enviando && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              {enviando ? 'Cancelando…' : 'Confirmar cancelación'}
            </button>
          </div>
        </form>
      )}

      <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
        También puedes gestionarla en{' '}
        <a href="https://www.mercadopago.com.co/subscriptions" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
          Mercado Pago
        </a>{' '}
        con la cuenta con la que pagaste. ¿Algún problema? Escríbenos a{' '}
        <a href={`mailto:${CORREO}`} className="underline-offset-2 hover:underline">{CORREO}</a>.
      </p>
    </section>
  )
}
