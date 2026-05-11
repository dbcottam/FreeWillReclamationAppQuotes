# Daily Images

Place artwork images here named to match the generated `artworkKey` for each day, such as `day-01.webp`.

## Naming convention

```
day-01.webp
day-02.webp
day-03.webp
...
day-40.webp
```

## How it works

When `npm run content:generate` runs, the build script scans this folder.
For each image found, it constructs a GitHub raw URL and injects it as `artworkUrl`
into the matching day entry in `daily-quotes.json`.

The app downloads and caches the image on first load. If no image is present for a day,
the app falls back to generated geometric artwork.

## URL format

```
https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/assets/daily-images/day-01.webp
```

## Supported formats

WebP is recommended. PNG and JPG are also supported.
