
-- Helper: extract owner-id (first folder of path)
-- storage.foldername(name) returns text[]; index 1 is the first folder.

-- ============================================================
-- avatars (semi-public to authenticated users)
-- ============================================================
CREATE POLICY "avatars_read_authn" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');
CREATE POLICY "avatars_owner_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- business-logos
-- ============================================================
CREATE POLICY "blogos_read_authn" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'business-logos');
CREATE POLICY "blogos_owner_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "blogos_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "blogos_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- cvs — owner + businesses that received an application from owner + admin
-- ============================================================
CREATE POLICY "cvs_owner_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cvs_business_select" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'cvs' AND EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.opportunities o ON o.id = a.opportunity_id
      WHERE a.applicant_id::text = (storage.foldername(name))[1]
        AND o.business_id = auth.uid()
    )
  );
CREATE POLICY "cvs_admin_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "cvs_owner_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cvs_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cvs_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- portfolio
-- ============================================================
CREATE POLICY "pf_owner_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "pf_public_visible" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'portfolio'
    AND EXISTS (
      SELECT 1 FROM public.portfolio_items p
       WHERE p.user_id::text = (storage.foldername(name))[1]
         AND p.visible = true
         AND (p.image_path = name OR p.image_path = (storage.foldername(name))[1] || '/' || split_part(name,'/',2))
    )
  );
CREATE POLICY "pf_admin_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "pf_owner_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "pf_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "pf_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- business-documents (verification)
-- ============================================================
CREATE POLICY "bvd_owner_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "bvd_admin_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'business-documents' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "bvd_owner_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "bvd_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- deliverables — keyed by worker_id; task business can read
-- ============================================================
CREATE POLICY "del_worker_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'deliverables' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "del_business_select" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'deliverables' AND EXISTS (
      SELECT 1 FROM public.deliverables d
      JOIN public.tasks t ON t.id = d.task_id
      WHERE d.file_path = name AND t.business_id = auth.uid()
    )
  );
CREATE POLICY "del_admin_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'deliverables' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "del_worker_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'deliverables' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "del_worker_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'deliverables' AND auth.uid()::text = (storage.foldername(name))[1]);
