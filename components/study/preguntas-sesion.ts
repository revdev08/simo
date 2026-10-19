// Cuántas preguntas trae cada sesión de práctica por módulo (0 = todas). Se guarda en el navegador: lo elige el
// aspirante en «Estudiar por módulo» y lo aplica la app al abrir la práctica.
import { useSyncExternalStore } from 'react'

export const OPCIONES_POR_SESION = [0, 10, 20, 40] as const
const CLAVE = 'simo_preguntas_sesion'
const EVENTO = 'simo-preguntas-sesion'

export function leerPreguntasPorSesion(): number {
  try {
    const n = Number(localStorage.getItem(CLAVE))
    return (OPCIONES_POR_SESION as readonly number[]).includes(n) ? n : 0
  } catch {
    return 0
  }
}

export function guardarPreguntasPorSesion(n: number) {
  try {
    if (n) localStorage.setItem(CLAVE, String(n))
    else localStorage.removeItem(CLAVE)
  } catch {}
  window.dispatchEvent(new Event(EVENTO))
}

const suscribir = (cb: () => void) => {
  window.addEventListener('storage', cb)
  window.addEventListener(EVENTO, cb)
  return () => {
    window.removeEventListener('storage', cb)
    window.removeEventListener(EVENTO, cb)
  }
}

// Se lee sin desajustar el render del servidor (allí siempre son «todas»)
export const usePreguntasPorSesion = () => useSyncExternalStore(suscribir, leerPreguntasPorSesion, () => 0)
