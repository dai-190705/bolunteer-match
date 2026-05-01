-- 学生プロフィールテーブル
create table student_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  last_name text not null,
  first_name text not null,
  last_name_kana text not null,
  first_name_kana text not null,
  school text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table student_profiles enable row level security;

-- 本人だけ自分のプロフィールを参照・作成・更新できる
create policy "Students can view own profile"
  on student_profiles for select
  using (auth.uid() = id);

create policy "Students can insert own profile"
  on student_profiles for insert
  with check (auth.uid() = id);

create policy "Students can update own profile"
  on student_profiles for update
  using (auth.uid() = id);

-- パブリッシャーは応募者のプロフィールを参照できる
create policy "Publishers can view applicant profiles"
  on student_profiles for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
    )
  );
