import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'
import { findActiveQuestion } from '@/lib/questions'

const MODES = ['modulo', 'simulacro']
const MAX_TIME_MS = 60 * 60 * 1000

// Registra cada respuesta. La corrección se calcula aquí, nunca se confía en el cliente.
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })
    if (!(await isPremium(userId))) return new NextResponse('Forbidden', { status: 403 })

    const body = await req.json().catch(() => null)
    const question = findActiveQuestion(body?.questionId)
    const selected = typeof body?.selected === 'string' ? body.selected : ''
    const mode = MODES.includes(body?.mode) ? body.mode : null

    if (!question || !mode || !question.opciones.some((o) => o.id === selected)) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    const timeMs = Number.isInteger(body?.timeMs) && body.timeMs >= 0 && body.timeMs <= MAX_TIME_MS ? body.timeMs : null

    const { error } = await createAdminClient().from('question_attempts').insert({
      user_id: userId,
      question_id: String(question.id),
      question_version: question.version ?? 1,
      selected_option: selected,
      is_correct: selected === question.respuestaCorrecta,
      time_ms: timeMs,
      mode,
    })

    if (error) {
      console.error('Error saving attempt:', error.message)
      return NextResponse.json({ error: 'No se pudo guardar el intento' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Attempts POST error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
