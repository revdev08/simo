// Motivos para cancelar la suscripción: los usa el formulario de «Mi progreso» y los valida el servidor.
export const MOTIVOS_CANCELACION = [
  { id: 'ya_presente', texto: 'Ya presenté mi prueba' },
  { id: 'precio', texto: 'Es muy costoso para mí' },
  { id: 'sin_tiempo', texto: 'No tengo tiempo de estudiar ahora' },
  { id: 'no_encuentro_concurso', texto: 'No encuentro mi concurso o mi cargo' },
  { id: 'contenido', texto: 'Las preguntas no me sirvieron' },
  { id: 'otro', texto: 'Otro motivo' },
] as const

export type MotivoCancelacion = (typeof MOTIVOS_CANCELACION)[number]['id']

export const esMotivoCancelacion = (v: unknown): v is MotivoCancelacion => MOTIVOS_CANCELACION.some((m) => m.id === v)

export const MAX_COMENTARIO_CANCELACION = 500
