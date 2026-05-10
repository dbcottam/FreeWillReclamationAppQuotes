# Changelog

All notable quote feed changes should be listed here.

## 2026-05-10

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
