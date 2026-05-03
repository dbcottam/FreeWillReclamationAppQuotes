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

- `quotes.json` approved extra-quote feed used when the user asks for another quote
- `daily-quotes.json` remote daily journey feed for the first 40 days
- `quotes.schema.json` shape reference for `quotes.json`
- `daily-quotes.schema.json` shape reference for `daily-quotes.json`
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

1. Add or update entries in `quotes.json`
2. Add or update daily journey entries in `daily-quotes.json`
3. Keep `id` values stable
4. Keep each `day` number stable in `daily-quotes.json`
5. Make sure `approved` is `true` only for extra quotes you want live
6. Set `active` to `false` to retire an extra quote without deleting history
7. Add a note to `CHANGELOG.md`
8. Commit and push

## Notes

- The app caches this content locally after fetching it.
- `daily-quotes.json` is now the preferred editor surface for the first 40 days.
- The app still has local fallback content, so missing or partial feed entries will not break the experience.
- If you rename this repository to something like `Free Will Reclamation App API`, update the raw GitHub URLs in the app code.
