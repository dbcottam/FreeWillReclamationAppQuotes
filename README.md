# Free Will Reclamation App Quotes

This repository is the remote content feed for the Free Will Reclamation App.

It started as a quote repository, but it is now also the editable home for the first 40 days of the daily journey. The app reads these files over GitHub Raw so content can evolve without forcing an app update.

## Primary Feeds

Current deployed/test devices may still read the legacy root feeds:

- `quotes.json`
- `daily-quotes.json`
- `daily-challenge.json`
- `challenge.json`

Versioned contract feeds are also published:

- `v1/` preserves the current deployed/root contract for compatibility.
- `v2/` is the new one-source daily content contract used by the next app build.

`v2` raw URL:

- `https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/v2/quotes.json`
- `https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/v2/daily-quotes.json`
- `https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/v2/challenge.json`

The app pins to the `v2` content API contract path and checks both `contractVersion` and schema `version` before accepting a feed. Quote, image, and wording changes can continue inside the same contract. If the feed structure changes again, create the next contract folder, such as `v3`, and update the app's `CONTENT_API_CONTRACT_VERSION` in the same release.

See `CONTENT_API_CONTRACT.md` for the compatibility rule and structural-change checklist.

## File Structure

- `APPPLAN.md` current progress, version, and next-step plan for this content feed
- `CONTENT_API_CONTRACT.md` compatibility contract and version-folder rules
- `templates/quotes.md` human-editable source for the extra-quote feed
- `templates/daily-quotes.md` human-editable source for the first 40 daily journey days
- `templates/challenges.md` human-editable source for alternate 2-minute challenges
- `v1/` static compatibility copy of the current deployed/root contract
- `v2/` generated contract-pinned copies consumed by the next app build
- root JSON files are legacy compatibility feeds for devices still pointed at unversioned URLs; remove them only after deployed apps no longer need them
- `quotes.schema.json` shape reference for `quotes.json`
- `daily-quotes.schema.json` shape reference for `daily-quotes.json`
- `challenge.schema.json` shape reference for `challenge.json`
- `assets/daily-images/` artwork images served to the app by GitHub Raw URL
- `scripts/generate-content-json.mjs` Markdown template to JSON conversion script
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
  - `focus`
  - `title`
  - `challenge`
  - `prompt`
- the generator derives `slug` from `title` and `artworkKey` from `day`
- include one or more categories the app can use for that day
- use `scripture` for Bible or sacred-text entries when needed
- prefer quotes that also exist in `quotes.json` so daily selections stay backed by the curated quote library
- optionally include `supplemental` when the app should show a `Go Deeper` card for that day

The authored challenge for each day lives in `daily-quotes.json`. Keep that challenge beside the day title, prompt, artwork, and quote so each daily journey day has one source of truth.

Every alternate challenge in `challenge.json` should:

- include a stable `id`
- include one short `challenge` that can stand alone as a 2-minute action
- use one or more approved categories for matching against the current daily quote/theme
- be marked `approved: true` and `active: true` before the app can use it

Artwork images are served separately. See [Daily Artwork Images](#daily-artwork-images) below.

When `supplemental` is present:

- `url` is required
- `type` should be one of `youtube`, `podcast`, `article`, `resource`, `audio`, or `video`
- `imageUrl` should be a direct raw asset URL when you want a preview image
- podcast and general resource links open externally in the app
- YouTube links can play inline in the app

The first six entries in `templates/daily-quotes.md` intentionally demonstrate every supported supplemental type:

- Day 1: `youtube`
- Day 2: `podcast`
- Day 3: `article`
- Day 4: `resource`
- Day 5: `audio`
- Day 6: `video`

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

Place artwork files in `assets/daily-images/` named to match the generated `artworkKey` for each day.

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

The app downloads and caches each image on first load. Subsequent loads are served from device storage. To force the app to re-fetch an image, replace the image while keeping the generated day filename, then regenerate the content JSON.

### Image URL format

```
https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/assets/daily-images/day-01.webp
```

### Workflow for adding a new image

1. Add the image to `assets/daily-images/` with the correct filename.
2. Run `npm run content:generate` to rebuild `daily-quotes.json`.
3. Commit and push both the image and the updated `daily-quotes.json`.
4. The app picks up the new URL on next launch - no app release needed.

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

1. Add or update extra quotes in `templates/quotes.md`
2. Add or update daily journey entries in `templates/daily-quotes.md`
3. Keep `ID` values stable in `templates/quotes.md`
4. Keep each `Day` number stable in `templates/daily-quotes.md`
5. Make sure `Approved` is `yes` only for extra quotes you want live
6. Set `Active` to `no` to retire an extra quote without deleting history
7. For `Go Deeper` content in `templates/daily-quotes.md`, fill the supplemental fields. Leave `Supplemental URL` empty when there is no supplemental material.
8. Run `npm run content:generate` to update the generated JSON files
9. Add a note to `CHANGELOG.md`
10. Commit and push

To regenerate Markdown templates from the current JSON files, run:

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

- Package version: `2.1.0`
- Generated feed version: `2`

## Notes

- The app caches this content locally after fetching it.
- The Markdown files in `templates/` are now the preferred editor surface; the app should read only the generated JSON files.
- The app still has local fallback content, so missing or partial feed entries will not break the experience.
- After the next beta app install confirms tester devices are reading `/v2/`, delete the non-versioned root JSON feeds: `daily-quotes.json`, `daily-challenge.json`, `quotes.json`, and `challenge.json`.
- If you rename this repository to something like `Free Will Reclamation App API`, update the raw GitHub URLs in the app code.
