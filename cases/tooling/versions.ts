import assert from 'node:assert/strict';
import { selectRelease, versionPattern } from '../../tools/project.ts';
import { initial } from './support.ts';
assert.deepEqual(selectRelease('test-v0.1.0-alpha.1', initial), { component: 'test', version: '0.1.0-alpha.1' });
for (const tag of ['v0.1.0', 'test-v0.2.0', 'bootstrap-v0.1.0', 'std-v0.1.0', 'unknown-v0.1.0']) {
  assert.throws(() => selectRelease(tag, initial));
}
assert.deepEqual(selectRelease('std-v0.1.0', { ...initial, std: '0.1.0' }), { component: 'std', version: '0.1.0' });
for (const value of ['0.1.0', '1.0.0-alpha.1', '1.0.0-beta.0', '1.0.0-rc.2']) assert(versionPattern.test(value));
for (const value of ['01.0.0', '1.0', '1.0.0-alpha.01', '1.0.0+local', '1.0.0-nightly']) assert(!versionPattern.test(value));

console.log('ok');
