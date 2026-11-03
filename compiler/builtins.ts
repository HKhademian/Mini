import { ValueKind } from './types.ts';

export type Builtin = {
  parameters: readonly ValueKind[];
  result: ValueKind;
  imports: readonly string[];
  emit: (args: string[]) => string;
};

export const builtins = new Map<string, Builtin>([
  ['write', { parameters: [ValueKind.Text], result: ValueKind.Void,
    imports: ['writeSync'], emit: args => `writeSync(1, ${args[0]})` }],
]);
