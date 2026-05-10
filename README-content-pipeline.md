# Free Will Reclamation Content Template Pipeline

This repository uses human-editable Markdown templates as the source of truth and generated JSON files as the app-facing endpoints.

## Files

- `templates/daily-quotes.md` - editable 40-day daily journey content.
- `templates/daily-challenges.md` - editable 40-day authored daily challenge content.
- `templates/quotes.md` - editable general quote library.
- `templates/challenges.md` - editable alternate 2-minute challenge library.
- `daily-quotes.json` - generated app-ready daily journey endpoint.
- `daily-challenge.json` - generated daily challenge endpoint.
- `quotes.json` - generated quote endpoint.
- `challenge.json` - generated challenge endpoint.
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

## Commands

Generate and validate all JSON files:

```bash
npm run content:generate
```

Generate only the daily journey file:

```bash
npm run content:generate:daily
```

Generate only the daily challenge file:

```bash
npm run content:generate:daily-challenges
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
- A duplicate `day` exists in the daily challenge feed.
- A duplicate `id` exists in the quote feed.
- A duplicate `id` exists in the challenge feed.

## Expected Output

```text
Generated daily-quotes.json from templates/daily-quotes.md
Generated daily-challenge.json from templates/daily-challenges.md
Generated quotes.json from templates/quotes.md
Generated challenge.json from templates/challenges.md
```
