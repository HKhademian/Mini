import { ValueKind } from './types.ts';

export type Builtin = {
  parameters: readonly ValueKind[];
  result: ValueKind;
  imports: readonly string[];
  helper?: string;
  emit: (args: string[]) => string;
};

const listSet = '$mini_list_set';

export const builtins = new Map<string, Builtin>([
  ['list_set', { parameters: [ValueKind.Unknown, ValueKind.Number, ValueKind.Unknown], result: ValueKind.Void,
    imports: [], helper: `function ${listSet}(items, index, value) {
    if (!Array.isArray(items)) return;
    if (index < 0) index = items.length + index;
    if (index >= 0) items[index] = value;
}
`, emit: args => `${listSet}(${args.join(', ')})` }],
  ['list_new', { parameters: [], result: ValueKind.List,
    imports: [], emit: () => '[]' }],
  ['write_error', { parameters: [ValueKind.Text], result: ValueKind.Void,
    imports: ['writeSync'], emit: args => `writeSync(2, ${args[0]})` }],
  ['process_exit', { parameters: [ValueKind.Number], result: ValueKind.Void,
    imports: [], emit: args => `process.exit(${args[0]})` }],
  ['list_at', { parameters: [ValueKind.List, ValueKind.Number], result: ValueKind.Unknown,
    imports: [], emit: args => `(${args[0]})[${args[1]}]` }],
  ['list_length', { parameters: [ValueKind.List], result: ValueKind.Number,
    imports: [], emit: args => `(${args[0]}).length` }],
  ['process_args', { parameters: [], result: ValueKind.List,
    imports: [], emit: () => 'process.argv.slice(2)' }],
  ['file_write', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.Void,
    imports: ['writeFileSync'], emit: args => `writeFileSync(${args[0]}, ${args[1]}, "utf8")` }],
  ['file_read', { parameters: [ValueKind.Text], result: ValueKind.Text,
    imports: ['readFileSync'], emit: args => `readFileSync(${args[0]}, "utf8")` }],
  ['text_at', { parameters: [ValueKind.Text, ValueKind.Number], result: ValueKind.Text,
    imports: [], emit: args => `(${args[0]})[${args[1]}]` }],
  ['text_length', { parameters: [ValueKind.Text], result: ValueKind.Number,
    imports: [], emit: args => `(${args[0]}).length` }],
  ['readAll', { parameters: [], result: ValueKind.Text,
    imports: ['readFileSync'], emit: () => 'readFileSync(0, "utf8")' }],
  ['write', { parameters: [ValueKind.Text], result: ValueKind.Void,
    imports: ['writeSync'], emit: args => `writeSync(1, ${args[0]})` }],
]);
