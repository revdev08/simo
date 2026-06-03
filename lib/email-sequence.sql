-- ============================================================
-- Email sequence tracking
-- Run this once in Supabase → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS email_sequence (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT UNIQUE NOT NULL,           -- Clerk user ID
  email           TEXT NOT NULL,
  first_name      TEXT,
  signup_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subscribed      BOOLEAN NOT NULL DEFAULT TRUE,  -- false = clicked unsubscribe
  converted_at    TIMESTAMPTZ,                    -- when they paid; pauses sequence
  last_step_sent  INT NOT NULL DEFAULT 0,         -- 0 = nothing sent yet
  last_sent_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'active', -- active | completed | paused | unsubscribed
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_sequence_status_step
  ON email_sequence(status, last_step_sent);

CREATE INDEX IF NOT EXISTS idx_email_sequence_signup
  ON email_sequence(signup_at);

CREATE INDEX IF NOT EXISTS idx_email_sequence_email
  ON email_sequence(email);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION touch_email_sequence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_sequence_updated_at ON email_sequence;
CREATE TRIGGER trg_email_sequence_updated_at
  BEFORE UPDATE ON email_sequence
  FOR EACH ROW EXECUTE FUNCTION touch_email_sequence_updated_at();
