# Free Will Reclamation App Quotes

This repository is the remote approved quote feed for the Free Will Reclamation App.

The app can fetch this content from GitHub Raw so extra quotes stay curated, lightweight, and easy to update without shipping a new app build.

## Primary Feed

The app should read:

- `quotes.json`
- `daily-quotes.json`

Raw URL:

- `https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/quotes.json`
- `https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/daily-quotes.json`

If your default branch changes from `main`, update the URL in the app.

## File Structure

- `quotes.json` live quote feed used by the app
- `daily-quotes.json` daily quote feed used by the app
- `quotes.schema.json` shape reference for editing and validation
- `CHANGELOG.md` release notes for quote feed changes

## Quote Rules

Every quote in `quotes.json` should:

- be verifiable
- include a human-readable source
- include a human-readable source URL
- use only approved categories
- be marked `approved: true` before the app can use it
- keep a stable `id` forever once published

Every daily quote in `daily-quotes.json` should:

- include a stable `day` number
- include quote text, author, source, and source URL
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

## Example Daily Entry

```json
{
  "day": 1,
  "quote": "Quote text",
  "author": "Author",
  "source": "Source citation",
  "sourceUrl": "https://link-to-source",
  "categories": ["scripture", "hope"]
}
```

## Editing Workflow

1. Add or update entries in `quotes.json`
2. Add or update daily quote entries in `daily-quotes.json`
3. Keep `id` values stable
4. Make sure `approved` is `true` only for quotes you want live
5. Set `active` to `false` to retire a quote without deleting history
6. Add a note to `CHANGELOG.md`
7. Commit and push

## Notes

- The app should cache this feed locally after fetching it.
- This repo is a better long-term source than bundling an ever-growing quote library in the app itself.
