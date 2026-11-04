// Dataset models are independent of both application implementations.
// No application result or generated output is used as its own expected result.
export type Fixture = { name: string; input: string; expected: unknown };
export const applications = ['word-count', 'log-summary', 'csv-clean', 'config-read',
  'dependencies', 'template-render', 'expression-eval', 'tokenize', 'source-index', 'compiler-pipeline'] as const;
export type Application = typeof applications[number];
export const sharedLexer = new Set<Application>(['tokenize', 'source-index', 'compiler-pipeline']);

function increment(map: Map<string, number>, key: string): void { map.set(key, (map.get(key) ?? 0) + 1); }

/** Construct source from known token atoms, recording positions without tokenizing. */
function tokenFixture(groups: number): Fixture {
  let input = ''; let line = 1; let column = 1;
  const expected: { kind: string; text: string; source: string; start: number; end: number;
    line: number; column: number; context: string }[] = [];
  const add = (text: string, kind?: string): void => {
    const start = input.length; const tokenLine = line; const tokenColumn = column;
    input += text;
    for (const character of text) { if (character === '\n') { line++; column = 1; } else column++; }
    if (kind) expected.push({ kind, text, source: 'application.mini', start, end: input.length,
      line: tokenLine, column: tokenColumn, context: '' });
  };
  for (let index = 0; index < groups; index++) {
    add('/// A compiler-shaped source record.\r\n\t');
    add('var', 'keyword'); add(' '); add('name_' + index, 'identifier'); add(' '); add('=', 'symbol'); add(' ');
    add('(', 'symbol'); add('100', 'number'); add(' '); add('+', 'symbol'); add(' '); add('20', 'number'); add(')', 'symbol');
    add(' '); add('-', 'symbol'); add(' '); add('3', 'number'); add(';', 'symbol'); add(' // ordinary comment\n');
    add('write', 'identifier'); add('(', 'symbol'); add('"quoted \\" // text\\n"', 'text'); add(')', 'symbol'); add(';', 'symbol'); add('\n');
  }
  expected.push({ kind: 'eof', text: '', source: 'application.mini', start: input.length,
    end: input.length, line, column, context: '' });
  const lines = input.split(/\r?\n/);
  for (const token of expected) token.context = lines[token.line - 1]!;
  return { name: `${groups}-source-records`, input, expected };
}

/** Construct source and exact TS independently from a known statement model. */
function compilerFixture(count: number): Fixture {
  let input = '/// Sum independently declared bindings.\nvar total = 0;\n';
  let body = 'let total = 0;\n';
  for (let index = 0; index < count; index++) {
    input += `var value_${index} = (10 + 3) - 1;\ntotal = total + value_${index};\n`;
    body += `let value_${index} = ((10 + 3) - 1);\ntotal = (total + value_${index});\n`;
  }
  input += `if (total == ${count * 12}) { write("ok\\n"); } else { write("bad\\n"); }\n`;
  body += `if ((total === ${count * 12})) {\n    writeSync(1, "ok\\n");\n} else {\n    writeSync(1, "bad\\n");\n}\n`;
  return { name: `${count}-bindings`, input,
    expected: '"use strict";\nimport { writeSync } from "node:fs";\n' + body };
}

