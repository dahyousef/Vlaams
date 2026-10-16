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

-- Historique des réponses (graphique de la semaine, ce qui résiste). Une remise
-- à zéro supprime les lignes du compte antérieures à son instant.
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

-- ------------------------------------------------------------------ une remise à zéro ne recule pas
-- Le relancer ne change rien.
--
-- Dans les réglages (user_meta.data), resetAt est l'instant de la dernière remise
-- à zéro du compte, et progress (frontière, conversations et écoutes faites) la
-- progression qui en descend. Sur le serveur, resetAt ne fait que croître : cette
-- version écrit toujours le maximum de ce qu'elle a lu et de ce qu'elle porte.
-- Seul un onglet resté sur la version précédente le fait reculer : il recopie les
-- réglages entiers, et si les siens sont plus récents, il renvoie le resetAt et le
-- progress qu'il a vus en dernier — d'avant la remise à zéro ou la restauration.
--
-- Une écriture qui ferait reculer resetAt garde donc le resetAt et le progress du
-- serveur, et prend le reste tel qu'il arrive : thème, XP, série. Rien n'échoue :
-- refusée, l'écriture de la version précédente serait retentée toutes les trente
-- secondes et refusée chaque fois, tant que ses réglages restent les plus récents.
--
-- Une ligne sans resetAt (écrite par la version précédente seule) compte pour 0 :
-- elle n'est jamais touchée, et la première écriture de cette version passe.
--
-- Les déclencheurs BEFORE UPDATE d'une table partent par ordre alphabétique de
-- nom : keep_newer, puis keep_reset. Celui-ci ne voit donc que les écritures que
-- keep_newer garde. L'upsert de l'app (insert … on conflict do update) passe par
-- ici ; une première ligne, sans ligne existante, n'a rien à protéger.
--
-- Pour le retirer :
--   drop trigger if exists keep_reset on public.user_meta; drop function if exists public.keep_reset();
create or replace function public.keep_reset()
returns trigger language plpgsql set search_path = '' as $$
declare
  was      numeric := case when jsonb_typeof(old.data -> 'resetAt') = 'number'
                           then (old.data ->> 'resetAt')::numeric else 0 end;
  incoming numeric := case when jsonb_typeof(new.data -> 'resetAt') = 'number'
                           then (new.data ->> 'resetAt')::numeric else 0 end;
begin
  if incoming < was then
    new.data := (new.data - 'progress') || jsonb_build_object('resetAt', old.data -> 'resetAt');
    if old.data ? 'progress' then
      new.data := new.data || jsonb_build_object('progress', old.data -> 'progress');
    end if;
  end if;
  return new;
end $$;

drop trigger if exists keep_reset on public.user_meta;
create trigger keep_reset before update on public.user_meta
  for each row execute function public.keep_reset();
