// npm run validate: prints the AeroDose vs CARI-7 comparison as a table you can paste into the README.
import { loadReference, compareAll, toMarkdownTable } from './compare.js';

const reference = loadReference();
const rows = compareAll(reference);
console.log(`Source: ${reference.source.title}`);
console.log(`Conditions: ${reference.source.conditions}; AeroDose F10.7 = ${reference.assumptions.f107} sfu\n`);
console.log(toMarkdownTable(rows, reference.tolerancePercent));
