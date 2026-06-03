import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendWelcomeEmail } from '@/lib/resend'

/**
 * Test endpoint: send the welcome email to yourself.
 *
 * Usage:
 *   POST /api/emails/welcome-test
 *   Body: { "to": "tu@correo.com", "firstName": "Andrés" }
 *
 * Locked behind:
 *   - signed-in user
 *   - EMAIL_TEST_ALLOWLIST env var (comma-separated emails that can trigger this)
 */
export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const callerEmail = (sessionClaims?.email as string | undefined)?.toLowerCase()
  const allowlist = (process.env.EMAIL_TEST_ALLOWLIST ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (allowlist.length > 0 && (!callerEmail || !allowlist.includes(callerEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { to, firstName } = await req.json().catch(() => ({}))

  if (!to || typeof to !== 'string') {
    return NextResponse.json({ error: 'Missing "to" in body' }, { status: 400 })
  }

  const result = await sendWelcomeEmail({ to, firstName })

  if ('error' in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ...result })
}
