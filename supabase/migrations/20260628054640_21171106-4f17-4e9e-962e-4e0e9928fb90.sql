
-- Trigger functions: should never be callable from the API at all
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                       FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_wallet()                FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()              FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lock_business_verification_fields()     FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_opportunity_publish()           FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_application_rules()             FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_opportunity_applicant_count()      FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_application_accepted()               FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_conversation_on_message()         FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_application_change()          FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_message()                     FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_portfolio_from_task()            FROM public, anon, authenticated;

-- Constant helper: safe but no need to be public
REVOKE EXECUTE ON FUNCTION public.platform_fee_rate()                     FROM public, anon;

-- Pin search_path on platform_fee_rate (the WARN 1 mutable function)
ALTER FUNCTION public.platform_fee_rate() SET search_path = public;
