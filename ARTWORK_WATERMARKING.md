# Artwork Watermarking

Use this workflow in the content API repo when adding Celeste Fife copyright text to daily artwork.

## Default

Source images live in:

```text
assets/daily-images
```

Run:

```powershell
npm run watermark:daily-images
```

The script writes watermarked copies to:

```text
assets/daily-images-watermarked
```

The default bottom-right watermark is:

```text
© Celeste Fife
```

The script records processed files in `.watermark-manifest.json` and skips images it has already watermarked, so running it again will not stack duplicate copyright text.

`npm run content:generate` builds `artworkUrl` values from `assets/daily-images-watermarked/`. Original source files in `assets/daily-images/` are not published as app image URLs.

## Replace Served Images

Use this only after backing up source artwork:

```powershell
npm run watermark:daily-images -- --input assets/daily-images --overwrite
```

## Rebuild Existing Output

```powershell
npm run watermark:daily-images -- --force
```

## Custom Text

```powershell
npm run watermark:daily-images -- --text "© Celeste Fife"
```
