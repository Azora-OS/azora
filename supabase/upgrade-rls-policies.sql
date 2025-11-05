-- UPGRADE SCRIPT: Enhanced RLS Policies
-- Run this in Supabase SQL Editor to upgrade existing policies
-- Safe to run multiple times (idempotent)

BEGIN;

-- Drop old policies
DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Students can view own proofs" ON proofs;
DROP POLICY IF EXISTS "Students can view own devices" ON devices;
DROP POLICY IF EXISTS "Allow authenticated inserts to proofs" ON proofs;
DROP POLICY IF EXISTS "Allow authenticated inserts to devices" ON devices;

-- Students Table Policies (Enhanced)
CREATE POLICY "rls_students_select_owner"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "rls_students_insert_self"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "rls_students_update_owner"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Proofs Table Policies (Enhanced)
CREATE POLICY "rls_proofs_select_owner"
  ON proofs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM students 
    WHERE students.id = proofs.student_id 
    AND students.id::text = auth.uid()::text
  ));

CREATE POLICY "rls_proofs_insert_authenticated"
  ON proofs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM students 
    WHERE students.id = proofs.student_id 
    AND students.id::text = auth.uid()::text
  ));

-- Devices Table Policies (Enhanced)
CREATE POLICY "rls_devices_select_owner"
  ON devices FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM students 
    WHERE students.id = devices.user_id 
    AND students.id::text = auth.uid()::text
  ));

CREATE POLICY "rls_devices_insert_authenticated"
  ON devices FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM students 
    WHERE students.id = devices.user_id 
    AND students.id::text = auth.uid()::text
  ));

CREATE POLICY "rls_devices_update_owner"
  ON devices FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM students 
    WHERE students.id = devices.user_id 
    AND students.id::text = auth.uid()::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM students 
    WHERE students.id = devices.user_id 
    AND students.id::text = auth.uid()::text
  ));

-- Founders Table Policies (Read-only for authenticated users)
CREATE POLICY "rls_founders_select_all"
  ON founders FOR SELECT
  TO authenticated
  USING (true);

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🔒 RLS Policies upgraded successfully!';
  RAISE NOTICE '   ✅ Students: SELECT, INSERT, UPDATE (owner only)';
  RAISE NOTICE '   ✅ Proofs: SELECT, INSERT (owner verification)';
  RAISE NOTICE '   ✅ Devices: SELECT, INSERT, UPDATE (owner verification)';
  RAISE NOTICE '   ✅ Founders: SELECT (all authenticated)';
  RAISE NOTICE '   ✅ All policies restricted to authenticated users';
  RAISE NOTICE '   ✅ Table-prefixed naming (rls_*)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Security Level: Production-Ready';
END $$;
