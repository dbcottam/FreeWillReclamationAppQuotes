import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const contentVersion = 2;
const contentContractVersion = "v2";
const versionedOutputDir = contentContractVersion;
let contentRoot = process.env.CONTENT_ROOT ?? ".";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/assets/daily-images/";
const SUPPORTED_ARTWORK_FILE_PATTERN = /\.(webp|png|jpg|jpeg)$/i;

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
    templatePath: "templates/daily-quotes.md",
    jsonPath: "daily-quotes.json",
    rootArrayName: "quotes",
    uniqueField: "day",
    templateNotes: [
      "This file is the single source of truth for each authored journey day, including the default daily challenge.",
      "Use `templates/challenges.md` only for alternate challenges shown when a user refreshes the challenge.",
    ],
    requiredFields: [
      "day",
      "slug",
      "focus",
      "title",
      "artworkKey",
      "challenge",
      "prompt",
      "quote",
      "author",
      "source",
      "sourceUrl",
    ],
    injectArtworkUrl: true,
    deriveFieldsFromHeading(heading, index) {
      const match = heading.match(/^Day\s+(\d+):\s+(.+)$/i);

      if (!match) {
        fail(`daily-quotes section ${index}: heading must use "## Day N: Title".`);
      }

      return {
        day: match[1],
        title: match[2].trim(),
      };
    },
    fields: [
      ["Focus", "focus"],
      ["Categories", "categories"],
      ["Challenge", "challenge"],
      ["Prompt", "prompt"],
      ["Quote", "quote"],
      ["Author", "author"],
      ["Source", "source"],
      ["Source URL", "sourceUrl"],
      ["Supplemental Type", "supplementalType"],
      ["Supplemental Title", "supplementalTitle"],
      ["Supplemental Description", "supplementalDescription"],
      ["Supplemental URL", "supplementalUrl"],
      ["Supplemental Image URL", "supplementalImageUrl"],
      ["Supplemental Duration", "supplementalDurationLabel"],
    ],
    entryFromTemplate(fields, index) {
      const supplemental = buildSupplementalFromTemplateFields(fields);
      const day = parseInteger(fields.day, `daily-quotes entry ${index}: Day`);

      return compactObject({
        day,
        slug: slugify(fields.title),
        focus: fields.focus,
        title: fields.title,
        artworkKey: artworkKeyForDay(day),
        challenge: fields.challenge,
        prompt: fields.prompt,
        quote: fields.quote,
        author: fields.author,
        source: fields.source,
        sourceUrl: fields.sourceUrl,
        categories: parseCategories(fields.categories, `daily-quotes entry ${index}`),
        supplemental,
      });
    },
  },
  quotes: {
    label: "quote library",
    templatePath: "templates/quotes.md",
    jsonPath: "quotes.json",
    rootArrayName: "quotes",
    uniqueField: "id",
    requiredFields: ["id", "quote", "author", "source", "sourceUrl"],
    fields: [
      ["Author", "author"],
      ["Source", "source"],
      ["Source URL", "sourceUrl"],
      ["Categories", "categories"],
      ["Quote", "quote"],
    ],
    entryFromTemplate(fields, index) {
      return {
        id: generatedId("quote", index),
        quote: fields.quote,
        author: fields.author,
        source: fields.source,
        sourceUrl: fields.sourceUrl,
        categories: parseCategories(fields.categories, `quotes entry ${index}`),
      };
    },
    extraRootFields() {
      return { allowedCategories: categories };
    },
  },
  challenges: {
    label: "challenge library",
    templatePath: "templates/challenges.md",
    jsonPath: "challenge.json",
    rootArrayName: "challenges",
    uniqueField: "id",
    requiredFields: ["id", "challenge"],
    fields: [
      ["Categories", "categories"],
      ["Challenge", "challenge"],
    ],
    entryFromTemplate(fields, index) {
      return {
        id: generatedId("challenge", index),
        challenge: fields.challenge,
        categories: parseCategories(fields.categories, `challenges entry ${index}`),
      };
    },
    extraRootFields() {
      return { allowedCategories: categories };
    },
  },
};

export async function main(args = process.argv.slice(2), options = {}) {
  contentRoot = options.contentRoot ?? process.env.CONTENT_ROOT ?? ".";

  const mode = args.includes("export") || args.includes("json-to-template") ? "export" : "generate";
  const ignoredArgs = ["export", "json-to-template", "generate", "template-to-json"];
  const requestedFeeds = args.filter((arg) => !ignoredArgs.includes(arg));
  const selectedFeeds = requestedFeeds.length === 0 || requestedFeeds.includes("all")
    ? Object.keys(feeds)
    : requestedFeeds.map(normalizeFeedName);

  for (const feedName of selectedFeeds) {
    const feed = feeds[feedName];

    if (!feed) {
      fail(`Unknown feed "${feedName}". Expected one of: ${Object.keys(feeds).join(", ")}`);
    }

    if (mode === "export") {
      await exportTemplate(feed);
    } else {
      await generateJson(feed, options);
    }
  }
}

