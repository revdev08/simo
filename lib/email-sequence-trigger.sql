-- ============================================================
-- Auto-pause email sequence cuando un usuario se suscribe
--
-- Sin necesidad de tocar el webhook de MercadoPago.
-- Postgres mismo detecta cuando subscriptions cambia y
-- pausa la secuencia de correos del usuario correspondiente.
--
-- Cuándo correr: UNA SOLA VEZ después de crear email_sequence
-- (lib/email-sequence.sql) y la tabla subscriptions ya exista.
-- ============================================================

-- 1. Función que pausa la secuencia para un user_id dado.
--
-- SECURITY DEFINER: la función corre con los permisos de su creador
-- (postgres superuser), no del usuario que la dispara. Así el trigger
-- puede modificar email_sequence aunque RLS esté habilitado.
CREATE OR REPLACE FUNCTION pause_email_sequence_on_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo nos importa cuando status cambia A 'active'
  IF NEW.status = 'active' THEN
    UPDATE email_sequence
    SET
      converted_at = COALESCE(converted_at, NOW()),
      status       = 'paused'
    WHERE user_id = NEW.user_id
      AND converted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Trigger sobre subscriptions: dispara AFTER INSERT (nueva sub) y
--    AFTER UPDATE OF status (renovación, reactivación, etc).
DROP TRIGGER IF EXISTS trg_pause_email_on_sub_insert  ON subscriptions;
DROP TRIGGER IF EXISTS trg_pause_email_on_sub_update  ON subscriptions;

CREATE TRIGGER trg_pause_email_on_sub_insert
  AFTER INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION pause_email_sequence_on_subscription();

CREATE TRIGGER trg_pause_email_on_sub_update
  AFTER UPDATE OF status ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION pause_email_sequence_on_subscription();

-- 3. Sincronización retroactiva: pausa a quienes YA estaban suscritos
--    antes de que el trigger existiera.
UPDATE email_sequence es
SET
  converted_at = COALESCE(es.converted_at, NOW()),
  status       = 'paused'
FROM subscriptions s
WHERE es.user_id = s.user_id
  AND s.status = 'active'
  AND es.converted_at IS NULL;

-- 4. Verificación: cuántos quedan en cada estado
SELECT
  status,
  COUNT(*) AS total
FROM email_sequence
GROUP BY status
ORDER BY status;
