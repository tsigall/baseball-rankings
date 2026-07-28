# Turning on the community page

The community page is built and tested, but switched off until it's pointed at
a database. Until then the site behaves exactly as before: no Community tab,
and nothing is sent anywhere.

Three steps, about five minutes.

## 1. Make a Supabase project

Go to [supabase.com](https://supabase.com), sign up (free), and create a new
project. Any name and region are fine — pick a region near you.

## 2. Create the table

In the project, open the **SQL Editor** and run this:

```sql
create table rankings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  code text not null check (char_length(code) = 30)
);

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

The `char_length(code) = 30` check means malformed rows get rejected by the
database rather than landing in the aggregate.

## 2b. Seed the four existing rankings

Four rankings were collected before the database existed. Run this in the same
SQL Editor to load them, so the Community page isn't empty on day one:

```sql
insert into rankings (code) values
  ('n61e9kl8mf0cga37hqi24p5todrjsb'),
  ('4nmh7836ltgqcaps9f1k0d5roib2ej'),
  ('kn6m908l1facqrieo7hg3t5pjd4s2b'),
  ('ne6md70ol81g2rqahfkp3t9c45ijsb');
```

Each was checked for all 30 teams, no duplicates, and no omissions. Together
they put the Mariners first (ranked 1st, 2nd, 2nd, 1st) and the Astros last.

Run this **once** — running it again would double-count all four.

## 3. Paste the keys in

In Supabase, go to **Project Settings → API** and copy:

- the **Project URL**
- the **anon / public** key

Put them in `src/config.ts`:

```ts
export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJ...'
```

Commit and push. The Community tab appears once it deploys.

> **Which key?** The **anon** key only — it's meant to be public and any static
> site necessarily ships it to the browser. What protects your data is the RLS
> policies above, not the key being secret. Never put the **service_role** key
> in this repo; it bypasses RLS entirely and would let anyone wipe the table.

## How it works

- Finishing a quiz sends the ranking as the same 30-character code used for
  share links. Nothing else is sent — no name, no account, no identifier.
- The Community tab reads every row and averages each team's position across
  all submissions, lowest average first.
- If Supabase is unreachable, submitting fails quietly (the visitor still sees
  their ranking) and the Community tab says it couldn't load.

## Things you'll eventually hit

**Repeat submissions.** Every completed quiz counts, including the same person
going twice. That's deliberate for now — with friends and family it's not worth
guarding against.

**Spam.** The insert policy is open, so anyone who finds the key could script
submissions and skew the numbers. Fine at this scale; if it ever happens, the
fix is rate limiting or an edge function in front of the insert.

**Scale.** The community page downloads every row and aggregates in the browser.
That's fine into the low thousands. Past that, the aggregation should move to a
Postgres view so the browser only downloads the summary.

**Deleting a submission.** Rows can only be removed from the Supabase dashboard
(Table Editor → `rankings` → delete row). Worth knowing since visitors can't
retract anything themselves.