async function buildArtworkUrlMap(root) {
  const assetsDir = join(root, "assets", "daily-images");

  try {
    const files = await readdir(assetsDir);
    const map = {};

    for (const file of files.sort()) {
      if (SUPPORTED_ARTWORK_FILE_PATTERN.test(file)) {
        const key = file.replace(/\.[^.]+$/, "");
        map[key] = GITHUB_RAW_BASE + file;
      }
    }

    return map;
  } catch {
    return {};
  }
}

async function generateJson(feed, options = {}) {
  const writeLegacyRootFeeds =
    options.writeLegacyRootFeeds ?? process.env.WRITE_LEGACY_ROOT_FEEDS === "1";
  const templatePath = existingPath(feed.templatePath);
  const sections = parseTemplate(await readFile(templatePath, "utf8"), feed);
  const artworkUrlMap = feed.injectArtworkUrl ? await buildArtworkUrlMap(contentRoot) : {};
  const entries = sections.map((fields, index) => {
    const entry = feed.entryFromTemplate(fields, index + 1);
    const artworkUrl = artworkUrlMap[entry.artworkKey];
    return artworkUrl ? { ...entry, artworkUrl } : entry;
  });

  validateRequiredFields(entries, feed.requiredFields, feed.label);
  validateUnique(entries, feed.uniqueField, feed.label);

  const root = {
    version: contentVersion,
    contractVersion: contentContractVersion,
    lastUpdated: new Date().toISOString(),
    ...(feed.extraRootFields ? feed.extraRootFields() : {}),
    [feed.rootArrayName]: entries,
  };
  const versionedJsonPath = getVersionedJsonPath(feed);
  const existingRoot = await readJsonIfPresent(versionedJsonPath);

  if (existingRoot && sameContent(existingRoot, root)) {
    root.lastUpdated = existingRoot.lastUpdated;
  }

  await writeJson(versionedJsonPath, root);
  if (writeLegacyRootFeeds) {
    await writeJson(feed.jsonPath, root);
  }
  console.log(
    `Generated ${versionedJsonPath}${writeLegacyRootFeeds ? ` and ${feed.jsonPath}` : ""} from ${feed.templatePath}`
  );
}

async function exportTemplate(feed) {
  const jsonPath = existingPath(getVersionedJsonPath(feed));
  const data = JSON.parse(await readFile(jsonPath, "utf8"));

  if (!Array.isArray(data[feed.rootArrayName])) {
    fail(`${jsonPath} must include a ${feed.rootArrayName} array.`);
  }

  const templatePath = resolveContentPath(feed.templatePath);
  await mkdir(dirname(templatePath), { recursive: true });
  await writeFile(templatePath, renderTemplate(feed, data[feed.rootArrayName]), "utf8");
  console.log(`Generated ${feed.templatePath} from ${jsonPath}`);
}

