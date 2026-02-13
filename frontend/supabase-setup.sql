-- Create bookmarks table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table bookmarks enable row level security;

create policy "Users can only see their own bookmarks"
  on bookmarks for select using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks"
  on bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
  on bookmarks for delete using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table bookmarks;
