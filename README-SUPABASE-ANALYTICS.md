# Supabase Analytics Functions Deployment

To properly enable the analytics dashboard, you must deploy the following SQL functions into your Supabase database:

Open your Supabase project, go to SQL editor, and run the contents of `supabase/analytics.sql` file or copy-paste the below code:

```sql
-- SQL function to get clicks by date
create or replace function public.clicks_by_date()
returns table(date date, clicks int)
language sql stable
as $$
  select
    date_trunc('day', created_at) as date,
    sum(clicks) as clicks
  from urls
  group by date_trunc('day', created_at)
  order by date_trunc('day', created_at);
$$;

-- SQL function to get clicks by referrer source
create or replace function public.clicks_by_referrer()
returns table(referrer text, count int)
language sql stable
as $$
  select
    coalesce(referrer, 'Unknown') as referrer,
    sum(clicks) as count
  from clicks
  group by referrer
  order by count desc;
$$;

-- SQL function to get clicks by device type
create or replace function public.clicks_by_device()
returns table(device_type text, count int)
language sql stable
as $$
  select
    coalesce(device_type, 'Unknown') as device_type,
    sum(clicks) as count
  from clicks
  group by device_type
  order by count desc;
$$;
```

### Important Notes
- Make sure your `clicks` table exists and contains columns named `clicks`, `referrer`, `device_type`.
- If your schema or table names differ, update the SQL accordingly.
- After deploying, verify the RPC functions exist in Supabase Functions about section.
- If RPC calls still fail, check your Supabase client and auth settings in your frontend.

Once deployed, your analytics dashboard will fetch live backend data correctly from these functions.

For any errors during deployment, consult Supabase documentation or support.

---
