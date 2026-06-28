
-- ============================================================
-- IKUSASA PRODUCTION BACKEND — CORE SCHEMA
-- ============================================================

CREATE TYPE public.opportunity_type AS ENUM ('freelance','internship','part-time','entry-level','short-project');
CREATE TYPE public.compensation_type AS ENUM ('fixed','hourly','stipend','unpaid');
CREATE TYPE public.opportunity_status AS ENUM ('draft','open','closed','filled','cancelled');
CREATE TYPE public.application_status AS ENUM ('submitted','shortlisted','interview','accepted','rejected','withdrawn');
CREATE TYPE public.task_status AS ENUM ('pending','in_progress','submitted','revision_requested','completed','cancelled','disputed');
CREATE TYPE public.deliverable_status AS ENUM ('submitted','approved','rejected','revision_requested');
CREATE TYPE public.wallet_txn_type AS ENUM ('earning','withdrawal','payout','fee','charge','escrow_hold','escrow_release','refund');
CREATE TYPE public.wallet_txn_status AS ENUM ('pending','completed','failed','cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending','held_in_escrow','released','refunded','failed');
CREATE TYPE public.notification_kind AS ENUM (
  'application_update','new_applicant','review_received','opportunity_match',
  'message_received','task_update','deliverable_update','payment_update',
  'verification_update','dispute_update','system'
);
CREATE TYPE public.verification_status AS ENUM ('unsubmitted','pending','approved','rejected');
CREATE TYPE public.dispute_status AS ENUM ('open','in_review','resolved','rejected');
CREATE TYPE public.report_status AS ENUM ('open','reviewing','actioned','dismissed');
CREATE TYPE public.report_reason AS ENUM ('spam','harassment','scam','inappropriate','offensive','impersonation','other');
CREATE TYPE public.placement_status AS ENUM ('active','completed','terminated');

-- 1) PROFILES extensions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'South Africa',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS website_url text;

-- 2) STUDENT / GRADUATE PROFILES
CREATE TABLE public.student_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  university text NOT NULL DEFAULT '',
  degree text NOT NULL DEFAULT '',
  graduation_year int,
  is_graduate boolean NOT NULL DEFAULT false,
  years_since_graduation int,
  current_role_title text,
  cv_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles TO service_role;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sp_select_authn" ON public.student_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "sp_insert_self" ON public.student_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sp_update_self" ON public.student_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sp_admin_all" ON public.student_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_sp_updated BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) BUSINESS PROFILES
CREATE TABLE public.business_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  website text,
  description text NOT NULL DEFAULT '',
  registration_number text,
  logo_url text,
  verification_status public.verification_status NOT NULL DEFAULT 'unsubmitted',
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_profiles TO authenticated;
GRANT ALL ON public.business_profiles TO service_role;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bp_select_authn" ON public.business_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "bp_insert_self" ON public.business_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bp_update_self" ON public.business_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bp_admin_all" ON public.business_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bp_updated BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.lock_business_verification_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(),'admin') THEN RETURN NEW; END IF;
  NEW.verification_status := OLD.verification_status;
  NEW.verified_at := OLD.verified_at;
  NEW.verified_by := OLD.verified_by;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_bp_lock_ver BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.lock_business_verification_fields();

-- 4) SKILLS
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills_read" ON public.skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "skills_admin_write" ON public.skills FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.user_skills (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency smallint NOT NULL DEFAULT 3 CHECK (proficiency BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills TO authenticated;
GRANT ALL ON public.user_skills TO service_role;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "us_read" ON public.user_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "us_manage_self" ON public.user_skills FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_skills_skill ON public.user_skills(skill_id);

