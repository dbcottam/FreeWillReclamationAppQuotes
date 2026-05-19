import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { main } from "../scripts/generate-content-json.mjs";

const tests = [
  ["generates endpoint JSON from template feeds", testGenerate],
  ["exports templates from endpoint JSON feeds", testExport],
  ["does not write legacy root feeds by default", testDefaultSkipsLegacyRootFeeds],
  ["can deliberately write legacy root feeds", testDeliberateLegacyRootFeeds],
  ["preserves lastUpdated when generated content is unchanged", testStableLastUpdated],
  ["generates stable ids from entry order", testGeneratedIds],
];

for (const [name, test] of tests) {
  try {
    await test();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

async function testGenerate() {
  const contentRoot = await makeFixture();

  await main([], { contentRoot });

  const daily = JSON.parse(await readFile(join(contentRoot, "v2", "daily-quotes.json"), "utf8"));
  const quotes = JSON.parse(await readFile(join(contentRoot, "v2", "quotes.json"), "utf8"));
  const challenges = JSON.parse(await readFile(join(contentRoot, "v2", "challenge.json"), "utf8"));

  assert.equal(daily.version, 2);
  assert.equal(daily.contractVersion, "v2");
  assert.equal(daily.quotes[0].day, 1);
  assert.equal(daily.quotes[0].slug, "choice");
  assert.equal(daily.quotes[0].artworkKey, "day-01");
  assert.equal(
    daily.quotes[0].artworkUrl,
    "https://raw.githubusercontent.com/dbcottam/FreeWillReclamationAppQuotes/main/assets/daily-images-watermarked/day-01.webp",
  );
  assert.deepEqual(daily.quotes[0].categories, ["scripture", "hope"]);
  assert.equal(daily.quotes[0].challenge, "Choose something");
  assert.deepEqual(daily.quotes[0].supplemental, {
    type: "podcast",
    title: "Companion episode",
    description: "A short episode for today.",
    url: "https://podcasts.apple.com/us/podcast/example/id1234567890",
    imageUrl: "https://raw.githubusercontent.com/example/repo/main/images/day-01.jpg",
    durationLabel: "24 min",
  });
  assert.equal(quotes.version, 2);
  assert.deepEqual(quotes.allowedCategories, [
    "scripture",
    "courage",
    "encouragement",
    "healing",
    "hope",
    "identity",
    "peace",
    "compassion",
    "perseverance",
    "purpose",
    "wisdom",
    "gratitude",
    "joy",
    "intuition",
    "boundaries",
    "embodiment",
    "surrender",
    "freedom",
    "discernment",
    "forgiveness",
    "agency",
    "abundance",
  ]);
  assert.equal(quotes.allowedCategories.includes("wisdom"), true);
  assert.equal(quotes.quotes[0].id, "quote-001");
  assert.equal(quotes.quotes[0].approved, undefined);
  assert.equal(quotes.quotes[0].active, undefined);
  assert.equal(challenges.version, 2);
  assert.equal(challenges.challenges[0].id, "challenge-001");
  assert.deepEqual(challenges.challenges[0].categories, ["hope"]);
  assert.equal(challenges.challenges[0].approved, undefined);
  assert.equal(challenges.challenges[0].active, undefined);
}

async function testDefaultSkipsLegacyRootFeeds() {
  const contentRoot = await makeFixture();

  await main([], { contentRoot });

  await assert.rejects(
    () => readFile(join(contentRoot, "daily-quotes.json"), "utf8"),
    /ENOENT/,
  );
  await assert.rejects(
    () => readFile(join(contentRoot, "daily-challenge.json"), "utf8"),
    /ENOENT/,
  );
}

async function testDeliberateLegacyRootFeeds() {
  const contentRoot = await makeFixture();

  await main([], { contentRoot, writeLegacyRootFeeds: true });

  const daily = JSON.parse(await readFile(join(contentRoot, "daily-quotes.json"), "utf8"));
  const quotes = JSON.parse(await readFile(join(contentRoot, "quotes.json"), "utf8"));
  const challenges = JSON.parse(await readFile(join(contentRoot, "challenge.json"), "utf8"));

  assert.equal(daily.contractVersion, "v2");
  assert.equal(quotes.contractVersion, "v2");
  assert.equal(challenges.contractVersion, "v2");
  await assert.rejects(
    () => readFile(join(contentRoot, "daily-challenge.json"), "utf8"),
    /ENOENT/,
  );
}

async function testStableLastUpdated() {
  const contentRoot = await makeFixture();

  await main([], { contentRoot });
  const path = join(contentRoot, "v2", "daily-quotes.json");
  const first = JSON.parse(await readFile(path, "utf8"));

  await main([], { contentRoot });
  const second = JSON.parse(await readFile(path, "utf8"));

  assert.equal(second.lastUpdated, first.lastUpdated);
}

async function testExport() {
  const contentRoot = await makeFixture();

  await main([], { contentRoot });
  await main(["export"], { contentRoot });

  const dailyTemplate = await readFile(join(contentRoot, "templates", "daily-quotes.md"), "utf8");
  const quotesTemplate = await readFile(join(contentRoot, "templates", "quotes.md"), "utf8");
  const challengesTemplate = await readFile(join(contentRoot, "templates", "challenges.md"), "utf8");

  assert.match(dailyTemplate, /^# Daily Quotes/);
  assert.match(dailyTemplate, /single source of truth for each authored journey day/);
  assert.doesNotMatch(dailyTemplate, /^Day:/m);
  assert.doesNotMatch(dailyTemplate, /^Title:/m);
  assert.match(dailyTemplate, /Challenge:\nChoose something/);
  assert.doesNotMatch(dailyTemplate, /^Slug:/m);
  assert.doesNotMatch(dailyTemplate, /^Artwork:/m);
  assert.match(dailyTemplate, /Supplemental Type: podcast/);
  assert.match(dailyTemplate, /Supplemental Title: Companion episode/);
  assert.match(quotesTemplate, /^# Quote Library/);
  assert.doesNotMatch(quotesTemplate, /^ID:/m);
  assert.doesNotMatch(quotesTemplate, /^Approved:/m);
  assert.doesNotMatch(quotesTemplate, /^Active:/m);
  assert.match(quotesTemplate, /Quote:\nKeep going/);
  assert.match(challengesTemplate, /^# Challenge Library/);
  assert.doesNotMatch(challengesTemplate, /^ID:/m);
  assert.doesNotMatch(challengesTemplate, /^Approved:/m);
  assert.doesNotMatch(challengesTemplate, /^Active:/m);
}

async function testGeneratedIds() {
  const contentRoot = await makeFixture();

  await main([], { contentRoot });

  const quotes = JSON.parse(await readFile(join(contentRoot, "v2", "quotes.json"), "utf8"));
  const challenges = JSON.parse(await readFile(join(contentRoot, "v2", "challenge.json"), "utf8"));

  assert.deepEqual(quotes.quotes.map((quote) => quote.id), ["quote-001"]);
  assert.deepEqual(challenges.challenges.map((challenge) => challenge.id), ["challenge-001"]);
}

async function makeFixture() {
  const contentRoot = await mkdtemp(join(tmpdir(), "fwr-content-"));
  const templatesRoot = join(contentRoot, "templates");
  const watermarkedImagesRoot = join(contentRoot, "assets", "daily-images-watermarked");

  await mkdir(templatesRoot, { recursive: true });
  await mkdir(watermarkedImagesRoot, { recursive: true });
  await writeFile(join(watermarkedImagesRoot, "day-01.webp"), "watermarked fixture");

  await writeFile(
    join(templatesRoot, "daily-quotes.md"),
    [
      "# Daily Quotes",
      "",
      "## Day 1: Choice",
      "",
      "Focus: agency",
      "Categories: scripture, hope",
      "Challenge:",
      "Choose something",
      "",
      "Prompt:",
      "How did it feel?",
      "",
      "Quote:",
      "Daily quote",
      "",
      "Author: Bible",
      "Source: Psalm 1",
      "Source URL: https://example.com",
      "Supplemental Type: podcast",
      "Supplemental Title: Companion episode",
      "Supplemental Description:",
      "A short episode for today.",
      "",
      "Supplemental URL: https://podcasts.apple.com/us/podcast/example/id1234567890",
      "Supplemental Image URL: https://raw.githubusercontent.com/example/repo/main/images/day-01.jpg",
      "Supplemental Duration: 24 min",
      "",
    ].join("\n"),
    "utf8",
  );

  await writeFile(
    join(templatesRoot, "quotes.md"),
    [
      "# Quote Library",
      "",
      "## quote-1",
      "",
      "Author: Author",
      "Source: Source",
      "Source URL: https://example.com",
      "Categories: hope, wisdom",
      "Quote:",
      "Keep going",
      "",
    ].join("\n"),
    "utf8",
  );

  await writeFile(
    join(templatesRoot, "challenges.md"),
    [
      "# Challenge Library",
      "",
      "## challenge-1",
      "",
      "Categories: hope",
      "Challenge:",
      "Take one small step",
      "",
    ].join("\n"),
    "utf8",
  );

  return contentRoot;
}
