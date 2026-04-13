# Y3Y2 Hero Pool Census

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Click Deploy — done!

## Supabase Setup (one-time)

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
create table if not exists census_data (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table census_data enable row level security;

create policy "Public read" on census_data
  for select using (true);

create policy "Public insert" on census_data
  for insert with check (true);

create policy "Public update" on census_data
  for update using (true);
```

## Local Development

```bash
npm install
npm run dev
```
