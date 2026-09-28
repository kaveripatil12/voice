'use strict';

const assert = require('assert');
const { buildOverviewSequence, buildLanguagePrompt } = require('./overviewFlow.js');

const english = buildOverviewSequence('english');
const hindi = buildOverviewSequence('hindi');
const marathi = buildOverviewSequence('marathi');

assert.ok(english.length >= 4, 'English overview should include several spoken sections');
assert.ok(hindi.length >= 4, 'Hindi overview should include several spoken sections');
assert.ok(marathi.length >= 4, 'Marathi overview should include several spoken sections');

assert.ok(buildLanguagePrompt('english').includes('Before we begin'));
assert.ok(buildLanguagePrompt('hindi').includes('आगे की जानकारी'));
assert.ok(buildLanguagePrompt('marathi').includes('पुढील माहितीसाठी'));

assert.ok(english.some((segment) => /University introduction/i.test(segment.title)));
assert.ok(english.some((segment) => /Main academic|Commerce|Engineering/i.test(segment.title)));
assert.ok(english.some((segment) => /Commerce|Pharmacy|Engineering/i.test(segment.title)));
assert.ok(english.some((segment) => /intake|official information|Admission transfer/i.test(segment.title)));
assert.ok(english.some((segment) => /Admission Department|current vacant seats/i.test(segment.text)));

console.log('overviewFlow tests passed');
