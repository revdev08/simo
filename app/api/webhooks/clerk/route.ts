import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: Request) {
  // Configuro la clave secreta en el archivo .env
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Obtenemos las cabeceras
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Validamos si faltan cabeceras
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Extraemos el cuerpo del request
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Creamos una nueva instancia de Svix webhook
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verificamos la carga útil (payload)
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

  console.log(`[Webhook] Event Received: ${eventType}`);

  // Manejamos el evento user.created
  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data
    const email = email_addresses?.length > 0 ? email_addresses[0].email_address : ''
    
    console.log(`[Webhook] Processing user.created for ID: ${id}, Email: ${email}`);

    try {
      const supabase = createAdminClient()

      console.log(`[Webhook] Attempting to insert into Supabase...`);
      const { data, error } = await supabase.from('profiles').insert({
        id: id,
        email: email,
      })

      if (error) {
        console.error('[Webhook] Error insertando en Supabase:', error)
        return new Response('Error procesando webhook de Supabase', { status: 500 })
      }
      
      console.log(`[Webhook] Success inserting profile!`);
    } catch (e) {
      console.error('[Webhook] Exception Supabase insert:', e);
      return new Response('Error interno del webhook', { status: 500 });
    }
  }

  return new Response('', { status: 200 })
}
