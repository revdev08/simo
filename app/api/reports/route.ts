import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'
import { findActiveQuestion } from '@/lib/questions'
import { REPORT_REASONS } from '@/lib/question-types'

const REASON_IDS = REPORT_REASONS.map((r) => r.id) as string[]
const MAX_COMMENT = 1000
const MAX_REPORTS_PER_DAY = 20

// Guarda un reporte de error sobre una pregunta para revisarlo después.
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })
    if (!(await isPremium(userId))) return new NextResponse('Forbidden', { status: 403 })

    const body = await req.json().catch(() => null)
    const question = findActiveQuestion(body?.questionId)
    const motivo = REASON_IDS.includes(body?.motivo) ? body.motivo : null
    const comentario = typeof body?.comentario === 'string' ? body.comentario.trim().slice(0, MAX_COMMENT) : ''

    if (!question || !motivo) return new NextResponse('Bad Request', { status: 400 })
    if (motivo === 'otro' && !comentario) {
      return NextResponse.json({ error: 'Cuéntanos cuál es el error' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Límite simple contra abuso: máximo 20 reportes por usuario en 24 horas
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('question_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since)
    if ((count ?? 0) >= MAX_REPORTS_PER_DAY) {
      return NextResponse.json({ error: 'Llegaste al límite de reportes de hoy' }, { status: 429 })
    }

    const { error } = await admin.from('question_reports').insert({
      user_id: userId,
      question_id: String(question.id),
      question_version: question.version ?? 1,
      motivo,
      comentario: comentario || null,
    })

    if (error) {
      console.error('Error saving report:', error.message)
      return NextResponse.json({ error: 'No se pudo enviar el reporte' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reports POST error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
