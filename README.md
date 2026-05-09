# Free Will Reclamation App Quotes

This repository is the remote content feed for the Free Will Reclamation App.

It started as a quote repository, but it is now also the editable home for the first 40 days of the daily journey. The app reads these files over GitHub Raw so content can evolve without forcing an app update.

## Primary Feeds

The app should read:

- `quotes.json`
- `daily-quotes.json`

Raw URL:

- `https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/quotes.json`
- `https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/daily-quotes.json`

If your default branch changes from `main`, update the URL in the app.

## File Structure

- `APPPLAN.md` current progress, version, and next-step plan for this content feed
- `quotes.csv` human-editable source for the extra-quote feed
- `daily-quotes.csv` human-editable source for the first 40 daily journey days
- `quotes.json` generated extra-quote endpoint used when the user asks for another quote
- `daily-quotes.json` generated remote daily journey endpoint for the first 40 days
- `quotes.schema.json` shape reference for `quotes.json`
- `daily-quotes.schema.json` shape reference for `daily-quotes.json`
- `assets/daily-images/` artwork images served to the app by GitHub Raw URL
- `scripts/generate-content-json.mjs` CSV to JSON conversion script
- `CHANGELOG.md` release notes for quote feed changes

## Quote Rules

Every quote in `quotes.json` should:

- be verifiable
- include a human-readable source
- include a human-readable source URL
- use only approved categories
- be marked `approved: true` before the app can use it
- keep a stable `id` forever once published

Every daily journey entry in `daily-quotes.json` should:

- include a stable `day` number
- include quote text, author, source, and source URL
- include the day content when you want it to override the app fallback:
  - `slug`
  - `focus`
  - `title`
  - `artworkKey`
  - `challenge`
  - `prompt`
- include one or more categories the app can use for that day
- use `scripture` for Bible or sacred-text entries when needed
- prefer quotes that also exist in `quotes.json` so daily selections stay backed by the curated quote library
- optionally include `supplemental` when the app should show a `Go Deeper` card for that day

Artwork images are served separately. See [Daily Artwork Images](#daily-artwork-images) below.

When `supplemental` is present:

- `url` is required
- `type` should be one of `youtube`, `podcast`, `article`, `resource`, `audio`, or `video`
- `imageUrl` should be a direct raw asset URL when you want a preview image
- podcast and general resource links open externally in the app
- YouTube links can play inline in the app

## Approved Categories

- `scripture`
- `courage`
- `encouragement`
- `healing`
- `hope`
- `identity`
- `peace`
- `perseverance`
- `purpose`
- `wisdom`

## Daily Artwork Images

Place artwork files in `assets/daily-images/` named to match the `artworkKey` for each day.

### Naming convention

```
day-01.webp
day-02.webp
...
day-40.webp
```

Supported formats: `.webp` (recommended), `.png`, `.jpg`, `.jpeg`.

### How it works

When `npm run content:generate` runs, the build script scans `assets/daily-images/`. For each image found it constructs a GitHub Raw URL and injects it as `artworkUrl` into the matching day entry in `daily-quotes.json`. Days with no image in the folder produce no `artworkUrl` and the app falls back to generated geometric artwork.

The app downloads and caches each image on first load. Subsequent loads are served from device storage. To force the app to re-fetch an image, rename the file (e.g. `day-01-v2.webp`) and update the `artworkKey` in `daily-quotes.csv` to match.

### Image URL format

```
https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/assets/daily-images/day-01.webp
```

### Workflow for adding a new image

1. Add the image to `assets/daily-images/` with the correct filename.
2. Run `npm run content:generate` to rebuild `daily-quotes.json`.
3. Commit and push both the image and the updated `daily-quotes.json`.
4. The app picks up the new URL on next launch — no app release needed.

## Example Entry

```json
{
  "id": "abdul-kalam-dream",
  "quote": "You have to dream before your dreams can come true.",
  "author": "A. P. J. Abdul Kalam",
  "source": "Wings of Fire, p. 112",
  "sourceUrl": "https://en.wikiquote.org/wiki/A._P._J._Abdul_Kalam",
  "categories": ["hope", "purpose"],
  "approved": true,
  "active": true
}
```

## Example Daily Journey Entry

```json
{
  "day": 1,
  "slug": "choice-begins",
  "focus": "agency",
  "title": "Choice Begins",
  "artworkKey": "day-01",
  "challenge": "Choose one thing today without pressure or guilt.",
  "prompt": "What did it feel like to make a choice that belonged to you?",
  "quote": "Quote text",
  "author": "Author",
  "source": "Source citation",
  "sourceUrl": "https://link-to-source",
  "categories": ["scripture", "hope"],
  "supplemental": {
    "type": "podcast",
    "title": "Companion episode",
    "description": "A short episode for today.",
    "url": "https://podcasts.apple.com/us/podcast/example/id1234567890",
    "imageUrl": "https://raw.githubusercontent.com/example/repo/main/images/day-01.jpg",
    "durationLabel": "24 min"
  }
}
```

## Editing Workflow

1. Add or update extra quotes in `quotes.csv`
2. Add or update daily journey entries in `daily-quotes.csv`
3. Keep `id` values stable in `quotes.csv`
4. Keep each `day` number stable in `daily-quotes.csv`
5. Make sure `approved` is `true` only for extra quotes you want live
6. Set `active` to `false` to retire an extra quote without deleting history
7. For `Go Deeper` content in `daily-quotes.csv`, fill the flattened columns:
`supplementalType`, `supplementalTitle`, `supplementalDescription`, `supplementalUrl`, `supplementalImageUrl`, `supplementalDurationLabel`
8. Run `npm run content:generate` to update `quotes.json` and `daily-quotes.json`
9. Add a note to `CHANGELOG.md`
10. Commit and push

To regenerate CSV files from the current JSON files, run:

```bash
npm run content:export
```

## Validation

Run the content generator and tests before pushing changes:

```bash
npm run content:generate
npm test
```

Current pipeline version:

- Package version: `2.0.0`
- Generated feed version: `2`

## Notes

- The app caches this content locally after fetching it.
- The CSV files are now the preferred editor surface; the app should read only the generated JSON files.
- The app still has local fallback content, so missing or partial feed entries will not break the experience.
- If you rename this repository to something like `Free Will Reclamation App API`, update the raw GitHub URLs in the app code.
