# App Plan

## Current Version

- Content pipeline package: `2.1.0`
- Generated feed version: `2`
- Legacy compatibility feeds: root JSON files and `v1/`
- Next app contract feeds: `v2/daily-quotes.json`, `v2/quotes.json`, `v2/challenge.json`

## Progress

- Completed: Replaced CSV editing with Markdown templates in `templates/`.
- Completed: Added Markdown template to JSON generation for app-facing endpoint files.
- Completed: Added JSON to Markdown template export for bootstrapping and recovery.
- Completed: Added validation for booleans, categories, duplicate days, duplicate ids, and required fields.
- Completed: Added Node test coverage for generation, export, and duplicate-id validation.
- Completed: Removed stale `daily-journey.*` migration files in favor of canonical `daily-quotes.*` naming.
- Completed: Removed the separate `daily-challenge.*` endpoint so authored daily challenges live in `daily-quotes.json`.
- Completed: Added contract-pinned `v2/` endpoint output so the next app build can lock to a compatible API contract.
- Completed: Preserved root and `v1/` feeds for current deployed/test devices.
- Completed: Added `CONTENT_API_CONTRACT.md` so structural changes require an explicit new version folder.
- Completed: Added deterministic artwork asset scanning and regression coverage for stable generated timestamps.

## Next Steps

- After the next beta app install confirms tester devices are reading `/v2/`, delete the non-versioned root JSON feeds: `daily-quotes.json`, `daily-challenge.json`, `quotes.json`, and `challenge.json`.
- Add CI to run `npm test` and `npm run content:validate` on pull requests.
- Add more content validation if the app starts requiring slug format, URL format, or day count guarantees.
- Consider publishing release notes whenever quote content changes go live.

## Operating Notes

- Humans should edit Markdown files in `templates/`.
- The app should consume JSON files only.
- Run `npm run content:generate` after template edits.
- Run `npm test` before pushing feed pipeline changes.