-- 5) OPPORTUNITIES
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 5 AND 160),
  description text NOT NULL CHECK (length(description) >= 30),
  type public.opportunity_type NOT NULL,
  requirements text[] NOT NULL DEFAULT '{}',
  location text NOT NULL DEFAULT '',
  remote boolean NOT NULL DEFAULT false,
  compensation_type public.compensation_type NOT NULL,
  compensation_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (compensation_amount >= 0),
  duration_weeks int CHECK (duration_weeks IS NULL OR duration_weeks > 0),
  status public.opportunity_status NOT NULL DEFAULT 'draft',
  deadline timestamptz,
  applicant_count int NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  featured_until timestamptz,
  posted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_min_paid_amount CHECK (compensation_type = 'unpaid' OR compensation_amount >= 250)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT SELECT ON public.opportunities TO anon;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opps_public_open" ON public.opportunities FOR SELECT TO anon, authenticated
  USING (status IN ('open','filled','closed'));
CREATE POLICY "opps_owner_select" ON public.opportunities FOR SELECT TO authenticated USING (auth.uid() = business_id);
CREATE POLICY "opps_admin_select" ON public.opportunities FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "opps_owner_insert" ON public.opportunities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = business_id AND public.has_role(auth.uid(),'business'));
CREATE POLICY "opps_owner_update" ON public.opportunities FOR UPDATE TO authenticated
  USING (auth.uid() = business_id) WITH CHECK (auth.uid() = business_id);
CREATE POLICY "opps_owner_delete" ON public.opportunities FOR DELETE TO authenticated
  USING (auth.uid() = business_id AND status = 'draft');
CREATE POLICY "opps_admin_all" ON public.opportunities FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_opps_status ON public.opportunities(status);
CREATE INDEX idx_opps_business ON public.opportunities(business_id);
CREATE INDEX idx_opps_type ON public.opportunities(type);
CREATE INDEX idx_opps_posted ON public.opportunities(posted_at DESC);
CREATE INDEX idx_opps_featured ON public.opportunities(featured, featured_until) WHERE featured = true;
CREATE TRIGGER trg_opps_updated BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.enforce_opportunity_publish()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_status public.verification_status;
BEGIN
  IF NEW.status <> 'draft' AND (TG_OP = 'INSERT' OR OLD.status = 'draft') THEN
    SELECT verification_status INTO v_status FROM public.business_profiles WHERE user_id = NEW.business_id;
    IF v_status IS DISTINCT FROM 'approved' AND NOT public.has_role(auth.uid(),'admin') THEN
      RAISE EXCEPTION 'Business must be verified before publishing opportunities';
    END IF;
    IF NEW.posted_at IS NULL THEN NEW.posted_at := now(); END IF;
  END IF;
  IF NEW.featured = true AND NEW.featured_until IS NOT NULL AND NEW.featured_until < now() THEN
    NEW.featured := false;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_opps_publish BEFORE INSERT OR UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.enforce_opportunity_publish();

CREATE TABLE public.opportunity_skills (
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  PRIMARY KEY (opportunity_id, skill_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_skills TO authenticated;
GRANT SELECT ON public.opportunity_skills TO anon;
GRANT ALL ON public.opportunity_skills TO service_role;
ALTER TABLE public.opportunity_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_read" ON public.opportunity_skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "os_owner_write" ON public.opportunity_skills FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.opportunities o WHERE o.id = opportunity_id AND o.business_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.opportunities o WHERE o.id = opportunity_id AND o.business_id = auth.uid()));
CREATE INDEX idx_os_skill ON public.opportunity_skills(skill_id);

-- 6) APPLICATIONS
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_message text NOT NULL CHECK (length(cover_message) >= 20),
  portfolio_link text,
  cv_path text,
  status public.application_status NOT NULL DEFAULT 'submitted',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, applicant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apps_self_select" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = applicant_id);
CREATE POLICY "apps_business_select" ON public.applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.opportunities o WHERE o.id = opportunity_id AND o.business_id = auth.uid()));
CREATE POLICY "apps_admin_select" ON public.applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "apps_insert_self" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = applicant_id AND (public.has_role(auth.uid(),'student') OR public.has_role(auth.uid(),'graduate')));
CREATE POLICY "apps_self_update" ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() = applicant_id) WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "apps_business_update" ON public.applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.opportunities o WHERE o.id = opportunity_id AND o.business_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.opportunities o WHERE o.id = opportunity_id AND o.business_id = auth.uid()));
CREATE POLICY "apps_admin_all" ON public.applications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_apps_applicant ON public.applications(applicant_id);
CREATE INDEX idx_apps_opportunity ON public.applications(opportunity_id);
CREATE INDEX idx_apps_status ON public.applications(status);
CREATE TRIGGER trg_apps_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.enforce_application_rules()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_status public.opportunity_status; v_open int;
BEGIN
  SELECT status INTO v_status FROM public.opportunities WHERE id = NEW.opportunity_id FOR UPDATE;
  IF v_status IS DISTINCT FROM 'open' THEN RAISE EXCEPTION 'Opportunity is not open for applications'; END IF;
  SELECT count(*) INTO v_open FROM public.applications
    WHERE applicant_id = NEW.applicant_id AND status IN ('submitted','shortlisted','interview');
  IF v_open >= 20 THEN RAISE EXCEPTION 'Active application limit (20) reached'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_apps_enforce BEFORE INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_application_rules();

