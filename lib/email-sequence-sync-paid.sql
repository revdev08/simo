-- ============================================================
-- Sincronizar usuarios con suscripción activa en email_sequence.
--
-- Marca como "ya pagaron" (converted_at=NOW, status=paused) a todos
-- los usuarios que estén en email_sequence Y que tengan una suscripción
-- activa en la tabla subscriptions.
--
-- Cuándo correr este script:
--   - Antes de activar el cron, como medida de seguridad
--   - De vez en cuando, si la integración del webhook MP no está hecha
--   - Después de hacer cambios manuales en subscriptions
--
-- Es idempotente: correrlo varias veces no causa daño.
-- ============================================================

UPDATE email_sequence es
SET
  converted_at = COALESCE(es.converted_at, NOW()),
  status       = 'paused'
FROM subscriptions s
WHERE es.user_id = s.user_id
  AND s.status = 'active'
  AND es.converted_at IS NULL;

-- Ver cuántas filas se actualizaron y un resumen general:
SELECT
  status,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE converted_at IS NOT NULL) AS ya_pagaron
FROM email_sequence
GROUP BY status
ORDER BY status;
