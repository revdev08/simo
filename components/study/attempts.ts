// Registro de respuestas y progreso desde el navegador (estudio y simulacro).
import type { Question } from '@/lib/question-types'

export type StudyMode = 'modulo' | 'simulacro'

// Guarda una respuesta para medir la dificultad real de las preguntas.
// No bloquea al usuario: si falla, la práctica sigue igual.
export function sendAttempt(questionId: Question['id'], selected: string, timeMs: number, mode: StudyMode) {
  fetch('/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, selected, timeMs: Math.max(0, Math.round(timeMs)), mode }),
    keepalive: true,
  }).catch(() => {})
}

// Sincroniza con la base de datos el resultado de una sesión
export function saveProgress(progress: Record<string, 'correct' | 'incorrect'>) {
  if (!Object.keys(progress).length) return
  fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress }),
  }).catch((err) => console.error('Error saving progress to DB:', err))
}

// Reloj fuera de los componentes (las reglas de React no permiten leerlo durante el render)
export const clock = () => Date.now()
