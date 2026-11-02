import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { verifyBootstrap } from '../../tools/verify.ts';
import { fixture } from './support.ts';
const directory = fixture();
try { assert.throws(() => verifyBootstrap(directory), /Bootstrap unavailable/); }
finally { rmSync(directory, { recursive: true, force: true }); }

console.log('ok');
