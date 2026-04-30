create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  organization text,
  approved boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);
