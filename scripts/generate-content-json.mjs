import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const contentVersion = 2;
let contentRoot = process.env.CONTENT_ROOT ?? ".";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/assets/daily-images/";

const categories = [
  "scripture",
  "courage",
  "encouragement",
  "healing",
  "hope",
  "identity",
  "peace",
  "perseverance",
  "purpose",
  "wisdom",
];

const feeds = {
  "daily-quotes": {
    label: "daily quotes",
    csvPath: "daily-quotes.csv",
    jsonPath: "daily-quotes.json",
    columns: [
      "day",
      "slug",
      "focus",
      "title",
      "artworkKey",
      "challenge",
      "prompt",
      "celebrationPrompt",
      "quote",
      "author",
      "source",
      "sourceUrl",
      "categories",
      "supplementalType",
      "supplementalTitle",
      "supplementalDescription",
      "supplementalUrl",
      "supplementalImageUrl",
      "supplementalDurationLabel",
    ],
    allowedCategories: categories,
    uniqueField: "day",
    injectArtworkUrl: true,
    rowFromCsv(row, index) {
      const day = parseInteger(row.day, `daily-quotes row ${index}: day`);
      const supplemental = buildSupplementalFromCsvRow(row);

      return compactObject({
        day,
        slug: row.slug,
        focus: row.focus,
        title: row.title,
        artworkKey: row.artworkKey,
        challenge: row.challenge,
        prompt: row.prompt,
        celebrationPrompt: row.celebrationPrompt,
        quote: row.quote,
        author: row.author,
        source: row.source,
        sourceUrl: row.sourceUrl,
        categories: parseCategories(row.categories, this.allowedCategories, `daily-quotes row ${index}`),
        supplemental,
      });
    },
  },
  quotes: {
    label: "quote library",
    csvPath: "quotes.csv",
    jsonPath: "quotes.json",
    columns: ["id", "quote", "author", "source", "sourceUrl", "categories", "approved", "active"],
    allowedCategories: categories,
    uniqueField: "id",
    rowFromCsv(row, index) {
      return {
        id: row.id,
        quote: row.quote,
        author: row.author,
        source: row.source,
        sourceUrl: row.sourceUrl,
        categories: parseCategories(row.categories, this.allowedCategories, `quotes row ${index}`),
        approved: parseBoolean(row.approved, `quotes row ${index}: approved`),
        active: parseBoolean(row.active, `quotes row ${index}: active`),
      };
    },
    extraRootFields() {
      return { approvedCategories: categories };
    },
  },
};

export async function main(args = process.argv.slice(2), options = {}) {
  contentRoot = options.contentRoot ?? process.env.CONTENT_ROOT ?? ".";

  const mode = args.includes("export") || args.includes("json-to-csv") ? "export" : "generate";
  const requestedFeeds = args.filter((arg) => !["export", "json-to-csv", "generate", "csv-to-json"].includes(arg));
  const selectedFeeds = requestedFeeds.length === 0 || requestedFeeds.includes("all")
    ? Object.keys(feeds)
    : requestedFeeds.map(normalizeFeedName);

  for (const feedName of selectedFeeds) {
    const feed = feeds[feedName];

    if (!feed) {
      fail(`Unknown feed "${feedName}". Expected one of: ${Object.keys(feeds).join(", ")}`);
    }

    if (mode === "export") {
      await exportCsv(feed);
    } else {
      await generateJson(feed);
    }
  }
}

async function buildArtworkUrlMap(root) {
  const assetsDir = join(root, "assets", "daily-images");

  try {
    const files = await readdir(assetsDir);
    const map = {};

    for (const file of files) {
      if (/\.(webp|png|jpg|jpeg)$/i.test(file)) {
        const key = file.replace(/\.[^.]+$/, "");
        map[key] = GITHUB_RAW_BASE + file;
      }
    }

    return map;
  } catch {
    return {};
  }
}

async function generateJson(feed) {
  const csvPath = existingPath(feed.csvPath);
  const rows = parseCsv(await readFile(csvPath, "utf8"));

  validateColumns(rows.headers, feed.columns, csvPath);

  const artworkUrlMap = feed.injectArtworkUrl ? await buildArtworkUrlMap(contentRoot) : {};
  const quotes = rows.records.map((row, index) => {
    const entry = feed.rowFromCsv(row, index + 2);
    const artworkUrl = artworkUrlMap[entry.artworkKey];
    return artworkUrl ? { ...entry, artworkUrl } : entry;
  });
  validateRequiredFields(quotes, feed.columns.filter((column) => column !== "categories"), feed.label);
  validateUnique(quotes, feed.uniqueField, feed.label);

  const root = {
    version: contentVersion,
    lastUpdated: new Date().toISOString(),
    ...(feed.extraRootFields ? feed.extraRootFields() : {}),
    quotes,
  };
  const existingRoot = await readJsonIfPresent(feed.jsonPath);

  if (existingRoot && sameContent(existingRoot, root)) {
    root.lastUpdated = existingRoot.lastUpdated;
  }

  await writeJson(feed.jsonPath, root);
  console.log(`Generated ${feed.jsonPath} from ${csvPath}`);
}

