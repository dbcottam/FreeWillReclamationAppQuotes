# Content API Contract

## Current Contract

- Current app-facing contract: `v2`
- Current schema version: `2`
- Current generated feeds:
  - `v2/daily-quotes.json`
  - `v2/quotes.json`
  - `v2/challenge.json`

The app must read versioned feed URLs and verify both `contractVersion` and `version` before using a feed.

## Compatibility Rule

Content-only edits stay inside the current contract:

- quote text
- challenge text
- supplemental material values
- image URLs
- categories from the existing allowed category list

Structural edits require a new contract folder:

- adding, removing, or renaming required fields
- changing root array names such as `quotes` or `challenges`
- changing item identity fields such as `day` or `id`
- changing a value type, for example from string to object
- removing an endpoint the current contract promises
- changing category vocabulary in a way the app must understand differently

When a structural edit is needed after `v2` ships, create the next folder, such as `v3/`, update `contentContractVersion` and `contentVersion` in `scripts/generate-content-json.mjs`, and update the app constants in `src/services/contentApiConfig.js` in the same app release.

## Compatibility Feeds

- Root JSON files are temporary legacy feeds for currently installed test builds that still read unversioned URLs.
- `v1/` preserves the legacy root contract as an explicit versioned snapshot.
- After the next beta app install confirms tester devices are reading `/v2/`, delete the non-versioned root JSON feeds and keep versioned folders as the API surface.
