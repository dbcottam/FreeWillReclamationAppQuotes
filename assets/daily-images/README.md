# Daily Source Images

Place source artwork images here named to match the generated `artworkKey` for each day, such as `day-01.webp`.

Run `npm run watermark:daily-images` before generating content. App-facing `artworkUrl` values are built from `assets/daily-images-watermarked/`, not from this source folder.

## Naming convention

```
day-01.webp
day-02.webp
day-03.webp
...
day-40.webp
```

## How it works

When `npm run watermark:daily-images` runs, the watermark script scans this folder.
When `npm run content:generate` runs, the build script scans `assets/daily-images-watermarked/`.
For each image found, it constructs a GitHub raw URL and injects it as `artworkUrl`
into the matching day entry in `daily-quotes.json`.

The app downloads and caches the watermarked image on first load. If no watermarked image is present for a day,
the app falls back to generated geometric artwork.

## URL format

```
https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/assets/daily-images-watermarked/day-01.webp
```

## Supported formats

WebP is recommended. PNG and JPG are also supported.
