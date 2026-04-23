# Handoff

## Current State

- Demo mode has been removed.
- Supabase is now required for live sign-in and workspace data.
- The UI has been refreshed across the login, dashboard, project workspace, assistant panel, and upload form.
- Lint, production build, and package dry-run all passed after the UI pass.

## Completed Work

- Removed the fake demo workspace path and demo flags.
- Updated onboarding to collect Supabase credentials instead of seeding demo defaults.
- Improved the shell/header with a cleaner top bar and page intro.
- Reworked the dashboard into a more guided overview with a focus panel and better empty states.
- Added a stronger hero section and empty-state handling to the project workspace.
- Refined the AI assistant card so it reads like part of the product, not a generic chat widget.
- Tightened the login screen and upload form styling.

## Validation

- `npm run lint`
- `npm run build`
- `npm pack --dry-run`

## Notes

- `bun.lock` is still untracked and was intentionally left out of the commit.
- `supabase/.temp/` is also untracked and should stay out of source control.

## Next Possible Pass

- Run the Playwright smoke test against a live Supabase-backed session.
- Tune the project workspace table density and interaction states if more polish is needed.
