import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, scenarioDoseUsv, scenarioLogEntries, formatDose, PUBLIC_GUIDELINE_USV, OCCUPATIONAL_GUIDELINE_USV } from '../src/physics/scenarios.js';
import { buildLetter, RECIPIENTS } from '../src/utils/letter.js';

const byId = id => SCENARIOS.find(s => s.id === id);

test('every scenario uses airports that exist and produces a positive dose', () => {
  for (const s of SCENARIOS) assert.ok(scenarioDoseUsv(s, 150) > 0, s.id);
});

test('a flight attendant on this schedule exceeds the public guideline but not the crew guideline', () => {
  const d = scenarioDoseUsv(byId('crew'), 150);
  assert.ok(d > PUBLIC_GUIDELINE_USV, `crew ${d}`);
  assert.ok(d < OCCUPATIONAL_GUIDELINE_USV, `crew ${d}`);
});

test('the student scenario stays well under the public guideline', () => {
  assert.ok(scenarioDoseUsv(byId('student'), 150) < PUBLIC_GUIDELINE_USV * 0.25);
});

test('scenario log entries add up to the scenario total', () => {
  for (const s of SCENARIOS) {
    const sum = scenarioLogEntries(s, 150).reduce((a, e) => a + e.doseUsv, 0);
    assert.ok(Math.abs(sum - scenarioDoseUsv(s, 150)) < 1e-6, s.id);
  }
});

test('a quieter Sun (lower F10.7) gives a higher scenario dose', () => {
  assert.ok(scenarioDoseUsv(byId('crew'), 75) > scenarioDoseUsv(byId('crew'), 210));
});

test('formatDose switches between µSv and mSv', () => {
  assert.equal(formatDose(46), '46 µSv');
  assert.equal(formatDose(6600), '6.6 mSv');
});

test('letters are complete for every recipient, with or without a log', () => {
  for (const recipient of Object.keys(RECIPIENTS)) {
    for (const logTotalUsv of [0, 250]) {
      const { subject, body } = buildLetter({ recipient, name: 'Alex', place: 'Springfield', logTotalUsv, f107: 129 });
      assert.ok(subject.length > 10);
      assert.ok(!/undefined|NaN|null/.test(body), `${recipient}/${logTotalUsv}: ${body}`);
      assert.ok(body.includes('Alex') && body.includes('Springfield'));
      assert.ok(body.includes('aerodose.vercel.app'));
      assert.ok(/My questions:/.test(body));
    }
  }
});

test('the letter quotes the user\'s own logged total when there is one', () => {
  const { body } = buildLetter({ recipient: 'rep', logTotalUsv: 250, f107: 129 });
  assert.ok(body.includes('250 µSv'), body);
});

test('blank name and town become visible placeholders, not empty text', () => {
  const { body } = buildLetter({ recipient: 'rep' });
  assert.ok(body.includes('[your name]') && body.includes('[your town]'));
});
