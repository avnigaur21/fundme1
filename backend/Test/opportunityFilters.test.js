const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sectorLabels, sectorMatches, stageMatches } = require('../../src/lib/opportunityTaxonomy');
const { inferSector } = require('../services/aiCleaner');
const { extractOpportunityDetailDataFromHtml } = require('../services/scraper');
test('normalizes duplicate sectors and includes explicitly unrestricted grants', () => {
  assert.deepEqual(sectorLabels(['Fintech', 'FinTech']), ['FinTech']);
  assert.equal(sectorMatches('AI / ML, DeepTech', ['AI / ML']), true);
  assert.equal(sectorMatches('All Sectors', ['AI / ML']), true);
  assert.equal(sectorMatches('', ['AI / ML']), false);
  assert.equal(sectorMatches('AgriTech', ['AI / ML']), false);
});
test('detail stage extraction excludes recommendation cards', () => {
  const html = '<body><h1>Test grant</h1><a href="/stage/mvp">MVP</a><h2>About this grant</h2><p>Support for startups.</p><h2>Similar Grants</h2><a href="/stage/growth">Growth</a></body>';
  const details = extractOpportunityDetailDataFromHtml(html, 'https://www.startupgrantsindia.com/test');
  assert.equal(details.stage, 'MVP');
});
test('does not misclassify machine learning or missing fields', () => {
  assert.equal(inferSector('Machine learning and artificial intelligence'), 'AI / ML');
  assert.equal(inferSector('Support for founders'), '');
  assert.equal(inferSector('Fintech and machine learning'), 'FinTech, AI / ML');
  assert.equal(stageMatches('', ['MVP']), false);
  assert.equal(stageMatches('Idea, MVP', ['MVP']), true);
});
