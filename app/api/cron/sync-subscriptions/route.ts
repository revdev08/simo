import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// Configura la duración máxima según tu plan en Vercel
export const maxDuration = 60; // Hasta 60s en plan Hobby si está activado, en Pro puede ser hasta 300s

export async function GET(req: Request) {
  // 1. Verificación de seguridad para asegurar que el request viene de Vercel Cron
  // En tu panel de Vercel debes crear la variable de entorno CRON_SECRET
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    
    console.log('[CRON Sync] Starting subscription sync...');

    // 2. Buscar suscripciones que figuren como "active" pero que su current_period_end ya haya pasado
    // Limitamos la consulta para evitar agotar el tiempo de ejecución (Timeout) de Vercel
    const { data: expiredSubscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('id, user_id, mp_preapproval_id, current_period_end')
      .eq('status', 'active')
      .lt('current_period_end', new Date().toISOString())
      .limit(50);

    if (error) {
      console.error('[CRON Sync] Database error:', error);
      throw error;
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('[CRON Sync] No expired subscriptions to process.');
      return NextResponse.json({ message: 'No expired subscriptions to process' });
    }

    console.log(`[CRON Sync] Found ${expiredSubscriptions.length} subscriptions to check.`);

    const meliAccessToken = process.env.MELI_ACCESS_TOKEN;
    if (!meliAccessToken) {
      throw new Error('MELI_ACCESS_TOKEN is missing');
    }

    const client = new MercadoPagoConfig({ accessToken: meliAccessToken });
    const preApproval = new PreApproval(client);
    
    let processed = 0;

    // 3. Consultar a Mercado Libre SOLO por esas suscripciones vencidas en BD
    for (const sub of expiredSubscriptions) {
      if (!sub.mp_preapproval_id) {
        console.warn(`[CRON Sync] Subscription ${sub.id} missing mp_preapproval_id`);
        continue;
      }

      try {
        const mlSubscription = await preApproval.get({ id: sub.mp_preapproval_id });

        // Evaluamos el estado reportado por Mercado Libre
        if (mlSubscription.status === 'authorized') {
          // Si ML dice "authorized", significa que está al día y renovado
          const nextPaymentDate = mlSubscription.next_payment_date;
          
          if (nextPaymentDate) {
             await supabaseAdmin
              .from('subscriptions')
              .update({ 
                current_period_end: nextPaymentDate,
                status: 'active' // Aseguramos que siga activa
              })
              .eq('id', sub.id);
             console.log(`[CRON Sync] ✅ Renewed subscription ${sub.id} to ${nextPaymentDate}`);
          }
        } 
        else if (mlSubscription.status === 'cancelled' || mlSubscription.status === 'paused') {
          // Si fue cancelada o está en mora, actualizamos el estado en base de datos
          const newStatus = mlSubscription.status === 'cancelled' ? 'canceled' : 'paused';
          
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: newStatus })
            .eq('id', sub.id);
          console.log(`[CRON Sync] ❌ Updated subscription ${sub.id} to ${newStatus}`);
        }
        
        processed++;
      } catch (err: any) {
        console.error(`[CRON Sync] Error checking Mercado Libre for preapproval ${sub.mp_preapproval_id}:`, err.message);
      }
    }

    console.log(`[CRON Sync] Finished processing ${processed} subscriptions.`);
    
    return NextResponse.json({ 
      success: true, 
      processedCount: processed 
    });

  } catch (error: any) {
    console.error('[CRON Sync] Fatal error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
