import { keywordDocs } from '../src/keywordDocs';

let hasErrors = false;
const missing: { name: string; field: string }[] = [];

for (const [, doc] of keywordDocs) {
  if (!doc.description || doc.description.trim().length === 0) {
    missing.push({ name: doc.name, field: 'description' });
  }
  if (!doc.syntax || doc.syntax.trim().length === 0) {
    missing.push({ name: doc.name, field: 'syntax' });
  }
  if (!doc.examples || doc.examples.length === 0) {
    missing.push({ name: doc.name, field: 'examples' });
  }
  if (!doc.docUrl || doc.docUrl.trim().length === 0) {
    missing.push({ name: doc.name, field: 'docUrl' });
  }
}

console.log(`Total keywords: ${keywordDocs.size}`);

if (missing.length > 0) {
  hasErrors = true;
  console.error(`\nMissing fields (${missing.length}):`);
  for (const m of missing) {
    console.error(`  ${m.name}: missing ${m.field}`);
  }
}

const categories = { function: 0, object: 0, helping: 0 };
for (const [, doc] of keywordDocs) {
  categories[doc.category]++;
}
console.log(`\nBy category: ${categories.function} function, ${categories.object} object, ${categories.helping} helping`);

if (hasErrors) {
  console.error('\nValidation FAILED');
  process.exit(1);
} else {
  console.log('\nValidation PASSED: all keywords have description, syntax, examples, and docUrl');
}
