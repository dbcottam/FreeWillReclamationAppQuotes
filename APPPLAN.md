# App Plan

## Current Version

- Content pipeline package: `2.0.0`
- Generated feed version: `2`
- Endpoint files: `daily-quotes.json`, `quotes.json`

## Progress

- Completed: Added CSV editing workflow for `daily-quotes.csv` and `quotes.csv`.
- Completed: Added CSV to JSON generation for app-facing endpoint files.
- Completed: Added JSON to CSV export for bootstrapping and recovery.
- Completed: Added validation for headers, booleans, categories, duplicate days, duplicate ids, and required fields.
- Completed: Added Node test coverage for generation, export, and duplicate-id validation.
- Completed: Removed stale `daily-journey.*` migration files in favor of canonical `daily-quotes.*` naming.

## Next Steps

- Add CI to run `npm test` and `npm run content:validate` on pull requests.
- Add more content validation if the app starts requiring slug format, URL format, or day count guarantees.
- Consider publishing release notes whenever quote content changes go live.

## Operating Notes

- Humans should edit CSV files.
- The app should consume JSON files only.
- Run `npm run content:generate` after CSV edits.
- Run `npm test` before pushing feed pipeline changes.
