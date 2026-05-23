import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs';

const expectedVersion = '5.4.0';
const reviewedAt = new Date('2026-01-01T00:00:00.000Z');
const scheduler = fsrs(generatorParameters({ request_retention: 0.9 }));

function findPackageJson(startFile) {
  let current = dirname(startFile);
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = join(current, 'package.json');
    try {
      return JSON.parse(readFileSync(candidate, 'utf8'));
    } catch {
      current = dirname(current);
    }
  }
  throw new Error('Unable to locate ts-fsrs package.json for version audit.');
}

function snapshot(rating) {
  const card = createEmptyCard(reviewedAt);
  const next = scheduler.next(card, reviewedAt, rating).card;
  const retrievability = next.stability > 0 ? scheduler.get_retrievability(next, reviewedAt, false) : 0;

  return {
    due: next.due.toISOString(),
    stability: Number(next.stability.toFixed(4)),
    difficulty: Number(next.difficulty.toFixed(4)),
    elapsed_days: next.elapsed_days,
    scheduled_days: next.scheduled_days,
    learning_steps: next.learning_steps,
    reps: next.reps,
    lapses: next.lapses,
    state: next.state,
    last_review: next.last_review?.toISOString(),
    retrievability: Number(retrievability.toFixed(4))
  };
}

const tsFsrsEntry = fileURLToPath(import.meta.resolve('ts-fsrs'));
const packageJson = findPackageJson(tsFsrsEntry);
assert.equal(packageJson.version, expectedVersion, 'ts-fsrs package version drifted.');

const actual = {
  again: snapshot(Rating.Again),
  hard: snapshot(Rating.Hard),
  good: snapshot(Rating.Good),
  easy: snapshot(Rating.Easy)
};

assert.deepEqual(actual, {
  again: {
    due: '2026-01-01T00:01:00.000Z',
    stability: 0.212,
    difficulty: 6.4133,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: 1,
    lapses: 0,
    state: 1,
    last_review: '2026-01-01T00:00:00.000Z',
    retrievability: 1
  },
  hard: {
    due: '2026-01-01T00:06:00.000Z',
    stability: 1.2931,
    difficulty: 5.1122,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: 1,
    lapses: 0,
    state: 1,
    last_review: '2026-01-01T00:00:00.000Z',
    retrievability: 1
  },
  good: {
    due: '2026-01-01T00:10:00.000Z',
    stability: 2.3065,
    difficulty: 2.1181,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 1,
    reps: 1,
    lapses: 0,
    state: 1,
    last_review: '2026-01-01T00:00:00.000Z',
    retrievability: 1
  },
  easy: {
    due: '2026-01-09T00:00:00.000Z',
    stability: 8.2956,
    difficulty: 1,
    elapsed_days: 0,
    scheduled_days: 8,
    learning_steps: 0,
    reps: 1,
    lapses: 0,
    state: 2,
    last_review: '2026-01-01T00:00:00.000Z',
    retrievability: 1
  }
});

console.log(`FSRS golden test passed for ts-fsrs ${expectedVersion}.`);
