# Changelog

All notable quote feed changes should be listed here.

## 2026-05-19

- Expanded the v2 category vocabulary with `gratitude`, `joy`, `intuition`, `boundaries`, `embodiment`, `surrender`, `freedom`, `discernment`, `forgiveness`, `agency`, `compassion`, and `abundance`
- Recategorized the 40 daily journey entries to use the expanded category vocabulary and replaced one weakly sourced daily quote with a verifiable Pascal entry
- Added 55 sourced quote-library entries from Scripture, sacred texts, Stoic and Transcendentalist sources, Frederick Douglass, Booker T. Washington, Theodore Roosevelt, Nikola Tesla, Thomas Edison, Martin Luther King Jr., Mother Teresa, David R. Hawkins, and other reputable thinkers
- Removed 46 weakly sourced quote sections backed by aggregator, attributed, or unverifiable source pages
- Replaced weak or bot-blocked source URLs with reachable primary/canonical sources, including Wikisource KJV, Project Gutenberg, Folger Shakespeare, USCCB, and official Dalai Lama/Stanford sources
- Expanded the alternate challenge library from 100 to 180 non-duplicate actions aligned to the expanded categories
- Regenerated the `v2/` feeds and verified there are no duplicate quote or challenge texts

## 2026-05-10

- Bumped the content pipeline package to `2.2.0` while keeping the unreleased generated feed contract at `v2`
- Removed editable quote and challenge `ID`, `Approved`, and `Active` template fields
- Updated quote and challenge generation to assign deterministic ids from entry order
- Removed `approved` and `active` item fields from the generated quote and challenge feeds
- Renamed quote and challenge root category metadata from `approvedCategories` to `allowedCategories`
- Bumped the content pipeline package to `2.1.0` for the contract-pinned feed cleanup
- Made generated artwork URL discovery deterministic and covered stable `lastUpdated` behavior in tests
- Added contract-pinned `v2/` endpoint output for the new one-source daily content API
- Added a `v1/` compatibility copy while leaving root feeds available for current deployed/test devices
- Removed the separate daily challenge endpoint from the `v2` contract so authored daily challenges live only in `v2/daily-quotes.json`
- Documented the next-beta cleanup step to delete non-versioned root feeds once tester devices are confirmed on `/v2/`
- Added `CONTENT_API_CONTRACT.md` to make structural-change versioning rules explicit
- Replaced CSV source files with human-friendly Markdown templates in `templates/`
- Updated the content generator to read templates directly and still produce the same app-facing JSON endpoints
- Added JSON to Markdown template export for recovery and template regeneration

## 2026-05-07

- Added 44 sourced quote-library entries from the requested Hawkins, Bible, Mother Teresa, Louise Hay, Karol Truman, Gandhi, Frankl, Jung, Tolle, Stoic, Taoist, and American founder quote set, with corrected Bible references and verified substitutions where exact attribution was not reliable
- Reworked all 40 daily journey entries to follow the 10-week Abundance Unplugged arc, with four app days per course week
- Rebalanced daily quotes so the journey includes Scripture alongside non-Christian and broadly spiritual voices
- Expanded `quotes.csv` and generated `quotes.json` to 400 approved active quotes, with 298 non-Scripture quotes and 102 KJV Scripture references
- Added non-Biblical sacred-text quotes from the Dhammapada, Tao Te Ching, Bhagavad Gita, Qur'an, and Katha Upanishad to the daily journey and quote library
- Added broader classical and literary quotes from Homer, Virgil, Dante, Milton, Shakespeare, Mark Twain, Stoic writers, Jane Austen, Charlotte Bronte, Emerson, Thoreau, and Frederick Douglass
- Upgraded daily quote selections for intuition and whole-self integration with stronger Shakespeare source texts
- Expanded the general quote pool with inventor and innovator quotes from Nikola Tesla, Alexander Graham Bell, Thomas Edison, Ada Lovelace, Grace Hopper, George Washington Carver, Buckminster Fuller, Leonardo da Vinci, the Wright brothers, Alan Kay, Tim Berners-Lee, and Steve Jobs
- Expanded the general quote pool with global wisdom and spiritual-leader quotes from Martin Luther King Jr., Mother Teresa, Desmond Tutu, Pope Francis, Thich Nhat Hanh, the Dalai Lama, Howard Thurman, Mahatma Gandhi, Nelson Mandela, Rumi, Julian of Norwich, Thomas Merton, Henri Nouwen, Pema Chodron, bell hooks, Maya Angelou, Wangari Maathai, Malala Yousafzai, William Sloane Coffin, and Oscar Romero
- Aligned `quotes.json` approved categories with the daily journey category set by adding `scripture` to the quote library vocabulary and tagging sacred-text quotes accordingly
- Pruned 95 weaker quote-library entries that were duplicative, generic, weakly sourced, narrowly technical, or less aligned with the Abundance Unplugged transformation arc
- Re-selected all 40 daily journey quotes from the curated quote library so each day is backed by `quotes.json` and better aligned with the Abundance Unplugged progression

## 2026-05-06

- Added `Go Deeper` supplemental fields to the `daily-quotes` content pipeline
- Updated the daily journey schema and README to document the nested `supplemental` JSON object used by the app
- Extended `daily-quotes.csv` with flattened supplemental columns for podcast, YouTube, article, and resource metadata

## 2026-05-04

- Added CSV source files for the daily journey and general quote feeds
- Added a no-dependency CSV to JSON generator for app endpoint updates
- Added JSON to CSV export commands for recovery and human editing
- Added Node test coverage for generation, export, and duplicate-id validation
- Added `APPPLAN.md` with progress, version, and next steps
- Bumped the content pipeline package to `2.0.0` and generated feed version to `2`
- Removed stale `daily-journey.*` migration artifacts in favor of `daily-quotes.*`

## 2026-05-03

- Added starter `quotes.json` feed
- Added `quotes.schema.json`
- Seeded 8 approved sourced quotes from the app's curated quote set
- Expanded `daily-quotes.json` into a full daily journey feed with title, focus, challenge, prompt, and celebration fields
- Added `daily-quotes.schema.json`
- Updated repository documentation to reflect the remote daily journey model
