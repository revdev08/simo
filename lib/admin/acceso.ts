import 'server-only'
import { currentUser } from '@clerk/nextjs/server'

// Correos con acceso al panel de administración: ADMIN_EMAILS, separados por comas.
// Sin la variable no entra nadie, y solo cuentan los correos verificados en Clerk.
export async function esAdmin(): Promise<boolean> {
  const permitidos = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean)
  if (!permitidos.length) return false
  const user = await currentUser()
  return !!user?.emailAddresses.some((e) => e.verification?.status === 'verified' && permitidos.includes(e.emailAddress.toLowerCase()))
}
