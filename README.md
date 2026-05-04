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
  - `celebrationPrompt`
- include one or more categories the app can use for that day
- use `scripture` for Bible-based daily entries when needed

## Approved Categories

- `courage`
- `encouragement`
- `healing`
- `hope`
- `identity`
- `peace`
- `perseverance`
- `purpose`
- `wisdom`

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
  "artworkKey": "day-01-sacred-geometry",
  "challenge": "Choose one thing today without pressure or guilt.",
  "prompt": "What did it feel like to make a choice that belonged to you?",
  "celebrationPrompt": "What are you celebrating about your ability to choose today?",
  "quote": "Quote text",
  "author": "Author",
  "source": "Source citation",
  "sourceUrl": "https://link-to-source",
  "categories": ["scripture", "hope"]
}
```

## Editing Workflow

1. Add or update extra quotes in `quotes.csv`
2. Add or update daily journey entries in `daily-quotes.csv`
3. Keep `id` values stable in `quotes.csv`
4. Keep each `day` number stable in `daily-quotes.csv`
5. Make sure `approved` is `true` only for extra quotes you want live
6. Set `active` to `false` to retire an extra quote without deleting history
7. Run `npm run content:generate` to update `quotes.json` and `daily-quotes.json`
8. Add a note to `CHANGELOG.md`
9. Commit and push

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
