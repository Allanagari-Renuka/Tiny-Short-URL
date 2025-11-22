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
    referrer,
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
    device_type,
    sum(clicks) as count
  from clicks
  group by device_type
  order by count desc;
$$;
