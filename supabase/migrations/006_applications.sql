create table applications (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  status text check (status in ('applied', 'completed')) default 'applied' not null,
  applied_at timestamptz default now(),
  completed_at timestamptz,
  unique(program_id, student_id)
);

alter table applications enable row level security;

-- Students can view their own applications
create policy "Students can view own applications"
  on applications for select
  using (auth.uid() = student_id);

-- Students can insert their own applications
create policy "Students can apply"
  on applications for insert
  with check (auth.uid() = student_id);

-- Publishers can view applications for their programs
create policy "Publishers can view applications for their programs"
  on applications for select
  using (
    exists (
      select 1 from programs
      where programs.id = applications.program_id
      and programs.publisher_id = auth.uid()
    )
  );

-- Publishers can update application status (mark as completed)
create policy "Publishers can update application status"
  on applications for update
  using (
    exists (
      select 1 from programs
      where programs.id = applications.program_id
      and programs.publisher_id = auth.uid()
    )
  );
