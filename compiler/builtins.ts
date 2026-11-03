import { adapters } from './adapters.ts';
import { ValueKind } from './types.ts';

export type Builtin = {
  parameters: readonly ValueKind[];
  result: ValueKind;
  imports: readonly string[];
  helper?: string;
  emit: (args: string[]) => string;
};

const listCopy = '$mini_list_copy';
const listSet = '$mini_list_set';
const mapSet = '$mini_map_set';
const mapGet = '$mini_map_get';
const mapHas = '$mini_map_has';
const textGet = '$mini_text_get';
const textFind = '$mini_text_find';
const textSlice = '$mini_text_slice';
const textSplit = '$mini_text_split';
const listGet = '$mini_list_get';

export const builtins = new Map<string, Builtin>([
  ['map_get', { parameters: [ValueKind.Unknown, ValueKind.Text], result: ValueKind.Unknown,
    imports: [], helper: adapters.map_runtime, emit: args => `${mapGet}(${args.join(', ')})` }],
  ['map_keys', { parameters: [ValueKind.Map], result: ValueKind.List,
    imports: [], emit: args => `Object.keys(${args[0]})` }],
  ['map_set', { parameters: [ValueKind.Unknown, ValueKind.Text, ValueKind.Unknown], result: ValueKind.Void,
    imports: [], helper: adapters.map_runtime, emit: args => `${mapSet}(${args.join(', ')})` }],
  ['map_has', { parameters: [ValueKind.Map, ValueKind.Text], result: ValueKind.Boolean,
    imports: [], helper: adapters.map_runtime, emit: args => `${mapHas}(${args.join(', ')})` }],
  ['map_new', { parameters: [], result: ValueKind.Map,
    imports: [], helper: adapters.map_runtime, emit: () => '({ __proto__: $mini_map_proto })' }],
  ['map_copy', { parameters: [ValueKind.Map], result: ValueKind.Map,
    imports: [], helper: adapters.map_copy, emit: args => `$mini_map_copy(${args[0]})` }],
  ['list_set', { parameters: [ValueKind.Unknown, ValueKind.Number, ValueKind.Unknown], result: ValueKind.Void,
    imports: [], helper: adapters.list_set, emit: args => `${listSet}(${args.join(', ')})` }],
  ['list_new', { parameters: [], result: ValueKind.List,
    imports: [], emit: () => '[]' }],
  ['list_copy', { parameters: [ValueKind.List], result: ValueKind.List,
    imports: [], helper: adapters.list_copy, emit: args => `${listCopy}(${args[0]})` }],
  ['json_to_text', { parameters: [ValueKind.Unknown], result: ValueKind.Text,
    imports: [], helper: adapters.json_to_text, emit: args => `$mini_json_to_text(${args[0]})` }],
  ['number_to_text', { parameters: [ValueKind.Number], result: ValueKind.Text,
    imports: [], helper: adapters.number_to_text, emit: args => `$mini_number_to_text(${args[0]})` }],
  ['list_to_text', { parameters: [ValueKind.List, ValueKind.Text], result: ValueKind.Text,
    imports: [], helper: adapters.list_to_text, emit: args => `$mini_list_to_text(${args[0]}, ${args[1]})` }],
  ['write_error', { parameters: [ValueKind.Text], result: ValueKind.Void,
    imports: ['writeSync'], emit: args => `writeSync(2, ${args[0]})` }],
  ['process_exit', { parameters: [ValueKind.Number], result: ValueKind.Void,
    imports: [], emit: args => `process.exit(${args[0]})` }],
  ['list_get', { parameters: [ValueKind.Unknown, ValueKind.Number], result: ValueKind.Unknown,
    imports: [], helper: adapters.list_get, emit: args => `${listGet}(${args.join(', ')})` }],
  ['list_length', { parameters: [ValueKind.List], result: ValueKind.Number,
    imports: [], emit: args => `(${args[0]}).length` }],
  ['process_args', { parameters: [], result: ValueKind.List,
    imports: [], emit: () => 'process.argv.slice(2)' }],
  ['file_write', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.Void,
    imports: ['writeFileSync'], emit: args => `writeFileSync(${args[0]}, ${args[1]}, "utf8")` }],
  ['file_read', { parameters: [ValueKind.Text], result: ValueKind.Text,
    imports: ['readFileSync'], emit: args => `readFileSync(${args[0]}, "utf8")` }],
  ['text_get', { parameters: [ValueKind.Unknown, ValueKind.Number], result: ValueKind.Text,
    imports: [], helper: adapters.text_get, emit: args => `${textGet}(${args.join(', ')})` }],
  ['text_length', { parameters: [ValueKind.Text], result: ValueKind.Number,
    imports: [], emit: args => `(${args[0]}).length` }],
  ['text_find', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.Number,
    imports: [], helper: adapters.text_find, emit: args => `${textFind}(${args.join(', ')})` }],
  ['text_split', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.List,
    imports: [], helper: adapters.text_split, emit: args => `${textSplit}(${args.join(', ')})` }],
  ['text_slice', { parameters: [ValueKind.Text, ValueKind.Number, ValueKind.Number], result: ValueKind.Text,
    imports: [], helper: adapters.text_slice, emit: args => `${textSlice}(${args.join(', ')})` }],
  ['readAll', { parameters: [], result: ValueKind.Text,
    imports: ['readFileSync'], emit: () => 'readFileSync(0, "utf8")' }],
  ['write', { parameters: [ValueKind.Text], result: ValueKind.Void,
    imports: ['writeSync'], emit: args => `writeSync(1, ${args[0]})` }],
]);
