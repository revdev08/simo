// lib/premium.ts
import { createAdminClient } from './supabase'

export async function isPremium(userId: string): Promise<boolean> {
  // Simularemos que el usuario es premium si tiene un registro en la tabla subscriptions
  try {
    const supabase = createAdminClient()
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !subscription) {
      return false
    }

    // Validar el status
    const isActiveStatus = subscription.status === 'active' || subscription.status === 'trialing'
    
    // Validar la fecha de fin si existe (dar tolerancia de 1 día por si acaso)
    let isDateValid = true
    if (subscription.current_period_end) {
      const endDate = new Date(subscription.current_period_end)
      const now = new Date()
      // Verificamos que la fecha actual sea menor a la de finalización
      isDateValid = now < endDate
    }

    return isActiveStatus && isDateValid
  } catch (err) {
    console.error('Error checking premium status', err)
    return false
  }
}
