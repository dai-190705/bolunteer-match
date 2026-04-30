-- programs table
create table programs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  target text,          -- 対象者 (e.g. "中学生・高校生")
  deadline date,        -- 応募締切
  apply_url text,       -- 応募先URL
  tags text[],          -- タグ (e.g. ["科学", "環境"])
  publisher_id uuid references auth.users(id) on delete cascade,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table programs enable row level security;

-- Anyone can read published programs
create policy "Public can view published programs"
  on programs for select
  using (published = true);

-- Publishers can view all their own programs
create policy "Publishers can view own programs"
  on programs for select
  using (auth.uid() = publisher_id);

-- Publishers can insert their own programs
create policy "Publishers can insert programs"
  on programs for insert
  with check (auth.uid() = publisher_id);

-- Publishers can update their own programs
create policy "Publishers can update programs"
  on programs for update
  using (auth.uid() = publisher_id);

-- Publishers can delete their own programs
create policy "Publishers can delete programs"
  on programs for delete
  using (auth.uid() = publisher_id);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_programs_updated_at
  before update on programs
  for each row
  execute function update_updated_at_column();
