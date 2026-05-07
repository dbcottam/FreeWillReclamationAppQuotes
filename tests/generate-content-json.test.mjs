import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { main } from "../scripts/generate-content-json.mjs";

const tests = [
  ["generates endpoint JSON from CSV feeds", testGenerate],
  ["exports CSV from endpoint JSON feeds", testExport],
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
  const quotes = JSON.parse(await readFile(join(contentRoot, "quotes.json"), "utf8"));

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
}

async function testExport() {
  const contentRoot = await makeFixture();

  await main([], { contentRoot });
  await main(["export"], { contentRoot });

  const dailyCsv = await readFile(join(contentRoot, "daily-quotes.csv"), "utf8");
  const quotesCsv = await readFile(join(contentRoot, "quotes.csv"), "utf8");

  assert.match(dailyCsv, /^day,slug,focus,title,artworkKey,challenge,/);
  assert.match(dailyCsv, /supplementalType,supplementalTitle,supplementalDescription,supplementalUrl,supplementalImageUrl,supplementalDurationLabel/);
  assert.match(dailyCsv, /podcast,Companion episode/);
  assert.match(quotesCsv, /^id,quote,author,source,sourceUrl,/);
  assert.match(quotesCsv, /quote-1,Keep going/);
}

async function testDuplicateIds() {
  const contentRoot = await makeFixture();

  await writeFile(
    join(contentRoot, "quotes.csv"),
    [
      "id,quote,author,source,sourceUrl,categories,approved,active",
      "quote-1,Keep going,Author,Source,https://example.com,hope,true,true",
      "quote-1,Still going,Author,Source,https://example.com,wisdom,true,true",
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

  await writeFile(
    join(contentRoot, "daily-quotes.csv"),
    [
      "day,slug,focus,title,artworkKey,challenge,prompt,celebrationPrompt,quote,author,source,sourceUrl,categories,supplementalType,supplementalTitle,supplementalDescription,supplementalUrl,supplementalImageUrl,supplementalDurationLabel",
      "1,choice,agency,Choice,art-1,Choose something,How did it feel?,What changed?,Daily quote,Bible,Psalm 1,https://example.com,scripture|hope,podcast,Companion episode,A short episode for today.,https://podcasts.apple.com/us/podcast/example/id1234567890,https://raw.githubusercontent.com/example/repo/main/images/day-01.jpg,24 min",
      "",
    ].join("\n"),
    "utf8",
  );

  await writeFile(
    join(contentRoot, "quotes.csv"),
    [
      "id,quote,author,source,sourceUrl,categories,approved,active",
      "quote-1,Keep going,Author,Source,https://example.com,hope|wisdom,true,true",
      "",
    ].join("\n"),
    "utf8",
  );

  return contentRoot;
}
