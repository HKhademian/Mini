import { ValueKind } from './types.ts';

export type Builtin = {
  parameters: readonly ValueKind[];
  result: ValueKind;
  imports: readonly string[];
  emit: (args: string[]) => string;
};

export const builtins = new Map<string, Builtin>([
  ['process_args', { parameters: [], result: ValueKind.TextList,
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
