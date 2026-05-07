# Free Will Reclamation Content CSV Pipeline

This repository uses human-editable CSV files as the source of truth and generated JSON files as the app-facing endpoints.

## Files

- `daily-quotes.csv` - editable 40-day daily journey content.
- `daily-quotes.schema.json` - validation rules for the daily journey JSON.
- `daily-quotes.json` - generated app-ready daily journey endpoint.
- `assets/daily-images/` - artwork images; filenames must match `artworkKey` values in `daily-quotes.csv`.
- `quotes.csv` - editable general quote library.
- `quotes.schema.json` - validation rules for the general quote JSON.
- `quotes.json` - generated app-ready quote endpoint.
- `scripts/generate-content-json.mjs` - CSV to JSON generation and JSON to CSV export.

## CSV Editing Rules

- One row = one quote or one daily journey day.
- Keep the header row exactly as provided.
- Use `|` between categories, for example: `hope|purpose`.
- Approved categories are `scripture`, `courage`, `encouragement`, `healing`, `hope`, `identity`, `peace`, `perseverance`, `purpose`, and `wisdom`.
- Boolean columns can be `true` or `false`; case does not matter.
- The app should read the generated JSON files, not the CSV files.

## Commands

Generate and validate both JSON files:

```bash
npm run content:generate
```

Generate only the daily journey file:

```bash
npm run content:generate:daily
```

Generate only the general quote file:

```bash
npm run content:generate:quotes
```

Regenerate the CSV files from the current JSON files:

```bash
npm run content:export
```

Run tests for the conversion pipeline:

```bash
npm test
```

## Adding Artwork Images

1. Place an image in `assets/daily-images/` named to match the day's `artworkKey` in `daily-quotes.csv`.
   ```
   day-01.webp
   day-02.webp
   ```
   Supported formats: `.webp` (recommended), `.png`, `.jpg`, `.jpeg`.
2. Run `npm run content:generate` (or `content:generate:daily`).
3. The script injects `artworkUrl` into `daily-quotes.json` automatically — no CSV column needed.
4. Commit and push the image and the updated `daily-quotes.json`.

Days with no image produce no `artworkUrl`. The app falls back to generated geometric artwork.

## Recommended Build Behavior

The included `prebuild` script runs:

```bash
npm run content:generate
```

That ensures the JSON is regenerated before every production build.

## Validation Behavior

The generator fails with readable errors when:

- A required CSV column is missing.
- An unexpected CSV column exists.
- `day` is not a positive integer.
- `approved` or `active` is not `true` or `false`.
- A category is not allowed.
- A required field is missing.
- A duplicate `day` exists in the daily quote feed.
- A duplicate `id` exists in the quote feed.

## Versioning

- Package version: `2.0.0`
- Generated feed version: `2`

## Expected Output

```text
Generated daily-quotes.json from daily-quotes.csv
Generated quotes.json from quotes.csv
```
