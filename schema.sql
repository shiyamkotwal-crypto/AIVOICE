-- VoiceBridge AI Database Schema
-- Supabase / PostgreSQL Production Schema

create extension if not exists "uuid-ossp";

-- 1. User Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text unique not null,
  role text default 'student' check (role in ('student', 'faculty', 'staff', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Conversations
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  language text default 'en' not null,
  domain text default 'General Administrative',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Messages
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender text check (sender in ('user', 'ai')) not null,
  content text not null,
  audio_played boolean default false,
  is_voice boolean default false,
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Profiles: Users can read and update their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Conversations: Users can manage their own conversations
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- Messages: Users can access messages belonging to their conversations
create policy "Users can view messages in own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where public.conversations.id = public.messages.conversation_id
      and public.conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages into own conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where public.conversations.id = public.messages.conversation_id
      and public.conversations.user_id = auth.uid()
    )
  );

create policy "Users can update messages in own conversations"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations
      where public.conversations.id = public.messages.conversation_id
      and public.conversations.user_id = auth.uid()
    )
  );
