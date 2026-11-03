import { ValueKind } from './types.ts';

export type Builtin = {
  parameters: readonly ValueKind[];
  result: ValueKind;
  imports: readonly string[];
  helper?: string;
  emit: (args: string[]) => string;
};

const listSet = '$mini_list_set';
const mapSet = '$mini_map_set';
const mapGet = '$mini_map_get';
const textGet = '$mini_text_get';
const listGet = '$mini_list_get';

export const builtins = new Map<string, Builtin>([
  ['map_get', { parameters: [ValueKind.Unknown, ValueKind.Text], result: ValueKind.Unknown,
    imports: [], helper: `function ${mapGet}(items, key) {
    if (!(items instanceof Map) || !items.has(key)) return 0;
    return items.get(key);
}
`, emit: args => `${mapGet}(${args.join(', ')})` }],
  ['map_keys', { parameters: [ValueKind.Map], result: ValueKind.List,
    imports: [], emit: args => `[...(${args[0]}).keys()]` }],
  ['map_length', { parameters: [ValueKind.Map], result: ValueKind.Number,
    imports: [], emit: args => `(${args[0]}).size` }],
  ['map_set', { parameters: [ValueKind.Unknown, ValueKind.Text, ValueKind.Unknown], result: ValueKind.Void,
    imports: [], helper: `function ${mapSet}(items, key, value) {
    if (items instanceof Map) items.set(key, value);
}
`, emit: args => `${mapSet}(${args.join(', ')})` }],
  ['map_has', { parameters: [ValueKind.Map, ValueKind.Text], result: ValueKind.Boolean,
    imports: [], emit: args => `(${args[0]}).has(${args[1]})` }],
  ['map_new', { parameters: [], result: ValueKind.Map,
    imports: [], emit: () => 'new Map()' }],
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
  ['list_get', { parameters: [ValueKind.Unknown, ValueKind.Number], result: ValueKind.Unknown,
    imports: [], helper: `function ${listGet}(items, index) {
    if (!Array.isArray(items)) return 0;
    if (index < 0) index = items.length + index;
    if (index >= 0 && index < items.length && index in items) return items[index];
    return 0;
}
`, emit: args => `${listGet}(${args.join(', ')})` }],
  ['list_length', { parameters: [ValueKind.List], result: ValueKind.Number,
    imports: [], emit: args => `(${args[0]}).length` }],
  ['process_args', { parameters: [], result: ValueKind.List,
    imports: [], emit: () => 'process.argv.slice(2)' }],
  ['file_write', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.Void,
    imports: ['writeFileSync'], emit: args => `writeFileSync(${args[0]}, ${args[1]}, "utf8")` }],
  ['file_read', { parameters: [ValueKind.Text], result: ValueKind.Text,
    imports: ['readFileSync'], emit: args => `readFileSync(${args[0]}, "utf8")` }],
  ['text_get', { parameters: [ValueKind.Unknown, ValueKind.Number], result: ValueKind.Text,
    imports: [], helper: `function ${textGet}(text, index) {
    if (typeof text === "string" && index >= 0 && index < text.length) return text[index];
    return "";
}
`, emit: args => `${textGet}(${args.join(', ')})` }],
  ['text_length', { parameters: [ValueKind.Text], result: ValueKind.Number,
    imports: [], emit: args => `(${args[0]}).length` }],
  ['readAll', { parameters: [], result: ValueKind.Text,
    imports: ['readFileSync'], emit: () => 'readFileSync(0, "utf8")' }],
  ['write', { parameters: [ValueKind.Text], result: ValueKind.Void,
    imports: ['writeSync'], emit: args => `writeSync(1, ${args[0]})` }],
]);
