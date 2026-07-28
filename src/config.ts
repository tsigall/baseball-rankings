// Supabase connection details. Fill these in to turn on the community page;
// leave them empty and the site works exactly as before, with no Community tab
// and nothing sent anywhere.
//
// The publishable key belongs in here even though this repo is public. It's
// designed to be visible — it identifies the project to the browser, and any
// static site necessarily ships it. What protects the data is the database's
// row-level security rules (see COMMUNITY.md), which allow only inserting new
// rankings and reading them back.
//
// This is the sb_publishable_ key. The sb_secret_ key bypasses those rules
// entirely and must never appear in this file or anywhere in the repo.

export const SUPABASE_URL = 'https://sswtclidyrhxvpqkchxd.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_8wTs0LwHh5pulRxV5ih-CQ_TfG8zRdc'

export const communityEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
