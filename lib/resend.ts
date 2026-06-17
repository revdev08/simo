import { Resend } from 'resend'
import WelcomeEmail from '@/emails/WelcomeEmail'
import TopicsEmail from '@/emails/TopicsEmail'
import SocialProofEmail from '@/emails/SocialProofEmail'
import PriceObjectionEmail from '@/emails/PriceObjectionEmail'
import ProductDemoEmail from '@/emails/ProductDemoEmail'
import DiscountEmail from '@/emails/DiscountEmail'

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  console.warn('[Resend] RESEND_API_KEY is not set. Emails will not be sent.')
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'Andrés de SIMO TEST <hola@simotest.com>'

interface SendParams {
  to: string
  firstName?: string
}

type EmailConfig = {
  subject: string
  label: string
  build: (params: SendParams) => React.ReactElement
}

const EMAILS: Record<number, EmailConfig> = {
  1: {
    subject: 'Lo que el 80% de aspirantes no sabe del examen SIMO',
    label: '1-welcome',
    build: ({ to, firstName }) => WelcomeEmail({ firstName, recipientEmail: to }),
  },
  2: {
    subject: '¿Sabes qué temas caen sí o sí en CNSC?',
    label: '2-topics',
    build: ({ to, firstName }) => TopicsEmail({ firstName, recipientEmail: to }),
  },
  3: {
    subject: 'Cómo Carlos pasó SIMO a la primera (sin estudiar 10 horas)',
    label: '3-social-proof',
    build: ({ to, firstName }) => SocialProofEmail({ firstName, recipientEmail: to }),
  },
  4: {
    subject: '$19900 vs. 2 años perdidos',
    label: '4-price-objection',
    build: ({ to, firstName }) => PriceObjectionEmail({ firstName, recipientEmail: to }),
  },
  5: {
    subject: 'Mira cómo la IA te explica una pregunta de SIMO',
    label: '5-product-demo',
    build: ({ to, firstName }) => ProductDemoEmail({ firstName, recipientEmail: to }),
  },
  6: {
    subject: '¿Estás estudiando para pasar, o solo para ver qué pasa?',
    label: '6-final-push',
    build: ({ to, firstName }) => DiscountEmail({ firstName, recipientEmail: to }),
  },
}

export type SendStepResult =
  | { data: { id?: string }; error?: undefined; skipped?: boolean }
  | { error: unknown; skipped?: boolean }

async function sendStep(step: number, { to, firstName }: SendParams): Promise<SendStepResult> {
  if (!resend) {
    console.warn('[Resend] Skipping email — client not configured.')
    // Devolvemos error para que los callers NO marquen al usuario como "ya enviado".
    // Cuando se configure RESEND_API_KEY, el cron los recogerá normalmente.
    return { error: new Error('RESEND_API_KEY not configured'), skipped: true }
  }

  const config = EMAILS[step]
  if (!config) {
    return { error: new Error(`No email configured for step ${step}`) }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: config.subject,
      react: config.build({ to, firstName }),
      headers: {
        'List-Unsubscribe': `<https://www.simotest.com/unsubscribe?email=${encodeURIComponent(to)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [
        { name: 'sequence', value: 'onboarding' },
        { name: 'step', value: config.label },
      ],
    })

    if (error) {
      console.error(`[Resend] sendStep ${step} error:`, error)
      return { error }
    }

    console.log(`[Resend] Step ${step} (${config.label}) queued:`, data?.id)
    return { data: data ?? {} }
  } catch (e) {
    console.error(`[Resend] sendStep ${step} exception:`, e)
    return { error: e }
  }
}

export const sendWelcomeEmail = (p: SendParams) => sendStep(1, p)
export const sendTopicsEmail = (p: SendParams) => sendStep(2, p)
export const sendSocialProofEmail = (p: SendParams) => sendStep(3, p)
export const sendPriceObjectionEmail = (p: SendParams) => sendStep(4, p)
export const sendProductDemoEmail = (p: SendParams) => sendStep(5, p)
export const sendDiscountEmail = (p: SendParams) => sendStep(6, p)

export { sendStep }
