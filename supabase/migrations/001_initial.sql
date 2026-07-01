-- profiles
create table if not exists profiles (
  id uuid references auth.users primary key,
  first_name text not null,
  email text,
  role text not null default 'friend',
  created_at timestamptz default now()
);

-- events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date_start date not null,
  date_end date not null,
  days_of_week int[] not null default '{4,5,6}',
  time_windows text[] not null default '{"Morning","Afternoon","Evening"}',
  created_by uuid references profiles(id),
  token uuid unique not null default gen_random_uuid(),
  created_at timestamptz default now()
);

-- availability
create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid references auth.users(id),
  first_name text not null,
  available_date date not null,
  time_windows text[] not null,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table events enable row level security;
alter table availability enable row level security;

-- profiles policies
create policy "users read own profile" on profiles for select using (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);

-- events policies
create policy "anyone reads events" on events for select using (true);
create policy "organisers insert events" on events for insert with check (auth.uid() = created_by);
create policy "organisers update own events" on events for update using (auth.uid() = created_by);
create policy "organisers delete own events" on events for delete using (auth.uid() = created_by);

-- availability policies
create policy "anyone inserts availability" on availability for insert with check (true);
create policy "logged in users read availability" on availability for select using (auth.uid() is not null);
create policy "admin deletes availability" on availability for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, first_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    new.email,
    case when new.email = 'alysha@kolamstudios.com' then 'admin' else 'friend' end
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
