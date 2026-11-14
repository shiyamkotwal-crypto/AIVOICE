-- ====================================================================
-- VoiceBridge AI — Supabase Cloud PostgreSQL Schema & Migration Script
-- File: /supabase/migrations/001_initial_schema.sql
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ====================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================

-- 2.1 Profiles Table (Matches prompt schema & supports Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  role text default 'student' check (role in ('student', 'faculty', 'staff', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.2 Conversations Table
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  language text default 'en' not null,
  domain text default 'General Administrative',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.3 Messages Table
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

-- ====================================================================
-- 3. PERFORMANCE INDEXES
-- ====================================================================
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_created_at on public.conversations(created_at desc);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_created_at on public.messages(created_at asc);

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Clean existing policies for idempotency
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Service role full access on profiles" on public.profiles;

drop policy if exists "Users can view own conversations" on public.conversations;
drop policy if exists "Users can create conversations" on public.conversations;
drop policy if exists "Users can update own conversations" on public.conversations;
drop policy if exists "Users can delete own conversations" on public.conversations;
drop policy if exists "Service role full access on conversations" on public.conversations;

drop policy if exists "Users can view messages in own conversations" on public.messages;
drop policy if exists "Users can insert messages into own conversations" on public.messages;
drop policy if exists "Users can update messages in own conversations" on public.messages;
drop policy if exists "Service role full access on messages" on public.messages;

-- --- Profiles Policies ---
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or auth.role() = 'service_role');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or auth.role() = 'service_role');

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id or auth.role() = 'service_role');

-- --- Conversations Policies ---
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id or auth.role() = 'service_role');

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id or auth.role() = 'service_role');

-- --- Messages Policies ---
create policy "Users can view messages in own conversations"
  on public.messages for select
  using (
    auth.role() = 'service_role' or
    exists (
      select 1 from public.conversations
      where public.conversations.id = public.messages.conversation_id
      and public.conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages into own conversations"
  on public.messages for insert
  with check (
    auth.role() = 'service_role' or
    exists (
      select 1 from public.conversations
      where public.conversations.id = public.messages.conversation_id
      and public.conversations.user_id = auth.uid()
    )
  );

create policy "Users can update messages in own conversations"
  on public.messages for update
  using (
    auth.role() = 'service_role' or
    exists (
      select 1 from public.conversations
      where public.conversations.id = public.messages.conversation_id
      and public.conversations.user_id = auth.uid()
    )
  );

-- ====================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER FOR SUPABASE AUTH
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'auth' and tablename = 'users') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
exception when others then
  null;
end $$;

-- ====================================================================
-- 6. COMPREHENSIVE SEED DATA
-- ====================================================================

-- 6.1 Seed User Profiles (Demo Accounts)
insert into public.profiles (id, full_name, email, role, created_at)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Alex Rivera (Demo Student)', 'student.demo@voicebridge.ai', 'student', now() - interval '3 days'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Dr. Sarah Connor (Demo Admin)', 'admin.demo@voicebridge.ai', 'admin', now() - interval '7 days'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Prof. Rajesh Sharma', 'faculty.demo@voicebridge.ai', 'faculty', now() - interval '5 days')
on conflict (id) do update
set full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role;

-- 6.2 Seed Conversations across 4 Campus Domains & Languages
insert into public.conversations (id, user_id, title, language, domain, created_at)
values
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Semester Fee Payment & Examination Schedule',
    'en-US',
    'Academic & Admissions',
    now() - interval '2 days'
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'कैंपस वाई-फाई सेटअप और पासवर्ड सहायता',
    'hi-IN',
    'Technical Helpdesk',
    now() - interval '1 day'
  ),
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'ಹಾಸ್ಟೆಲ್ ಹಂಚಿಕೆ ಮತ್ತು ಲೈಬ್ರರಿ ಸಮಯ',
    'kn-IN',
    'Campus Facilities',
    now() - interval '12 hours'
  ),
  (
    '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Emisión de credenciales y actas oficiales',
    'es-ES',
    'General Administrative',
    now() - interval '4 hours'
  )
on conflict (id) do update
set title = excluded.title,
    language = excluded.language,
    domain = excluded.domain;

-- 6.3 Seed Messages (User Spoken Inquiries & Gemini AI Audio Responses)
insert into public.messages (id, conversation_id, sender, content, audio_played, is_voice, language, created_at)
values
  -- Conversation 1: Academic (English)
  (
    '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a81',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'user',
    'When is the semester fee payment deadline and where can I download my hall ticket?',
    true,
    true,
    'en-US',
    now() - interval '2 days' + interval '1 minute'
  ),
  (
    '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a82',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'ai',
    'The semester fee payment deadline is November 30th through the Student ERP portal. Mid-term examination hall tickets will be available for download starting December 8th under the Examination tab.',
    true,
    false,
    'en-US',
    now() - interval '2 days' + interval '2 minutes'
  ),

  -- Conversation 2: Technical Helpdesk (Hindi)
  (
    '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a83',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'user',
    'कैंपस वाई-फाई नेटवर्क का पासवर्ड क्या है और इसे लैपटॉप में कैसे जोड़ें?',
    true,
    true,
    'hi-IN',
    now() - interval '1 day' + interval '1 minute'
  ),
  (
    '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a84',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'ai',
    'कैंपस वाई-फाई से जुड़ने के लिए "Campus-Secure" नेटवर्क चुनें। प्रमाणीकरण प्रकार में WPA2-Enterprise चुनें और अपने छात्र रोल नंबर तथा ERP पासवर्ड से लॉगिन करें। किसी भी सहायता के लिए आईटी डेस्क रूम 204 खुला है।',
    true,
    false,
    'hi-IN',
    now() - interval '1 day' + interval '2 minutes'
  ),

  -- Conversation 3: Facilities (Kannada)
  (
    '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a85',
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'user',
    'ಕೇಂದ್ರ ಗ್ರಂಥಾಲಯದ ಸಮಯ ಮತ್ತು ಹಾಸ್ಟೆಲ್ ಕೊಠಡಿ ಬದಲಾವಣೆ ಪ್ರಕ್ರಿಯೆ ತಿಳಿಸಿ.',
    true,
    true,
    'kn-IN',
    now() - interval '12 hours' + interval '1 minute'
  ),
  (
    '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a86',
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'ai',
    'ಕೇಂದ್ರ ಗ್ರಂಥಾಲಯವು ಬೆಳಿಗ್ಗೆ 8:00 ರಿಂದ ರಾತ್ರಿ 11:00 ರವರೆಗೆ ತೆರೆದಿರುತ್ತದೆ. ಹಾಸ್ಟೆಲ್ ಕೊಠಡಿ ಬದಲಾವಣೆಗಾಗಿ ವಾರ್ಡನ್ ಕಚೇರಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.',
    true,
    false,
    'kn-IN',
    now() - interval '12 hours' + interval '2 minutes'
  ),

  -- Conversation 4: General Administrative (Spanish)
  (
    '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a87',
    '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'user',
    '¿Cuál es el procedimiento para solicitar una credencial de estudiante duplicada?',
    true,
    true,
    'es-ES',
    now() - interval '4 hours' + interval '1 minute'
  ),
  (
    '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'ai',
    'Para obtener un duplicado de la credencial de estudiante, presente el formulario de extravío en la Oficina del Registrador, Edificio Central, Mostrador 4. El trámite demora 24 a 48 horas.',
    true,
    false,
    'es-ES',
    now() - interval '4 hours' + interval '2 minutes'
  )
on conflict (id) do nothing;
