'use client'

import { useEffect } from 'react'
import { fbTrackOnce, PLAN_PRICES } from '@/lib/metaPixel'

interface PurchaseTrackerProps {
  preapprovalId: string
  planId?: string | null
}

export default function PurchaseTracker({ preapprovalId, planId }: PurchaseTrackerProps) {
  useEffect(() => {
    const params = {
      value: planId ? PLAN_PRICES[planId] ?? 0 : 0,
      currency: 'COP',
      content_ids: planId ? [planId] : undefined,
    }
    fbTrackOnce(preapprovalId, 'Purchase', params)
    // Meta recomienda el evento estándar `Subscribe` para negocios de suscripción,
    // además de `Purchase`, para optimizar campañas específicamente hacia suscriptores.
    fbTrackOnce(preapprovalId, 'Subscribe', params)
  }, [preapprovalId, planId])

  return null
}
