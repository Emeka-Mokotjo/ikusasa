
-- Views: enforce the querying user's RLS, not the view creator's
ALTER VIEW public.v_public_opportunities SET (security_invoker = on);
ALTER VIEW public.v_review_summary       SET (security_invoker = on);
ALTER VIEW public.v_wallet_summary       SET (security_invoker = on);

-- Lock down SECURITY DEFINER functions: never callable as anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_role()             FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_stats()                   FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.submit_business_verification()  FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_business_verification(uuid, boolean) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.fund_task_escrow(uuid)          FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.release_task_payment(uuid)      FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.refund_task_payment(uuid)       FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.request_withdrawal(numeric)     FROM public, anon;
