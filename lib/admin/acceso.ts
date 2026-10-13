import 'server-only'
import { currentUser } from '@clerk/nextjs/server'

function correosAdmin() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((correo) => correo.trim().toLowerCase())
    .filter(Boolean)
}

export function emailEsAdmin(email: string): boolean {
  return correosAdmin().includes(email.trim().toLowerCase())
}

// Correos con acceso al panel de administración: ADMIN_EMAILS, separados por comas.
// Sin la variable no entra nadie, y solo cuentan los correos verificados en Clerk.
export async function esAdmin(): Promise<boolean> {
  const permitidos = correosAdmin()
  if (!permitidos.length) return false
  const user = await currentUser()
  return !!user?.emailAddresses.some((e) => e.verification?.status === 'verified' && permitidos.includes(e.emailAddress.toLowerCase()))
}
