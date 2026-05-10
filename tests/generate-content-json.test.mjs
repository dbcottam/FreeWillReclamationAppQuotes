import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { main } from "../scripts/generate-content-json.mjs";

const tests = [
  ["generates endpoint JSON from template feeds", testGenerate],
  ["exports templates from endpoint JSON feeds", testExport],
  ["rejects duplicate quote ids", testDuplicateIds],
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

  const daily = JSON.parse(await readFile(join(contentRoot, "daily-quotes.json"), "utf8"));
  const dailyChallenges = JSON.parse(await readFile(join(contentRoot, "daily-challenge.json"), "utf8"));
  const quotes = JSON.parse(await readFile(join(contentRoot, "quotes.json"), "utf8"));
  const challenges = JSON.parse(await readFile(join(contentRoot, "challenge.json"), "utf8"));

  assert.equal(daily.version, 2);
  assert.equal(daily.quotes[0].day, 1);
  assert.deepEqual(daily.quotes[0].categories, ["scripture", "hope"]);
  assert.deepEqual(daily.quotes[0].supplemental, {
    type: "podcast",
    title: "Companion episode",
    description: "A short episode for today.",
    url: "https://podcasts.apple.com/us/podcast/example/id1234567890",
    imageUrl: "https://raw.githubusercontent.com/example/repo/main/images/day-01.jpg",
    durationLabel: "24 min",
  });
  assert.equal(dailyChallenges.version, 2);
  assert.equal(dailyChallenges.challenges[0].day, 1);
  assert.equal(dailyChallenges.challenges[0].challenge, "Choose one daily thing");
  assert.deepEqual(dailyChallenges.challenges[0].categories, ["hope"]);
  assert.equal(quotes.version, 2);
  assert.deepEqual(quotes.approvedCategories, [
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
  ]);
  assert.equal(quotes.approvedCategories.includes("wisdom"), true);
  assert.equal(quotes.quotes[0].approved, true);
  assert.equal(challenges.version, 2);
  assert.equal(challenges.challenges[0].id, "challenge-1");
  assert.deepEqual(challenges.challenges[0].categories, ["hope"]);
  assert.equal(challenges.challenges[0].approved, true);
}

async function testExport() {
  const contentRoot = await makeFixture();

  await main([], { contentRoot });
  await main(["export"], { contentRoot });

  const dailyTemplate = await readFile(join(contentRoot, "templates", "daily-quotes.md"), "utf8");
  const dailyChallengesTemplate = await readFile(join(contentRoot, "templates", "daily-challenges.md"), "utf8");
  const quotesTemplate = await readFile(join(contentRoot, "templates", "quotes.md"), "utf8");
  const challengesTemplate = await readFile(join(contentRoot, "templates", "challenges.md"), "utf8");

  assert.match(dailyTemplate, /^# Daily Quotes/);
  assert.match(dailyTemplate, /Supplemental Type: podcast/);
  assert.match(dailyTemplate, /Supplemental Title: Companion episode/);
  assert.match(dailyChallengesTemplate, /^# Daily Challenges/);
  assert.match(dailyChallengesTemplate, /Challenge:\nChoose one daily thing/);
  assert.match(quotesTemplate, /^# Quote Library/);
  assert.match(quotesTemplate, /ID: quote-1/);
  assert.match(quotesTemplate, /Quote:\nKeep going/);
  assert.match(challengesTemplate, /^# Challenge Library/);
  assert.match(challengesTemplate, /ID: challenge-1/);
}

async function testDuplicateIds() {
  const contentRoot = await makeFixture();

  await writeFile(
    join(contentRoot, "templates", "quotes.md"),
    [
      "# Quote Library",
      "",
      "## quote-1",
      "",
      "ID: quote-1",
      "Author: Author",
      "Source: Source",
      "Source URL: https://example.com",
      "Categories: hope",
      "Approved: yes",
      "Active: yes",
      "Quote:",
      "Keep going",
      "",
      "## quote-1 duplicate",
      "",
      "ID: quote-1",
      "Author: Author",
      "Source: Source",
      "Source URL: https://example.com",
      "Categories: wisdom",
      "Approved: yes",
      "Active: yes",
      "Quote:",
      "Still going",
      "",
    ].join("\n"),
    "utf8",
  );

  await writeFile(
    join(contentRoot, "templates", "daily-challenges.md"),
    [
      "# Daily Challenges",
      "",
      "## Day 1",
      "",
      "Day: 1",
      "Categories: hope",
      "Approved: yes",
      "Active: yes",
      "Challenge:",
      "Choose one daily thing",
      "",
    ].join("\n"),
    "utf8",
  );

  await writeFile(
    join(contentRoot, "templates", "challenges.md"),
    [
      "# Challenge Library",
      "",
      "## challenge-1",
      "",
      "ID: challenge-1",
      "Categories: hope",
      "Approved: yes",
      "Active: yes",
      "Challenge:",
      "Take one small step",
      "",
    ].join("\n"),
    "utf8",
  );

  await assert.rejects(
    () => main(["quotes"], { contentRoot }),
    /duplicate id: quote-1/,
  );
}

async function makeFixture() {
  const contentRoot = await mkdtemp(join(tmpdir(), "fwr-content-"));
  const templatesRoot = join(contentRoot, "templates");

  await mkdir(templatesRoot, { recursive: true });

  await writeFile(
    join(templatesRoot, "daily-quotes.md"),
    [
      "# Daily Quotes",
      "",
      "## Day 1: Choice",
      "",
      "Day: 1",
      "Slug: choice",
      "Focus: agency",
      "Title: Choice",
      "Artwork: art-1",
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
      "ID: quote-1",
      "Author: Author",
      "Source: Source",
      "Source URL: https://example.com",
      "Categories: hope, wisdom",
      "Approved: yes",
      "Active: yes",
      "Quote:",
      "Keep going",
      "",
    ].join("\n"),
    "utf8",
  );

  await writeFile(
    join(templatesRoot, "daily-challenges.md"),
    [
      "# Daily Challenges",
      "",
      "## Day 1",
      "",
      "Day: 1",
      "Categories: hope",
      "Approved: yes",
      "Active: yes",
      "Challenge:",
      "Choose one daily thing",
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
      "ID: challenge-1",
      "Categories: hope",
      "Approved: yes",
      "Active: yes",
      "Challenge:",
      "Take one small step",
      "",
    ].join("\n"),
    "utf8",
  );

  return contentRoot;
}