CREATE OR REPLACE FUNCTION public.bump_opportunity_applicant_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.opportunities SET applicant_count = applicant_count + 1 WHERE id = NEW.opportunity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.opportunities SET applicant_count = greatest(applicant_count - 1, 0) WHERE id = OLD.opportunity_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_apps_count AFTER INSERT OR DELETE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.bump_opportunity_applicant_count();

-- 7) TASKS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  application_id uuid NOT NULL UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  status public.task_status NOT NULL DEFAULT 'pending',
  starts_at timestamptz,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_party_select" ON public.tasks FOR SELECT TO authenticated
  USING (auth.uid() IN (business_id, worker_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "tasks_business_update" ON public.tasks FOR UPDATE TO authenticated
  USING (auth.uid() = business_id) WITH CHECK (auth.uid() = business_id);
CREATE POLICY "tasks_worker_update" ON public.tasks FOR UPDATE TO authenticated
  USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "tasks_admin_all" ON public.tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_tasks_business ON public.tasks(business_id);
CREATE INDEX idx_tasks_worker ON public.tasks(worker_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8) DELIVERABLES
CREATE TABLE public.deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  file_path text,
  external_url text,
  status public.deliverable_status NOT NULL DEFAULT 'submitted',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliverables TO authenticated;
GRANT ALL ON public.deliverables TO service_role;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "del_party_select" ON public.deliverables FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND auth.uid() IN (t.business_id, t.worker_id))
  OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "del_worker_insert" ON public.deliverables FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = worker_id
  AND EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.worker_id = auth.uid()));
