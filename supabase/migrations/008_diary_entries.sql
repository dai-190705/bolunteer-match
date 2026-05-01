create table diary_entries (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references applications(id) on delete cascade unique not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  image_urls text[] default '{}',
  learned text,
  next_challenge text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table diary_entries enable row level security;

-- 本人だけ参照・作成・更新できる
create policy "Students can view own diary"
  on diary_entries for select
  using (auth.uid() = student_id);

create policy "Students can insert own diary"
  on diary_entries for insert
  with check (auth.uid() = student_id);

create policy "Students can update own diary"
  on diary_entries for update
  using (auth.uid() = student_id);

-- diaryの画像用Storageバケット
insert into storage.buckets (id, name, public)
values ('diary-images', 'diary-images', true)
on conflict (id) do nothing;

-- 認証済みユーザーがアップロードできる
create policy "Authenticated users can upload diary images"
  on storage.objects for insert
  with check (bucket_id = 'diary-images' and auth.role() = 'authenticated');

create policy "Diary images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'diary-images');
