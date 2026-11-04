import { adapters } from './adapters.ts';
import type { ValueKind } from './types.ts';
import { builtinMetadata } from './builtin-metadata.ts';

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
  ['map_get', { ...builtinMetadata.get('map_get')!,
    imports: [], helper: adapters.map_runtime, emit: args => `${mapGet}(${args.join(', ')})` }],
  ['map_keys', { ...builtinMetadata.get('map_keys')!,
    imports: [], emit: args => `Object.keys(${args[0]})` }],
  ['map_set', { ...builtinMetadata.get('map_set')!,
    imports: [], helper: adapters.map_runtime, emit: args => `${mapSet}(${args.join(', ')})` }],
  ['map_has', { ...builtinMetadata.get('map_has')!,
    imports: [], helper: adapters.map_runtime, emit: args => `${mapHas}(${args.join(', ')})` }],
  ['map_new', { ...builtinMetadata.get('map_new')!,
    imports: [], helper: adapters.map_runtime, emit: () => '({ __proto__: $mini_map_proto })' }],
  ['map_copy', { ...builtinMetadata.get('map_copy')!,
    imports: [], helper: adapters.map_copy, emit: args => `$mini_map_copy(${args[0]})` }],
  ['list_set', { ...builtinMetadata.get('list_set')!,
    imports: [], helper: adapters.list_set, emit: args => `${listSet}(${args.join(', ')})` }],
  ['list_new', { ...builtinMetadata.get('list_new')!,
    imports: [], emit: () => '[]' }],
  ['list_copy', { ...builtinMetadata.get('list_copy')!,
    imports: [], helper: adapters.list_copy, emit: args => `${listCopy}(${args[0]})` }],
  ['json_to_text', { ...builtinMetadata.get('json_to_text')!,
    imports: [], helper: adapters.json_to_text, emit: args => `$mini_json_to_text(${args[0]})` }],
  ['number_to_text', { ...builtinMetadata.get('number_to_text')!,
    imports: [], helper: adapters.number_to_text, emit: args => `$mini_number_to_text(${args[0]})` }],
  ['list_to_text', { ...builtinMetadata.get('list_to_text')!,
    imports: [], helper: adapters.list_to_text, emit: args => `$mini_list_to_text(${args[0]}, ${args[1]})` }],
  ['write_error', { ...builtinMetadata.get('write_error')!,
    imports: ['writeSync'], emit: args => `writeSync(2, ${args[0]})` }],
  ['process_exit', { ...builtinMetadata.get('process_exit')!,
    imports: [], emit: args => `process.exit(${args[0]})` }],
  ['list_get', { ...builtinMetadata.get('list_get')!,
    imports: [], helper: adapters.list_get, emit: args => `${listGet}(${args.join(', ')})` }],
  ['list_length', { ...builtinMetadata.get('list_length')!,
    imports: [], emit: args => `(${args[0]}).length` }],
  ['process_args', { ...builtinMetadata.get('process_args')!,
    imports: [], emit: () => 'process.argv.slice(2)' }],
  ['process_run', { ...builtinMetadata.get('process_run')!,
    imports: [], helper: adapters.process_run, emit: args => `$mini_process_run(${args.join(', ')})` }],
  ['file_write', { ...builtinMetadata.get('file_write')!,
    imports: ['writeFileSync'], emit: args => `writeFileSync(${args[0]}, ${args[1]}, "utf8")` }],
  ['file_read', { ...builtinMetadata.get('file_read')!,
    imports: ['readFileSync'], emit: args => `readFileSync(${args[0]}, "utf8")` }],
  ['text_get', { ...builtinMetadata.get('text_get')!,
    imports: [], helper: adapters.text_get, emit: args => `${textGet}(${args.join(', ')})` }],
  ['text_length', { ...builtinMetadata.get('text_length')!,
    imports: [], emit: args => `(${args[0]}).length` }],
  ['text_find', { ...builtinMetadata.get('text_find')!,
    imports: [], helper: adapters.text_find, emit: args => `${textFind}(${args.join(', ')})` }],
  ['text_split', { ...builtinMetadata.get('text_split')!,
    imports: [], helper: adapters.text_split, emit: args => `${textSplit}(${args.join(', ')})` }],
  ['text_slice', { ...builtinMetadata.get('text_slice')!,
    imports: [], helper: adapters.text_slice, emit: args => `${textSlice}(${args.join(', ')})` }],
  ['readAll', { ...builtinMetadata.get('readAll')!,
    imports: ['readFileSync'], emit: () => 'readFileSync(0, "utf8")' }],
  ['write', { ...builtinMetadata.get('write')!,
    imports: ['writeSync'], emit: args => `writeSync(1, ${args[0]})` }],
]);
