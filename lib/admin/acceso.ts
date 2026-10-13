import 'server-only'
import { currentUser } from '@clerk/nextjs/server'

// Correos con acceso al panel de administración: ADMIN_EMAILS, separados por comas.
// Son también el equipo que publica en TikTok (/admin/tiktok).
export function correosAdmin(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((correo) => correo.trim().toLowerCase())
    .filter(Boolean)
}

export function emailEsAdmin(email: string): boolean {
  return correosAdmin().includes(email.trim().toLowerCase())
}

// Sin la variable no entra nadie, y solo cuentan los correos verificados en Clerk.
export async function esAdmin(): Promise<boolean> {
  const permitidos = correosAdmin()
  if (!permitidos.length) return false
  const user = await currentUser()
  return !!user?.emailAddresses.some((e) => e.verification?.status === 'verified' && permitidos.includes(e.emailAddress.toLowerCase()))
}
