# Free Will Reclamation Content Template Pipeline

This repository uses human-editable Markdown templates as the source of truth and generated JSON files as the app-facing endpoints.

## Files

- `templates/daily-quotes.md` - editable 40-day daily journey content, including the authored daily challenge.
- `templates/quotes.md` - editable general quote library.
- `templates/challenges.md` - editable alternate 2-minute challenge library.
- `v1/*.json` - static compatibility copy of the current deployed/root contract, including `daily-challenge.json`.
- `v2/*.json` - generated contract-pinned endpoint files consumed by the next app build.
- Root endpoint files such as `daily-quotes.json`, `daily-challenge.json`, `quotes.json`, and `challenge.json` are legacy compatibility files and are not rewritten unless `WRITE_LEGACY_ROOT_FEEDS=1` is set.
- `*.schema.json` - validation shape references for the generated JSON.
- `assets/daily-images/` - artwork images; filenames must match `Artwork` values in `templates/daily-quotes.md`.
- `scripts/generate-content-json.mjs` - Markdown template to JSON generation and JSON to template export.

## Template Editing Rules

- One `##` section = one quote, challenge, or daily journey day.
- Keep field labels exactly as written, such as `Categories:` and `Quote:`.
- Categories can be comma-separated, for example: `hope, purpose`.
- Approved categories are `scripture`, `courage`, `encouragement`, `healing`, `hope`, `identity`, `peace`, `perseverance`, `purpose`, and `wisdom`.
- Boolean fields can be `yes` or `no`.
- Daily journey entries include blank supplemental fields. Leave `Supplemental URL` empty when there is no supplemental material.
- The app should read the generated JSON files, not the Markdown templates.
- Production app builds should read the contract version URLs, such as `/v2/`, and verify each feed's `contractVersion` and schema `version` values before using content.
- Structural API changes require a new version folder. Use `CONTENT_API_CONTRACT.md` to decide whether an edit is content-only or structural.

## Supplemental Material Examples

`templates/daily-quotes.md` includes one example of each supported supplemental type:

- Day 1: `youtube`
- Day 2: `podcast`
- Day 3: `article`
- Day 4: `resource`
- Day 5: `audio`
- Day 6: `video`

For any day, fill `Supplemental Type`, `Supplemental Title`, `Supplemental Description`, `Supplemental URL`, optional `Supplemental Image URL`, and `Supplemental Duration`. The generator only emits a `supplemental` object when `Supplemental URL` is present.

## Commands

Generate and validate all JSON files:

```bash
npm run content:generate
```

Generate legacy root endpoint files too:

```bash
WRITE_LEGACY_ROOT_FEEDS=1 npm run content:generate
```

Do not use that legacy-root command while current tester devices still depend on the old root contract unless you intentionally want to update those devices.

After the next beta app install confirms tester devices are reading `/v2/`, delete the non-versioned root JSON feeds: `daily-quotes.json`, `daily-challenge.json`, `quotes.json`, and `challenge.json`. Keep versioned contract folders as the app-facing API surface.

Generate only the daily journey file:

```bash
npm run content:generate:daily
```

Generate only the general quote file:

```bash
npm run content:generate:quotes
```

Generate only the challenge file:

```bash
npm run content:generate:challenges
```

Regenerate the Markdown templates from the current JSON files:

```bash
npm run content:export
```

Run tests for the conversion pipeline:

```bash
npm test
```

## Adding Artwork Images

1. Place an image in `assets/daily-images/` named to match the day's `Artwork` value in `templates/daily-quotes.md`.
   ```
   day-01.webp
   day-02.webp
   ```
   Supported formats: `.webp` (recommended), `.png`, `.jpg`, `.jpeg`.
2. Run `npm run content:generate` or `npm run content:generate:daily`.
3. The script injects `artworkUrl` into `daily-quotes.json` automatically.
4. Commit and push the image and the updated `daily-quotes.json`.

Days with no image produce no `artworkUrl`. The app falls back to generated geometric artwork.

## Validation Behavior

The generator fails with readable errors when:

- A required template file is missing.
- A template has no `##` sections.
- `day` is not a positive integer.
- `approved` or `active` is not `yes` or `no`.
- A category is not allowed.
- A required field is missing.
- A duplicate `day` exists in the daily quote feed.
- A duplicate `id` exists in the quote feed.
- A duplicate `id` exists in the challenge feed.

## Expected Output

```text
Generated v2/daily-quotes.json from templates/daily-quotes.md
Generated v2/quotes.json from templates/quotes.md
Generated v2/challenge.json from templates/challenges.md
```

The generator writes matching files under `v2/`. The `v1/` folder is preserved for compatibility and should only be changed deliberately.