async function exportCsv(feed) {
  const jsonPath = existingPath(feed.jsonPath);
  const data = JSON.parse(await readFile(jsonPath, "utf8"));

  if (!Array.isArray(data.quotes)) {
    fail(`${jsonPath} must include a quotes array.`);
  }

  const lines = [
    feed.columns.join(","),
    ...data.quotes.map((quote) =>
      feed.columns.map((column) => serializeCsvCell(toCsvValue(getFeedColumnValue(quote, column)))).join(",")
    ),
  ];

  const csvPath = resolveContentPath(feed.csvPath);

  await mkdir(dirname(csvPath), { recursive: true });
  await writeFile(csvPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Generated ${feed.csvPath} from ${jsonPath}`);
}

function normalizeFeedName(name) {
  if (name === "daily" || name === "daily-journey") {
    return "daily-quotes";
  }

  return name;
}

function existingPath(primaryPath) {
  const resolvedPath = resolveContentPath(primaryPath);

  if (existsSync(resolvedPath)) {
    return resolvedPath;
  }

  fail(`Missing ${primaryPath}.`);
}

function parseCsv(input) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (quoted) {
    fail("CSV contains an unclosed quoted field.");
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...records] = rows.filter((csvRow) => csvRow.some((value) => value.trim() !== ""));

  if (!headers) {
    fail("CSV is empty.");
  }

  return {
    headers,
    records: records.map((csvRow, rowIndex) => {
      if (csvRow.length !== headers.length) {
        fail(`CSV row ${rowIndex + 2} has ${csvRow.length} columns; expected ${headers.length}.`);
      }

      return Object.fromEntries(headers.map((header, index) => [header, csvRow[index]]));
    }),
  };
}

function validateColumns(actual, expected, csvPath) {
  const missing = expected.filter((column) => !actual.includes(column));
  const unexpected = actual.filter((column) => !expected.includes(column));

  if (missing.length > 0 || unexpected.length > 0) {
    fail(`${csvPath} columns are invalid. Missing: ${missing.join(", ") || "none"}. Unexpected: ${unexpected.join(", ") || "none"}.`);
  }
}

function validateRequiredFields(rows, fields, label) {
  for (const [index, row] of rows.entries()) {
    for (const field of fields) {
      if (row[field] === "") {
        fail(`${label} row ${index + 2}: ${field} is required.`);
      }
    }
  }
}

function validateUnique(rows, field, label) {
  const seen = new Set();

  for (const row of rows) {
    if (seen.has(row[field])) {
      fail(`${label} contains a duplicate ${field}: ${row[field]}`);
    }

    seen.add(row[field]);
  }
}

function parseInteger(value, label) {
  if (!/^[1-9]\d*$/.test(value)) {
    fail(`${label} must be a positive integer.`);
  }

  return Number(value);
}

function parseBoolean(value, label) {
  const normalized = value.toLowerCase();

  if (normalized !== "true" && normalized !== "false") {
    fail(`${label} must be true or false.`);
  }

  return normalized === "true";
}

function parseCategories(value, allowedCategories, label) {
  const parsed = value.split("|").map((category) => category.trim()).filter(Boolean);

  if (parsed.length === 0) {
    fail(`${label}: categories must include at least one value.`);
  }

  for (const category of parsed) {
    if (!allowedCategories.includes(category)) {
      fail(`${label}: category "${category}" is not allowed.`);
    }
  }

  return parsed;
}

function toCsvValue(value) {
  if (Array.isArray(value)) {
    return value.join("|");
  }

  return value ?? "";
}

function getFeedColumnValue(quote, column) {
  if (!column.startsWith("supplemental")) {
    return quote[column];
  }

  const supplemental = quote.supplemental ?? {};

  switch (column) {
    case "supplementalType":
      return supplemental.type;
    case "supplementalTitle":
      return supplemental.title;
    case "supplementalDescription":
      return supplemental.description;
    case "supplementalUrl":
      return supplemental.url;
    case "supplementalImageUrl":
      return supplemental.imageUrl;
    case "supplementalDurationLabel":
      return supplemental.durationLabel;
    default:
      return "";
  }
}

function buildSupplementalFromCsvRow(row) {
  const supplementalUrl = row.supplementalUrl?.trim() ?? "";

  if (!supplementalUrl) {
    return undefined;
  }

  return compactObject({
    type: row.supplementalType,
    title: row.supplementalTitle,
    description: row.supplementalDescription,
    url: supplementalUrl,
    imageUrl: row.supplementalImageUrl,
    durationLabel: row.supplementalDurationLabel,
  });
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== "")
  );
}

function serializeCsvCell(value) {
  const stringValue = String(value);

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

async function writeJson(path, data) {
  const resolvedPath = resolveContentPath(path);
  const nextContent = `${JSON.stringify(data, null, 2)}\n`;

  if (existsSync(resolvedPath)) {
    const previousContent = await readFile(resolvedPath, "utf8");

    if (previousContent === nextContent) {
      return;
    }
  }

  await mkdir(dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, nextContent, "utf8");
}

function resolveContentPath(path) {
  return join(contentRoot, path);
}

async function readJsonIfPresent(path) {
  const resolvedPath = resolveContentPath(path);

  if (!existsSync(resolvedPath)) {
    return null;
  }

  return JSON.parse(await readFile(resolvedPath, "utf8"));
}

function sameContent(previous, next) {
  return JSON.stringify(withoutLastUpdated(previous)) === JSON.stringify(withoutLastUpdated(next));
}

function withoutLastUpdated(value) {
  const { lastUpdated, ...rest } = value;

  return rest;
}

function fail(message) {
  throw new Error(message);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
