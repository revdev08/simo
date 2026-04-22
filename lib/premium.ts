// lib/premium.ts
import { createAdminClient } from './supabase'

export async function isPremium(userId: string): Promise<boolean> {
  // Simularemos que el usuario es premium si tiene un registro en la tabla subscriptions
  try {
    const supabase = createAdminClient()
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId) // Asegúrate que tu FK sea correcta, puede ser 'user_id' o 'id'
      .single()

    if (error || !subscription) {
      return false
    }

    return subscription.status === 'active' || subscription.status === 'trialing'
  } catch (err) {
    console.error('Error checking premium status', err)
    return false
  }
}
