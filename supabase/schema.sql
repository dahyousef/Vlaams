-- Vlaams — schéma de la base.
-- À coller une fois dans Supabase → SQL Editor → Run.
--
-- Chaque table porte user_id, et la sécurité au niveau des lignes (RLS) garantit
-- qu'un utilisateur ne voit et ne modifie QUE ses propres lignes. C'est ce qui
-- permet à l'app de rester un site statique : la clé publique peut être dans le
-- navigateur, la base fait elle-même respecter les droits.

-- Une ligne par élément du planificateur (mot, phrase, règle).
create table if not exists public.srs_records (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  item_id    text        not null,
  data       jsonb       not null,
  updated_at bigint      not null,          -- horloge de l'appareil, en ms
  primary key (user_id, item_id)
);

-- Réglages, série, XP : un seul document par utilisateur.
create table if not exists public.user_meta (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  data       jsonb       not null,
  updated_at bigint      not null
);

-- Les mots ajoutés à la main. Une suppression est un drapeau, pour qu'elle se
-- propage aux autres appareils au lieu de ressusciter à la synchro suivante.
create table if not exists public.custom_words (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  id         text        not null,
  data       jsonb       not null,
  deleted    boolean     not null default false,
  updated_at bigint      not null,
  primary key (user_id, id)
);

-- Historique des révisions (graphique de la semaine), en ajout seul.
create table if not exists public.review_log (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  t          bigint      not null,
  item_id    text        not null,
  data       jsonb       not null,
  primary key (user_id, t, item_id)
);
create index if not exists review_log_recent on public.review_log (user_id, t desc);

-- ------------------------------------------------------------------ RLS
alter table public.srs_records  enable row level security;
alter table public.user_meta    enable row level security;
alter table public.custom_words enable row level security;
alter table public.review_log   enable row level security;

do $$
declare t text;
begin
  foreach t in array array['srs_records','user_meta','custom_words','review_log'] loop
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id)
         with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- ------------------------------------------------------------------ last write wins
-- A device that was offline with an OLDER edit must not overwrite a newer one
-- when it reconnects. Upserts run BEFORE UPDATE triggers; returning null skips
-- that row silently, and the device picks up the newer version on its next pull.
create or replace function public.keep_newer()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.updated_at < old.updated_at then
    return null;
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['srs_records','user_meta','custom_words'] loop
    execute format('drop trigger if exists keep_newer on public.%I', t);
    execute format(
      'create trigger keep_newer before update on public.%I
         for each row execute function public.keep_newer()', t);
  end loop;
end $$;
