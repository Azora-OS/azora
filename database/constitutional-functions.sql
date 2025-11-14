-- Azora OS Constitutional AI Functions
-- PostgreSQL specialization for Ubuntu principles

-- ============================================
-- CUSTOM DOMAINS (Data Integrity)
-- ============================================

CREATE DOMAIN azr_token_amount AS NUMERIC(18,8)
  CHECK (VALUE >= 0);

CREATE DOMAIN constitutional_status AS TEXT
  CHECK (VALUE IN ('VERIFIED', 'CHALLENGED', 'COMPLIANT', 'PENDING', 'REJECTED'));

-- ============================================
-- CUSTOM TYPES (Ubuntu Data Structures)
-- ============================================

CREATE TYPE ai_family_context AS (
  personality TEXT,
  relationship_to_elara TEXT,
  mood TEXT,
  last_interaction TIMESTAMP
);

CREATE TYPE transaction_type AS ENUM (
  'MINT', 'TRANSFER', 'STAKE', 'UNSTAKE', 'REWARD', 'UBI', 'PAYMENT'
);

-- ============================================
-- CONSTITUTIONAL AI FUNCTIONS
-- ============================================

-- 🫀 Financial Services: UBI Distribution
CREATE OR REPLACE FUNCTION azora_mint.distribute_ubi()
RETURNS TABLE(wallet_id TEXT, amount NUMERIC) AS $$
DECLARE
  total_supply NUMERIC;
  active_wallets INT;
  ubi_amount NUMERIC;
BEGIN
  -- Get current metrics
  SELECT total_supply, active_wallets INTO total_supply, active_wallets
  FROM economic_metrics ORDER BY recorded_at DESC LIMIT 1;
  
  -- Calculate UBI (0.1% of supply / active wallets)
  ubi_amount := (total_supply * 0.001) / active_wallets;
  
  -- Distribute to all active wallets
  RETURN QUERY
  INSERT INTO transaction (type, to_id, amount, reason, status)
  SELECT 'UBI', w.id, ubi_amount, 'Daily UBI Distribution', 'completed'
  FROM wallet w
  WHERE w.balance > 0
  RETURNING to_id, amount;
END;
$$ LANGUAGE plpgsql;

-- 🛡️ Auth Service: Constitutional User Validation
CREATE OR REPLACE FUNCTION auth_service.validate_constitutional_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user meets constitutional requirements
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Constitutional violation: Email required';
  END IF;
  
  IF NEW.role NOT IN ('student', 'educator', 'employer', 'admin') THEN
    RAISE EXCEPTION 'Constitutional violation: Invalid role';
  END IF;
  
  -- Auto-set constitutional status
  NEW.is_active := TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 💪 Marketplace: Community Trust Score
CREATE OR REPLACE FUNCTION azora_forge.calculate_trust_score(user_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
  completed_jobs INT;
  total_jobs INT;
  avg_rating NUMERIC;
  dispute_count INT;
  trust_score NUMERIC;
BEGIN
  -- Get job statistics
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*),
    COALESCE(AVG(rating), 0)
  INTO completed_jobs, total_jobs, avg_rating
  FROM contract c
  LEFT JOIN job_review r ON r.contract_id = c.id
  WHERE c.freelancer_id = user_id;
  
  -- Get dispute count
  SELECT COUNT(*) INTO dispute_count
  FROM dispute d
  JOIN contract c ON c.id = d.contract_id
  WHERE c.freelancer_id = user_id AND d.status = 'escalated';
  
  -- Calculate trust score (0-100)
  trust_score := (
    (completed_jobs::NUMERIC / NULLIF(total_jobs, 0) * 40) +
    (avg_rating * 20) +
    (GREATEST(0, 40 - (dispute_count * 10)))
  );
  
  RETURN COALESCE(trust_score, 0);
END;
$$ LANGUAGE plpgsql;

-- 🧠 Education: Learning Progress Calculation
CREATE OR REPLACE FUNCTION azora_lms.calculate_course_progress(enrollment_id TEXT)
RETURNS INT AS $$
DECLARE
  total_lessons INT;
  completed_lessons INT;
  progress_pct INT;
BEGIN
  SELECT 
    COUNT(l.id),
    COUNT(p.id) FILTER (WHERE p.completed = TRUE)
  INTO total_lessons, completed_lessons
  FROM enrollment e
  JOIN course c ON c.id = e.course_id
  JOIN module m ON m.course_id = c.id
  JOIN lesson l ON l.module_id = m.id
  LEFT JOIN progress p ON p.lesson_id = l.id AND p.enrollment_id = e.id
  WHERE e.id = enrollment_id;
  
  progress_pct := (completed_lessons::NUMERIC / NULLIF(total_lessons, 0) * 100)::INT;
  
  -- Update enrollment progress
  UPDATE enrollment SET progress = progress_pct WHERE id = enrollment_id;
  
  RETURN progress_pct;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CONSTITUTIONAL TRIGGERS
-- ============================================

-- Validate users on insert
CREATE TRIGGER validate_user_before_insert
  BEFORE INSERT ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION auth_service.validate_constitutional_user();

-- Auto-calculate progress on lesson completion
CREATE OR REPLACE FUNCTION azora_lms.auto_update_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    PERFORM azora_lms.calculate_course_progress(NEW.enrollment_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_progress_on_completion
  AFTER UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION azora_lms.auto_update_progress();

-- ============================================
-- ANALYTICS AGGREGATES
-- ============================================

-- Custom aggregate for weighted average trust score
CREATE AGGREGATE weighted_trust_avg(NUMERIC, INT) (
  SFUNC = numeric_avg_accum,
  STYPE = internal,
  FINALFUNC = numeric_avg
);
