import { ValueKind } from './types.ts';

export type BuiltinMetadata = {
  parameters: readonly ValueKind[];
  result: ValueKind;
};

export const builtinMetadata = new Map<string, BuiltinMetadata>([
  ['map_get', { parameters: [ValueKind.Unknown, ValueKind.Text], result: ValueKind.Unknown }],
  ['map_keys', { parameters: [ValueKind.Map], result: ValueKind.List }],
  ['map_set', { parameters: [ValueKind.Unknown, ValueKind.Text, ValueKind.Unknown], result: ValueKind.Void }],
  ['map_has', { parameters: [ValueKind.Map, ValueKind.Text], result: ValueKind.Boolean }],
  ['map_new', { parameters: [], result: ValueKind.Map }],
  ['map_copy', { parameters: [ValueKind.Map], result: ValueKind.Map }],
  ['list_set', { parameters: [ValueKind.Unknown, ValueKind.Number, ValueKind.Unknown], result: ValueKind.Void }],
  ['list_new', { parameters: [], result: ValueKind.List }],
  ['list_copy', { parameters: [ValueKind.List], result: ValueKind.List }],
  ['json_to_text', { parameters: [ValueKind.Unknown], result: ValueKind.Text }],
  ['number_to_text', { parameters: [ValueKind.Number], result: ValueKind.Text }],
  ['list_to_text', { parameters: [ValueKind.List, ValueKind.Text], result: ValueKind.Text }],
  ['write_error', { parameters: [ValueKind.Text], result: ValueKind.Void }],
  ['process_exit', { parameters: [ValueKind.Number], result: ValueKind.Void }],
  ['list_get', { parameters: [ValueKind.Unknown, ValueKind.Number], result: ValueKind.Unknown }],
  ['list_length', { parameters: [ValueKind.List], result: ValueKind.Number }],
  ['process_args', { parameters: [], result: ValueKind.List }],
  ['file_write', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.Void }],
  ['file_read', { parameters: [ValueKind.Text], result: ValueKind.Text }],
  ['text_get', { parameters: [ValueKind.Unknown, ValueKind.Number], result: ValueKind.Text }],
  ['text_length', { parameters: [ValueKind.Text], result: ValueKind.Number }],
  ['text_find', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.Number }],
  ['text_split', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.List }],
  ['text_slice', { parameters: [ValueKind.Text, ValueKind.Number, ValueKind.Number], result: ValueKind.Text }],
  ['readAll', { parameters: [], result: ValueKind.Text }],
  ['write', { parameters: [ValueKind.Text], result: ValueKind.Void }],
]);
