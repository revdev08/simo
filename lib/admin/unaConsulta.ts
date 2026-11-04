// Protege una consulta cara a Mercado Pago de las recargas seguidas del panel. unstable_cache guarda el resultado,
// pero solo junta las consultas repetidas dentro de una misma petición: al vencer la caché, cada recarga lanza su propia
// renovación, y si la consulta falla no guarda nada y la siguiente recarga vuelve a intentarlo.
// - Mientras una consulta está en curso, las demás esperan esa misma en vez de lanzar otra.
// - Si falla, durante PAUSA_MS se responde con el mismo error sin llamar a Mercado Pago (la caché sigue mostrando
//   los últimos datos buenos, si los tiene).
// Vale por instancia del servidor: dos instancias distintas aún pueden consultar a la vez, pero es raro.
import 'server-only'

const PAUSA_MS = 60_000

export function unaConsulta<T>(fn: () => Promise<T>, pausaMs = PAUSA_MS): () => Promise<T> {
  let enCurso: Promise<T> | null = null
  let fallo: { error: unknown; hasta: number } | null = null
  return () => {
    if (fallo && Date.now() < fallo.hasta) return Promise.reject(fallo.error)
    enCurso ??= fn()
      .then((r) => {
        fallo = null
        return r
      })
      .catch((error: unknown) => {
        fallo = { error, hasta: Date.now() + pausaMs }
        throw error
      })
      .finally(() => {
        enCurso = null
      })
    return enCurso
  }
}
