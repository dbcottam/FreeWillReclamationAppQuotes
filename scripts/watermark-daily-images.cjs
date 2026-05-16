const fs = require('fs/promises');
const crypto = require('crypto');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.join(__dirname, '..');
const defaultInputDir = path.join(rootDir, 'assets', 'daily-images');
const defaultOutputDir = path.join(rootDir, 'assets', 'daily-images-watermarked');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const defaultWatermarkText = `${String.fromCharCode(169)} Celeste Fife`;
const manifestFileName = '.watermark-manifest.json';
const watermarkId = 'celeste-fife-copyright-v1';

function parseArgs(argv) {
  const options = {
    inputDir: defaultInputDir,
    outputDir: defaultOutputDir,
    text: defaultWatermarkText,
    overwrite: false,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--input' && nextValue) {
      options.inputDir = path.resolve(rootDir, nextValue);
      index += 1;
    } else if (arg === '--output' && nextValue) {
      options.outputDir = path.resolve(rootDir, nextValue);
      index += 1;
    } else if (arg === '--text' && nextValue) {
      options.text = nextValue;
      index += 1;
    } else if (arg === '--overwrite') {
      options.overwrite = true;
    } else if (arg === '--force') {
      options.force = true;
    } else {
      throw new Error(`Unknown or incomplete option: ${arg}`);
    }
  }

  if (options.overwrite) {
    options.outputDir = options.inputDir;
  }

  return options;
}

function printHelp() {
  console.log(`
Add a bottom-right copyright watermark to daily artwork images.

Usage:
  npm run watermark:daily-images
  npm run watermark:daily-images -- --input assets/daily-images --output assets/daily-images-watermarked
  npm run watermark:daily-images -- --input assets/daily-images --overwrite

Options:
  --input <dir>    Source image folder. Default: assets/daily-images
  --output <dir>   Output folder. Default: assets/daily-images-watermarked
  --text <text>    Watermark text. Default: ${defaultWatermarkText}
  --overwrite      Replace images in the input folder. Originals are safer in a separate output folder.
  --force          Re-watermark even when an existing watermark output or manifest entry is found.
`);
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listImageFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listImageFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath);
    }
  }

  return files;
}

async function readManifest(manifestPath) {
  try {
    const manifestSource = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(manifestSource);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function writeManifest(manifestPath, manifest) {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function getFileHash(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildWatermarkSvg({ width, height, text }) {
  const minSide = Math.min(width, height);
  const fontSize = Math.round(Math.min(44, Math.max(18, minSide * 0.034)));
  const margin = Math.round(Math.min(48, Math.max(16, minSide * 0.035)));
  const shadowOffset = Math.max(1, Math.round(fontSize * 0.08));
  const y = height - margin;
  const x = width - margin;

  return Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .mark {
      font-family: Arial, Helvetica, sans-serif;
      font-size: ${fontSize}px;
      font-weight: 700;
      letter-spacing: 0;
    }
  </style>
  <text class="mark" x="${x + shadowOffset}" y="${y + shadowOffset}" text-anchor="end" fill="#000000" fill-opacity="0.72">${escapeXml(text)}</text>
  <text class="mark" x="${x}" y="${y}" text-anchor="end" fill="#FFFFFF" fill-opacity="0.92">${escapeXml(text)}</text>
</svg>`);
}

async function watermarkImage(inputPath, outputPath, text) {
  const image = sharp(inputPath, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read image dimensions: ${inputPath}`);
  }

  const watermarkSvg = buildWatermarkSvg({
    width: metadata.width,
    height: metadata.height,
    text,
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  if (inputPath === outputPath) {
    const tempPath = `${outputPath}.watermarking-tmp`;
    await image.composite([{ input: watermarkSvg, top: 0, left: 0 }]).toFile(tempPath);
    await fs.rename(tempPath, outputPath);
    return;
  }

  await image.composite([{ input: watermarkSvg, top: 0, left: 0 }]).toFile(outputPath);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (!(await pathExists(options.inputDir))) {
    throw new Error(`Input folder not found: ${path.relative(rootDir, options.inputDir)}`);
  }

  const files = await listImageFiles(options.inputDir);

  if (files.length === 0) {
    throw new Error(`No image files found in: ${path.relative(rootDir, options.inputDir)}`);
  }

  const manifestPath = path.join(options.outputDir, manifestFileName);
  const manifest = await readManifest(manifestPath);
  let watermarkedCount = 0;
  let skippedCount = 0;

  for (const inputPath of files) {
    const relativePath = path.relative(options.inputDir, inputPath);
    const outputPath = path.join(options.outputDir, relativePath);
    const sourceHash = await getFileHash(inputPath);
    const manifestEntry = manifest[relativePath];
    const existingOutput = await pathExists(outputPath);
    const manifestMatchesSource =
      manifestEntry?.watermarkId === watermarkId &&
      manifestEntry?.text === options.text &&
      manifestEntry?.sourceHash === sourceHash &&
      existingOutput;
    const manifestMatchesOverwrittenFile =
      options.overwrite &&
      manifestEntry?.watermarkId === watermarkId &&
      manifestEntry?.text === options.text &&
      manifestEntry?.outputHash === sourceHash;

    if (!options.force && manifestMatchesOverwrittenFile) {
      console.log(`Skipped ${relativePath}: watermark already recorded on this file.`);
      skippedCount += 1;
      continue;
    }

    if (!options.force && !options.overwrite && manifestMatchesSource) {
      console.log(`Skipped ${relativePath}: current source already has a watermarked output.`);
      skippedCount += 1;
      continue;
    }

    if (!options.force && !options.overwrite && existingOutput && !manifestMatchesSource) {
      console.log(`Skipped ${relativePath}: output already exists. Use --force to replace it.`);
      skippedCount += 1;
      continue;
    }

    await watermarkImage(inputPath, outputPath, options.text);
    const outputHash = await getFileHash(outputPath);
    manifest[relativePath] = {
      watermarkId,
      text: options.text,
      sourceHash,
      outputHash,
      updatedAt: new Date().toISOString(),
    };
    console.log(`Watermarked ${relativePath}`);
    watermarkedCount += 1;
  }

  await writeManifest(manifestPath, manifest);

  console.log(
    `Done. ${watermarkedCount} watermarked, ${skippedCount} skipped. Output folder: ${path.relative(
      rootDir,
      options.outputDir
    )}.`
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
