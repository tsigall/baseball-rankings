# The community page

Community rankings are live, backed by Supabase. This file is the schema, the
security rules, and the things you'll eventually hit.

> ## ⚠️ Run the migration in section 3 BEFORE deploying NFL support
>
> The original table only accepted 30-character codes and had no idea sports
> existed. The app now asks the database for `sport`, so until that column
> exists **the Community tab is broken for MLB as well as NFL** — it shows
> "Couldn't load community rankings right now", and every submission is
> rejected. Verified against the live project: the API returns
> `400 column rankings.sport does not exist`.
>
> Ranking, sharing, and images are unaffected; it's only the Community tab and
> new submissions. Nothing already in the table is lost, and running the
> migration fixes it immediately — no redeploy needed.
>
> It's one paste into the SQL Editor.

## 1. The Supabase project

[supabase.com](https://supabase.com), free tier. The project is already made;
this is here for rebuilding from scratch.

## 2. The table

```sql
create table rankings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sport text not null default 'mlb',
  code text not null,
  -- Each league has its own code length, so the database can still reject a
  -- malformed row rather than letting it land in the aggregate.
  constraint code_length_matches_sport check (
    (sport = 'mlb' and char_length(code) = 30) or
    (sport = 'nfl' and char_length(code) = 32)
  )
);

create index rankings_sport_idx on rankings (sport, created_at);

-- Row Level Security is what keeps this safe with a public key: without these
-- policies, nobody can touch the table at all.
alter table rankings enable row level security;

-- Anyone may add a ranking.
create policy "anyone can submit"
  on rankings for insert
  to anon
  with check (true);

-- Anyone may read them, which is what the community page does.
create policy "anyone can read"
  on rankings for select
  to anon
  using (true);
```

Note what's *absent*: there is no update or delete policy, so visitors can add
rankings and read them, but cannot change or remove anything — including their
own. Deleting a bad row is done by you, from the Supabase dashboard.

## 3. Migrating the existing table for NFL

If your table predates NFL support, run this once in the **SQL Editor**. Every
row already in it is an MLB ranking, which is why the backfill is a blanket
`'mlb'`.

```sql
-- 1. Add the sport column. Existing rows are all MLB.
alter table rankings add column if not exists sport text not null default 'mlb';

-- 2. Drop the old 30-characters-exactly rule, which would reject NFL rows.
--    The constraint was created inline, so Postgres named it automatically —
--    this finds whatever that name is rather than guessing it.
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'rankings'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%char_length(code)%'
  loop
    execute format('alter table rankings drop constraint %I', c);
  end loop;
end $$;

-- 3. Add the per-sport rule back.
alter table rankings add constraint code_length_matches_sport check (
  (sport = 'mlb' and char_length(code) = 30) or
  (sport = 'nfl' and char_length(code) = 32)
);

create index if not exists rankings_sport_idx on rankings (sport, created_at);
```

Check it worked:

```sql
select sport, count(*) from rankings group by sport;
```

You should see one row: `mlb`, with however many submissions you had.

## 4. Seeding the original four MLB rankings

Only needed on a fresh table. Four rankings were collected before the database
existed:

```sql
insert into rankings (sport, code) values
  ('mlb', 'n61e9kl8mf0cga37hqi24p5todrjsb'),
  ('mlb', '4nmh7836ltgqcaps9f1k0d5roib2ej'),
  ('mlb', 'kn6m908l1facqrieo7hg3t5pjd4s2b'),
  ('mlb', 'ne6md70ol81g2rqahfkp3t9c45ijsb');
```

Each was checked for all 30 teams, no duplicates, and no omissions. Together
they put the Mariners first (ranked 1st, 2nd, 2nd, 1st) and the Astros last.

Run this **once** — running it again would double-count all four.

## 5. The keys

**Project Settings → API** gives you the Project URL and the publishable key.
Both go in `src/config.ts`. Clearing them turns the whole feature off: no
Community tab, nothing sent anywhere.

> **Which key?** The **publishable** (anon) key only — it's meant to be public
> and any static site necessarily ships it to the browser. What protects your
> data is the RLS policies above, not the key being secret. Never put the
> **secret** key in this repo; it bypasses RLS entirely and would let anyone
> wipe the table.

## How it works

- Finishing a quiz sends the ranking as the same short code used for share
  links, plus which sport it was. Nothing else — no name, no account, no
  identifier.
- The Community tab reads every row **for the sport you're looking at** and
  averages each team's position across those submissions, lowest average first.
  MLB and NFL are counted entirely separately.
- If Supabase is unreachable, submitting fails quietly (the visitor still sees
  their ranking) and the Community tab says it couldn't load.

## Things you'll eventually hit

**Repeat submissions.** Every completed quiz counts, including the same person
going twice. That's deliberate for now — with friends and family it's not worth
guarding against.

**Spam.** The insert policy is open, so anyone who finds the key could script
submissions and skew the numbers. Fine at this scale; if it ever happens, the
fix is rate limiting or an edge function in front of the insert.

**Scale.** The community page downloads every row for a sport and aggregates in
the browser. That's fine into the low thousands. Past that, the aggregation
should move to a Postgres view so the browser only downloads the summary.

**Deleting a submission.** Rows can only be removed from the Supabase dashboard
(Table Editor → `rankings` → delete row). Worth knowing since visitors can't
retract anything themselves.

**Adding a third sport.** Three places: the team list and `SPORTS` entry in
`src/teams.ts`, and the check constraint above. Nothing else is hard-coded to
two leagues.