function renderTemplate(feed, entries) {
  const lines = [
    `# ${toTitleCase(feed.label)}`,
    "",
    "Edit the values below, then run `npm run content:generate` to rebuild the app JSON.",
    ...(feed.templateNotes ?? []),
    `Allowed categories: ${categories.join(", ")}.`,
    "",
  ];

  for (const entry of entries) {
    lines.push(`## ${headingForEntry(feed, entry)}`, "");

    for (const [label, key] of feed.fields) {
      const value = templateValue(entry, key);

      if (isMultilineField(key)) {
        lines.push(`${label}:`, value, "");
      } else {
        lines.push(value ? `${label}: ${value}` : `${label}:`, "");
      }
    }
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

function headingForEntry(feed, entry) {
  if (feed.rootArrayName === "quotes" && entry.day) {
    return `Day ${entry.day}: ${entry.title}`;
  }

  if (entry.day) {
    return `Day ${entry.day}`;
  }

  return entry.id;
}

function templateValue(entry, key) {
  if (key.startsWith("supplemental")) {
    const supplemental = entry.supplemental ?? {};

    switch (key) {
      case "supplementalType":
        return supplemental.type ?? "";
      case "supplementalTitle":
        return supplemental.title ?? "";
      case "supplementalDescription":
        return supplemental.description ?? "";
      case "supplementalUrl":
        return supplemental.url ?? "";
      case "supplementalImageUrl":
        return supplemental.imageUrl ?? "";
      case "supplementalDurationLabel":
        return supplemental.durationLabel ?? "";
      default:
        return "";
    }
  }

  if (key === "categories") {
    return (entry.categories ?? []).join(", ");
  }

  if (typeof entry[key] === "boolean") {
    return entry[key] ? "yes" : "no";
  }

  return entry[key] ?? "";
}

function isMultilineField(key) {
  return ["challenge", "prompt", "quote", "supplementalDescription"].includes(key);
}

function parseTemplate(input, feed) {
  const sections = splitMarkdownSections(input);

  if (sections.length === 0) {
    fail(`${feed.templatePath} must include at least one section beginning with ##.`);
  }

  return sections.map((section, index) => parseTemplateSection(section, feed, index + 1));
}

function splitMarkdownSections(input) {
  const matches = [...input.matchAll(/^##[ \t]+(.+)$/gm)];

  return matches.map((match, index) => {
    const bodyStart = match.index + match[0].length;
    const bodyEnd = matches[index + 1]?.index ?? input.length;

    return {
      heading: match[1].trim(),
      body: input.slice(bodyStart, bodyEnd).trim(),
    };
  });
}

function parseTemplateSection(section, feed, sectionNumber) {
  const labelToKey = new Map(feed.fields.map(([label, key]) => [normalizeLabel(label), key]));
  const fields = Object.fromEntries(feed.fields.map(([, key]) => [key, ""]));
  Object.assign(fields, feed.deriveFieldsFromHeading?.(section.heading, sectionNumber) ?? {});
  const body = section.body;
  const lines = body.split(/\r?\n/);
  let currentKey = null;
  let currentValue = [];

  function flush() {
    if (!currentKey) {
      return;
    }

    fields[currentKey] = currentValue.join("\n").trim();
    currentKey = null;
    currentValue = [];
  }

  for (const line of lines) {
    const labelMatch = line.match(/^([A-Za-z][A-Za-z0-9 ]+):[ \t]*(.*)$/);
    const key = labelMatch ? labelToKey.get(normalizeLabel(labelMatch[1])) : null;

    if (key) {
      flush();
      currentKey = key;
      currentValue = labelMatch[2] ? [labelMatch[2]] : [];
    } else if (currentKey) {
      currentValue.push(line);
    } else if (line.trim()) {
      fail(`${feed.templatePath} section ${sectionNumber}: unexpected text before a field label: ${line}`);
    }
  }

  flush();
  return fields;
}

function normalizeLabel(value) {
  return value.toLowerCase().replaceAll(/\s+/g, "");
}

function normalizeFeedName(name) {
  if (name === "daily" || name === "daily-journey") {
    return "daily-quotes";
  }

  return name;
}

function getVersionedJsonPath(feed) {
  return join(versionedOutputDir, feed.jsonPath);
}

function existingPath(primaryPath) {
  const resolvedPath = resolveContentPath(primaryPath);

  if (existsSync(resolvedPath)) {
    return resolvedPath;
  }

  fail(`Missing ${primaryPath}.`);
}

function validateRequiredFields(rows, fields, label) {
  for (const [index, row] of rows.entries()) {
    for (const field of fields) {
      if (row[field] === "" || row[field] === undefined) {
        fail(`${label} entry ${index + 1}: ${field} is required.`);
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
  if (!/^[1-9]\d*$/.test(value ?? "")) {
    fail(`${label} must be a positive integer.`);
  }

  return Number(value);
}

function parseCategories(value, label) {
  const parsed = (value ?? "")
    .split(/[|,]/)
    .map((category) => category.trim())
    .filter(Boolean);

  if (parsed.length === 0) {
    fail(`${label}: Categories must include at least one value.`);
  }

  for (const category of parsed) {
    if (!categories.includes(category)) {
      fail(`${label}: category "${category}" is not allowed.`);
    }
  }

  return parsed;
}

function slugify(value) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function artworkKeyForDay(day) {
  return `day-${String(day).padStart(2, "0")}`;
}

function generatedId(prefix, index) {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

function buildSupplementalFromTemplateFields(fields) {
  const supplementalUrl = fields.supplementalUrl?.trim() ?? "";

  if (!supplementalUrl) {
    return undefined;
  }

  return compactObject({
    type: fields.supplementalType,
    title: fields.supplementalTitle,
    description: fields.supplementalDescription,
    url: supplementalUrl,
    imageUrl: fields.supplementalImageUrl,
    durationLabel: fields.supplementalDurationLabel,
  });
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== "")
  );
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

function toTitleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
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
