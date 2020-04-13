CREATE USER grafanareader WITH UNENCRYPTED PASSWORD 'password';
GRANT USAGE ON SCHEMA public TO grafanareader;
GRANT SELECT ON public.metrics TO grafanareader;
GRANT SELECT ON public.okr TO grafanareader;
GRANT SELECT ON public.users TO grafanareader;
GRANT SELECT ON public.code_commits TO grafanareader;
GRANT SELECT ON public.deployments TO grafanareader;
GRANT SELECT ON public.failed_deployments TO grafanareader;
GRANT SELECT ON public.ram TO grafanareader;