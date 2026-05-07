# Changelog

All notable quote feed changes should be listed here.

## 2026-05-06

- Added `Go Deeper` supplemental fields to the `daily-quotes` content pipeline
- Updated the daily journey schema and README to document the nested `supplemental` JSON object used by the app
- Extended `daily-quotes.csv` with flattened supplemental columns for podcast, YouTube, article, and resource metadata

## 2026-05-04

- Added CSV source files for the daily journey and general quote feeds
- Added a no-dependency CSV to JSON generator for app endpoint updates
- Added JSON to CSV export commands for recovery and human editing
- Added Node test coverage for generation, export, and duplicate-id validation
- Added `APPPLAN.md` with progress, version, and next steps
- Bumped the content pipeline package to `2.0.0` and generated feed version to `2`
- Removed stale `daily-journey.*` migration artifacts in favor of `daily-quotes.*`

## 2026-05-03

- Added starter `quotes.json` feed
- Added `quotes.schema.json`
- Seeded 8 approved sourced quotes from the app's curated quote set
- Expanded `daily-quotes.json` into a full daily journey feed with title, focus, challenge, prompt, and celebration fields
- Added `daily-quotes.schema.json`
- Updated repository documentation to reflect the remote daily journey model
