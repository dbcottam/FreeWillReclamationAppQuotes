# Free Will Reclamation App Quotes

This repository is the remote approved quote feed for the Free Will Reclamation App.

The app can fetch this content from GitHub Raw so extra quotes stay curated, lightweight, and easy to update without shipping a new app build.

## Primary Feed

The app should read:

- `quotes.json`

Raw URL:

- `https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/quotes.json`

If your default branch changes from `main`, update the URL in the app.

## File Structure

- `quotes.json` live quote feed used by the app
- `quotes.schema.json` shape reference for editing and validation
- `CHANGELOG.md` release notes for quote feed changes

## Quote Rules

Every quote should:

- be verifiable
- include a human-readable source
- include a human-readable source URL
- use only approved categories
- be marked `approved: true` before the app can use it
- keep a stable `id` forever once published

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

## Editing Workflow

1. Add or update entries in `quotes.json`
2. Keep `id` values stable
3. Make sure `approved` is `true` only for quotes you want live
4. Set `active` to `false` to retire a quote without deleting history
5. Add a note to `CHANGELOG.md`
6. Commit and push

## Notes

- The app should cache this feed locally after fetching it.
- This repo is a better long-term source than bundling an ever-growing quote library in the app itself.
