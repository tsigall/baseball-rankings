// Supabase connection details. Fill these in to turn on the community page;
// leave them empty and the site works exactly as before, with no Community tab
// and nothing sent anywhere.
//
// The anon key belongs in here even though this repo is public. It's designed
// to be visible — it's what identifies the project to the browser, and any
// static site necessarily ships it. What protects the data is the database's
// row-level security rules (see COMMUNITY.md), which allow only inserting new
// rankings and reading them back. It is NOT the service_role key, which is
// secret and must never appear in this file.

export const SUPABASE_URL = ''
export const SUPABASE_ANON_KEY = ''

export const communityEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