CREATE POLICY "del_business_update" ON public.deliverables FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.business_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.business_id = auth.uid()));
CREATE POLICY "del_admin_all" ON public.deliverables FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_del_task ON public.deliverables(task_id);
CREATE TRIGGER trg_del_updated BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9) WALLETS
CREATE TABLE public.wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  available_balance numeric(14,2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance numeric(14,2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  lifetime_earnings numeric(14,2) NOT NULL DEFAULT 0,
  lifetime_spent numeric(14,2) NOT NULL DEFAULT 0,
  last_payout_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallets_self_select" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wallets_admin_select" ON public.wallets FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_wallets_updated BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.wallet_txn_type NOT NULL,
  status public.wallet_txn_status NOT NULL DEFAULT 'pending',
  amount numeric(14,2) NOT NULL,
  description text,
  counterparty_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  payment_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wtx_self_select" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wtx_admin_select" ON public.wallet_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_wtx_user ON public.wallet_transactions(user_id, created_at DESC);
CREATE INDEX idx_wtx_task ON public.wallet_transactions(task_id);

CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- 10) PAYMENTS / ESCROW
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL UNIQUE REFERENCES public.tasks(id) ON DELETE CASCADE,
  payer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  payee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  gross_amount numeric(14,2) NOT NULL CHECK (gross_amount > 0),
  platform_fee numeric(14,2) NOT NULL CHECK (platform_fee >= 0),
  net_amount numeric(14,2) NOT NULL CHECK (net_amount >= 0),
  status public.payment_status NOT NULL DEFAULT 'pending',
  provider text,
  provider_ref text,
  held_at timestamptz,
  released_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_party_select" ON public.payments FOR SELECT TO authenticated
  USING (auth.uid() IN (payer_id, payee_id) OR public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_pay_payer ON public.payments(payer_id);
CREATE INDEX idx_pay_payee ON public.payments(payee_id);
CREATE INDEX idx_pay_status ON public.payments(status);
CREATE TRIGGER trg_pay_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.platform_fee_rate() RETURNS numeric
  LANGUAGE sql IMMUTABLE AS $$ SELECT 0.15::numeric $$;

CREATE OR REPLACE FUNCTION public.fund_task_escrow(p_task_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_task public.tasks; v_fee numeric; v_net numeric; v_id uuid;
BEGIN
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id FOR UPDATE;
  IF v_task.id IS NULL THEN RAISE EXCEPTION 'Task not found'; END IF;
  IF auth.uid() <> v_task.business_id AND NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Only the funding business can escrow a task'; END IF;
  IF EXISTS (SELECT 1 FROM public.payments WHERE task_id = p_task_id) THEN
    RAISE EXCEPTION 'Task already funded'; END IF;
  v_fee := round(v_task.amount * public.platform_fee_rate(), 2);
  v_net := v_task.amount - v_fee;
  INSERT INTO public.payments(task_id, payer_id, payee_id, gross_amount, platform_fee, net_amount, status, held_at)
  VALUES (v_task.id, v_task.business_id, v_task.worker_id, v_task.amount, v_fee, v_net, 'held_in_escrow', now())
  RETURNING id INTO v_id;
  INSERT INTO public.wallet_transactions(user_id, type, status, amount, description, counterparty_id, task_id, payment_id)
  VALUES (v_task.business_id, 'escrow_hold', 'completed', -v_task.amount,
          'Escrow hold for task', v_task.worker_id, v_task.id, v_id);
  UPDATE public.wallets SET pending_balance = pending_balance + v_net WHERE user_id = v_task.worker_id;
  UPDATE public.tasks SET status = 'in_progress' WHERE id = v_task.id;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.fund_task_escrow(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fund_task_escrow(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.release_task_payment(p_task_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_task public.tasks; v_p public.payments;
BEGIN
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id FOR UPDATE;
  IF v_task.id IS NULL THEN RAISE EXCEPTION 'Task not found'; END IF;
  IF auth.uid() <> v_task.business_id AND NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Only the business can release payment'; END IF;
  SELECT * INTO v_p FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF v_p.id IS NULL OR v_p.status <> 'held_in_escrow' THEN RAISE EXCEPTION 'Payment not in escrow'; END IF;
  UPDATE public.payments SET status='released', released_at=now() WHERE id = v_p.id;
  UPDATE public.wallets
     SET pending_balance = greatest(pending_balance - v_p.net_amount, 0),
         available_balance = available_balance + v_p.net_amount,
         lifetime_earnings = lifetime_earnings + v_p.net_amount
   WHERE user_id = v_p.payee_id;
  UPDATE public.wallets SET lifetime_spent = lifetime_spent + v_p.gross_amount WHERE user_id = v_p.payer_id;
  INSERT INTO public.wallet_transactions(user_id, type, status, amount, description, counterparty_id, task_id, payment_id)
  VALUES
    (v_p.payee_id, 'escrow_release', 'completed', v_p.net_amount, 'Payment released', v_p.payer_id, v_task.id, v_p.id),
    (v_p.payee_id, 'fee', 'completed', -v_p.platform_fee, 'Platform fee', v_p.payer_id, v_task.id, v_p.id);
  UPDATE public.tasks SET status='completed', completed_at = now() WHERE id = v_task.id;
END $$;
REVOKE ALL ON FUNCTION public.release_task_payment(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.release_task_payment(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.refund_task_payment(p_task_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_task public.tasks; v_p public.payments;
BEGIN
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id FOR UPDATE;
  IF v_task.id IS NULL THEN RAISE EXCEPTION 'Task not found'; END IF;
  IF NOT public.has_role(auth.uid(),'admin') AND auth.uid() <> v_task.business_id THEN
    RAISE EXCEPTION 'Not authorised to refund'; END IF;
  SELECT * INTO v_p FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF v_p.status <> 'held_in_escrow' THEN RAISE EXCEPTION 'Not refundable'; END IF;
  UPDATE public.payments SET status='refunded', refunded_at=now() WHERE id = v_p.id;
  UPDATE public.wallets SET pending_balance = greatest(pending_balance - v_p.net_amount, 0) WHERE user_id = v_p.payee_id;
  INSERT INTO public.wallet_transactions(user_id, type, status, amount, description, counterparty_id, task_id, payment_id)
  VALUES
    (v_p.payer_id, 'refund', 'completed', v_p.gross_amount, 'Escrow refund', v_p.payee_id, v_task.id, v_p.id);
  UPDATE public.tasks SET status='cancelled' WHERE id = v_task.id;
END $$;
REVOKE ALL ON FUNCTION public.refund_task_payment(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.refund_task_payment(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.request_withdrawal(p_amount numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_avail numeric; v_id uuid;
BEGIN
  IF p_amount IS NULL OR p_amount < 100 THEN RAISE EXCEPTION 'Minimum withdrawal is 100'; END IF;
  SELECT available_balance INTO v_avail FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_avail IS NULL OR v_avail < p_amount THEN RAISE EXCEPTION 'Insufficient available balance'; END IF;
  UPDATE public.wallets SET available_balance = available_balance - p_amount, last_payout_at = now() WHERE user_id = auth.uid();
  INSERT INTO public.wallet_transactions(user_id, type, status, amount, description)
    VALUES (auth.uid(), 'withdrawal', 'pending', -p_amount, 'Withdrawal request') RETURNING id INTO v_id;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.request_withdrawal(numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(numeric) TO authenticated;

-- 11) PLACEMENTS  (declared before acceptance trigger)
CREATE TABLE public.placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  application_id uuid NOT NULL UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compensation_amount numeric(12,2) NOT NULL,
  status public.placement_status NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.placements TO authenticated;
GRANT ALL ON public.placements TO service_role;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plc_party_select" ON public.placements FOR SELECT TO authenticated
  USING (auth.uid() IN (business_id, worker_id) OR public.has_role(auth.uid(),'admin'));

-- Acceptance trigger now safe
CREATE OR REPLACE FUNCTION public.on_application_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_opp public.opportunities;
BEGIN
  IF NEW.status = 'accepted' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'accepted') THEN
    SELECT * INTO v_opp FROM public.opportunities WHERE id = NEW.opportunity_id;
    INSERT INTO public.tasks(opportunity_id, application_id, business_id, worker_id, title, description, amount, status)
    VALUES (v_opp.id, NEW.id, v_opp.business_id, NEW.applicant_id, v_opp.title, v_opp.description, v_opp.compensation_amount, 'pending')
    ON CONFLICT (application_id) DO NOTHING;
    INSERT INTO public.placements(opportunity_id, application_id, business_id, worker_id, compensation_amount)
    VALUES (v_opp.id, NEW.id, v_opp.business_id, NEW.applicant_id, v_opp.compensation_amount)
    ON CONFLICT (application_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_apps_accepted AFTER INSERT OR UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.on_application_accepted();

-- 12) MESSAGING
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_participants TO authenticated;
GRANT ALL ON public.conversation_participants TO service_role;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_participants
                  WHERE conversation_id = _conversation_id AND user_id = _user_id);
$$;

CREATE POLICY "conv_select" ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_participant(id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "conv_insert" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "conv_update" ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "cp_select" ON public.conversation_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR public.is_conversation_participant(conversation_id, auth.uid())
         OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cp_insert" ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "cp_update_self" ON public.conversation_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "cp_delete_self" ON public.conversation_participants FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "msg_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id, auth.uid()));
CREATE INDEX idx_msg_conv ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_cp_user ON public.conversation_participants(user_id);

CREATE OR REPLACE FUNCTION public.touch_conversation_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message = NEW.body, last_message_at = NEW.created_at
   WHERE id = NEW.conversation_id;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_msg_touch AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation_on_message();

-- 13) NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.notification_kind NOT NULL,
  title text NOT NULL,
  body text,
  href text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_self_select" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_self_update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_admin_all" ON public.notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_notif_user_unread ON public.notifications(user_id, created_at DESC) WHERE read = false;

CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid, _kind public.notification_kind, _title text, _body text DEFAULT NULL, _href text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.notifications(user_id, kind, title, body, href)
  VALUES (_user_id, _kind, _title, _body, _href) RETURNING id INTO v_id;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.create_notification(uuid, public.notification_kind, text, text, text) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.notify_on_application_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_opp public.opportunities;
BEGIN
  SELECT * INTO v_opp FROM public.opportunities WHERE id = NEW.opportunity_id;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(v_opp.business_id, 'new_applicant',
      'New applicant', 'New applicant for ' || v_opp.title,
      '/business/opportunities/' || v_opp.id || '/applicants');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.create_notification(NEW.applicant_id, 'application_update',
      'Application ' || NEW.status::text,
      'Your application for ' || v_opp.title || ' is now ' || NEW.status::text,
      '/opportunities/' || v_opp.id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_apps_notify AFTER INSERT OR UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_application_change();

CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN SELECT user_id FROM public.conversation_participants
            WHERE conversation_id = NEW.conversation_id AND user_id <> NEW.sender_id LOOP
    PERFORM public.create_notification(r.user_id, 'message_received',
      'New message', left(NEW.body, 140), '/messages/' || NEW.conversation_id);
  END LOOP;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_msg_notify AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

-- 14) REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (comment IS NULL OR length(comment) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, author_id, subject_id)
);
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rev_public_select" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "rev_insert_party" ON public.reviews FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.tasks t
               WHERE t.id = task_id AND t.status = 'completed'
                 AND ((auth.uid() = t.business_id AND subject_id = t.worker_id)
                   OR (auth.uid() = t.worker_id AND subject_id = t.business_id))));
CREATE POLICY "rev_admin_all" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_rev_subject ON public.reviews(subject_id);

-- 15) PORTFOLIO
CREATE TABLE public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  image_path text,
  external_url text,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;
GRANT SELECT ON public.portfolio_items TO anon;
GRANT ALL ON public.portfolio_items TO service_role;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_public_select" ON public.portfolio_items FOR SELECT TO anon, authenticated
  USING (visible = true OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pf_owner_all" ON public.portfolio_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pf_updated BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.create_portfolio_from_task()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    INSERT INTO public.portfolio_items(user_id, task_id, title, description)
    VALUES (NEW.worker_id, NEW.id, NEW.title, NEW.description) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_task_to_portfolio AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.create_portfolio_from_task();

-- 16) BUSINESS VERIFICATION DOCS
CREATE TABLE public.business_verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_path text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.business_verification_documents TO authenticated;
GRANT ALL ON public.business_verification_documents TO service_role;
ALTER TABLE public.business_verification_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bvd_owner_select" ON public.business_verification_documents FOR SELECT TO authenticated
  USING (auth.uid() = business_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "bvd_owner_insert" ON public.business_verification_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = business_id);
CREATE POLICY "bvd_owner_delete" ON public.business_verification_documents FOR DELETE TO authenticated
  USING (auth.uid() = business_id AND
    (SELECT verification_status FROM public.business_profiles WHERE user_id = business_id) IN ('unsubmitted','rejected'));
CREATE POLICY "bvd_admin_all" ON public.business_verification_documents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.submit_business_verification()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'business') THEN RAISE EXCEPTION 'Only businesses can submit verification'; END IF;
  UPDATE public.business_profiles SET verification_status = 'pending'
   WHERE user_id = auth.uid() AND verification_status IN ('unsubmitted','rejected');
END $$;
GRANT EXECUTE ON FUNCTION public.submit_business_verification() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_business_verification(_business_id uuid, _approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin only'; END IF;
  UPDATE public.business_profiles
     SET verification_status = CASE WHEN _approve THEN 'approved'::public.verification_status ELSE 'rejected'::public.verification_status END,
         verified_at = CASE WHEN _approve THEN now() ELSE NULL END,
         verified_by = CASE WHEN _approve THEN auth.uid() ELSE NULL END
   WHERE user_id = _business_id;
  PERFORM public.create_notification(_business_id, 'verification_update',
    CASE WHEN _approve THEN 'Business verified' ELSE 'Verification rejected' END,
    NULL, '/business/dashboard');
END $$;
GRANT EXECUTE ON FUNCTION public.admin_set_business_verification(uuid, boolean) TO authenticated;

-- 17) FEATURED LISTINGS
CREATE TABLE public.featured_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.featured_listings TO authenticated;
GRANT ALL ON public.featured_listings TO service_role;
ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fl_owner_select" ON public.featured_listings FOR SELECT TO authenticated
  USING (auth.uid() = business_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "fl_owner_insert" ON public.featured_listings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = business_id);

CREATE OR REPLACE FUNCTION public.expire_featured_listings()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c int;
BEGIN
  UPDATE public.opportunities SET featured = false
   WHERE featured = true AND featured_until IS NOT NULL AND featured_until < now();
  GET DIAGNOSTICS c = ROW_COUNT;
  RETURN c;
END $$;
REVOKE ALL ON FUNCTION public.expire_featured_listings() FROM public, anon, authenticated;

-- 18) DISPUTES
CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
  raised_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  against_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  amount numeric(12,2),
  status public.dispute_status NOT NULL DEFAULT 'open',
  resolution_notes text,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dis_party_select" ON public.disputes FOR SELECT TO authenticated
  USING (auth.uid() IN (raised_by, against_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "dis_insert_self" ON public.disputes FOR INSERT TO authenticated WITH CHECK (auth.uid() = raised_by);
CREATE POLICY "dis_admin_update" ON public.disputes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_dis_updated BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 19) REPORTS
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
  target_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  reason public.report_reason NOT NULL,
  details text,
  status public.report_status NOT NULL DEFAULT 'open',
  handled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  handled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rep_insert_self" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "rep_self_select" ON public.reports FOR SELECT TO authenticated USING (reporter_id = auth.uid());
CREATE POLICY "rep_admin_all" ON public.reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 20) VIEWS
CREATE OR REPLACE VIEW public.v_public_opportunities AS
SELECT o.id, o.title, o.type, o.description, o.location, o.remote,
       o.compensation_type, o.compensation_amount, o.duration_weeks,
       o.posted_at, o.deadline, o.applicant_count, o.featured, o.business_id,
       b.company_name, b.logo_url, b.verification_status
  FROM public.opportunities o
  JOIN public.business_profiles b ON b.user_id = o.business_id
 WHERE o.status = 'open';
GRANT SELECT ON public.v_public_opportunities TO anon, authenticated;

CREATE OR REPLACE VIEW public.v_review_summary AS
SELECT subject_id, round(avg(rating)::numeric, 2) AS average_rating, count(*) AS review_count
  FROM public.reviews GROUP BY subject_id;
GRANT SELECT ON public.v_review_summary TO anon, authenticated;

CREATE OR REPLACE VIEW public.v_wallet_summary AS
SELECT user_id, available_balance, pending_balance, lifetime_earnings, lifetime_spent, last_payout_at
  FROM public.wallets;
GRANT SELECT ON public.v_wallet_summary TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin only'; END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'total_students', (SELECT count(*) FROM public.user_roles WHERE role='student'),
    'total_graduates', (SELECT count(*) FROM public.user_roles WHERE role='graduate'),
    'total_businesses', (SELECT count(*) FROM public.user_roles WHERE role='business'),
    'total_opportunities', (SELECT count(*) FROM public.opportunities),
    'open_opportunities', (SELECT count(*) FROM public.opportunities WHERE status='open'),
    'total_applications', (SELECT count(*) FROM public.applications),
    'pending_verifications', (SELECT count(*) FROM public.business_profiles WHERE verification_status='pending'),
    'open_disputes', (SELECT count(*) FROM public.disputes WHERE status IN ('open','in_review')),
    'open_reports', (SELECT count(*) FROM public.reports WHERE status IN ('open','reviewing'))
  ) INTO result;
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;

-- 21) REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