export function dataset(application: Application, scale: number): Fixture {
  if (application === 'word-count') {
    const count = 2000 * scale; const words = ['mini', 'compiler', 'source', 'token_1', 'map', 'mini'];
    const expected = new Map<string, number>(); const row = words.join(' ') + '.\n';
    for (const word of words) expected.set(word, (expected.get(word) ?? 0) + count);
    return { name: `${count}-paragraphs`, input: row.repeat(count), expected };
  }
  if (application === 'log-summary') {
    let input = ''; const levels = new Map<string, number>(); const routes = new Map<string, number>(); const users = new Map<string, number>();
    for (let index = 0; index < 1000 * scale; index++) {
      const level = ['INFO', 'WARN', 'ERROR'][index % 3]!; const route = ['/compile', '/tokens', '/help', '/docs'][index % 4]!;
      const user = `user_${index % 31}`;
      input += `${level} ${route} ${user}\n`; increment(levels, level); increment(routes, route); increment(users, user);
    }
    return { name: `${1000 * scale}-requests`, input, expected: new Map([['levels', levels], ['routes', routes], ['users', users]]) };
  }
  if (application === 'csv-clean') {
    const encode = (value: string): string => /[",\r\n]/.test(value) ? '"' + value.replaceAll('"', '""') + '"' : value;
    let input = 'name,city,active\r\n'; let expected = '';
    for (let index = 0; index < 1000 * scale; index++) {
      const name = `person_${index}`; const city = ['Munich', 'Paris, France', 'A "quoted" city', 'two\nlines'][index % 4]!;
      const active = index % 3 === 0 ? 'no' : 'yes';
      input += [name, city, active].map(encode).join(',') + '\r\n';
      if (active === 'yes') expected += `${name}\t${city}\n`;
    }
    return { name: `${1000 * scale}-csv-rows`, input, expected };
  }
  if (application === 'config-read') {
    let input = '# Application settings\n'; const expected = new Map<string, string>();
    for (let index = 0; index < 1000 * scale; index++) {
      const section = `group_${index % 8}`; const key = `setting_${index}`; const value = `value_${index % 127}`;
      input += `[ ${section} ]\n ${key} = ${value} \r\n`;
      expected.set(`${section}.${key}`, value);
      if (index % 7 === 0) { input += `${key}=replacement\n`; expected.set(`${section}.${key}`, 'replacement'); }
    }
    return { name: `${1000 * scale}-settings`, input, expected };
  }
  if (application === 'dependencies') {
    let input = ''; const expected = ['root'];
    for (let index = 0; index < 500 * scale; index++) {
      const node = `module_${index}`; input += `root ${node}\n${node} common\n`; expected.push(node);
    }
    input += 'common root\nunreachable island\n'; expected.push('common');
    return { name: `${500 * scale}-modules`, input, expected };
  }
  if (application === 'template-render') {
    const row = 'Hello {{name}}: {{tool}} reads {{source}}. {{unknown}}\n';
    return { name: `${500 * scale}-template-rows`, input: 'name=Mini\ntool=compiler\nsource=input.mini\n\n' + row.repeat(500 * scale),
      expected: 'Hello Mini: compiler reads input.mini. <missing>\n'.repeat(500 * scale) };
  }
  if (application === 'expression-eval') {
    let input = ''; let total = 0; const count = 1000 * scale;
    for (let index = 0; index < count; index++) {
      const value = index % 97;
      input += `(${value} + 45) - (6 - -7);\n`; total += value + 32;
    }
    return { name: `${count}-expressions`, input, expected: new Map([['count', count], ['total', total]]) };
  }
  if (application === 'compiler-pipeline') return compilerFixture(100 * scale);
  const tokens = tokenFixture(100 * scale);
  if (application === 'tokenize') return tokens;
  const symbols = new Map<string, number[]>();
  for (const token of tokens.expected as { kind: string; text: string; start: number }[]) {
    if (token.kind === 'identifier') {
      if (!symbols.has(token.text)) symbols.set(token.text, []);
      symbols.get(token.text)!.push(token.start);
    }
  }
  return { ...tokens, expected: symbols };
}

/** Small, explicit semantic fixtures precede all timing runs. */
export function goldens(application: Application): Fixture[] {
  const empty: Record<Application, unknown> = {
    'word-count': {}, 'log-summary': { levels: {}, routes: {}, users: {} }, 'csv-clean': '',
    'config-read': {}, dependencies: ['root'], 'template-render': '',
    'expression-eval': { count: 0, total: 0 }, tokenize: tokenFixture(0).expected,
    'source-index': {}, 'compiler-pipeline': '"use strict";\n',
  };
  const specific: Partial<Record<Application, Fixture>> = {
    'word-count': { name: 'word-boundaries', input: 'mini, mini! Map token_1', expected: { mini: 2, Map: 1, token_1: 1 } },
    'log-summary': { name: 'partial-rows-and-eof', input: 'INFO /x alice\r\nignored\nERROR /x bob', expected: { levels: { INFO: 1, ERROR: 1 }, routes: { '/x': 2 }, users: { alice: 1, bob: 1 } } },
    'csv-clean': { name: 'quotes-and-eof', input: 'name,city,active\r\n"a,b","c""d",yes', expected: 'a,b\tc"d\n' },
    'config-read': { name: 'sections-and-replacement', input: 'root = first\n[s]\n k = a=b\nk=last\n; ignored\n', expected: { root: 'first', 's.k': 'last' } },
    dependencies: { name: 'cycles-and-duplicates', input: 'root a\nroot a\na b\nb root\nisland absent', expected: ['root', 'a', 'b'] },
    'template-render': { name: 'replacement-and-missing', input: 'x=one\nx=two\n\n{{x}}/{{none}}', expected: 'two/<missing>' },
    'expression-eval': { name: 'negation-and-parentheses', input: '-(2 + 3); 10 - (4 - 1);', expected: { count: 2, total: 2 } },
    'compiler-pipeline': compilerFixture(1),
    tokenize: tokenFixture(1),
    'source-index': { name: 'exclude-comments-and-strings', input: 'var x = 1; // x\nwrite("x"); x = x + 1;', expected: { x: [4, 28, 32], write: [16] } },
  };
  return [{ name: 'empty', input: '', expected: empty[application] }, specific[application]!];
}
