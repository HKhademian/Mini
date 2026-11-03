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

// Children of this empty prototype retain ordinary object storage without
// inheriting string properties or the __proto__ setter. No per-map metadata.
const mapRuntime = `const $mini_map_proto = { __proto__: null };
function ${mapGet}(items, key) {
    if (items === null || typeof items !== "object" || Array.isArray(items)) return 0;
    const value = items[key];
    return value !== undefined || key in items ? value : 0;
}
function ${mapHas}(items, key) {
    return key in items;
}
function ${mapSet}(items, key, value) {
    if (items !== null && typeof items === "object" && !Array.isArray(items)) items[key] = value;
}
`;

export const builtins = new Map<string, Builtin>([
  ['map_get', { parameters: [ValueKind.Unknown, ValueKind.Text], result: ValueKind.Unknown,
    imports: [], helper: mapRuntime, emit: args => `${mapGet}(${args.join(', ')})` }],
  ['map_keys', { parameters: [ValueKind.Map], result: ValueKind.List,
    imports: [], emit: args => `Object.keys(${args[0]})` }],
  ['map_set', { parameters: [ValueKind.Unknown, ValueKind.Text, ValueKind.Unknown], result: ValueKind.Void,
    imports: [], helper: mapRuntime, emit: args => `${mapSet}(${args.join(', ')})` }],
  ['map_has', { parameters: [ValueKind.Map, ValueKind.Text], result: ValueKind.Boolean,
    imports: [], helper: mapRuntime, emit: args => `${mapHas}(${args.join(', ')})` }],
  ['map_new', { parameters: [], result: ValueKind.Map,
    imports: [], helper: mapRuntime, emit: () => '({ __proto__: $mini_map_proto })' }],
  ['map_copy', { parameters: [ValueKind.Map], result: ValueKind.Map,
    imports: [], helper: `function $mini_map_copy(items) {
    if (items === null || typeof items !== "object" || Array.isArray(items)) return Object.create(null);
    return Object.assign(Object.create(null), items);
}
`, emit: args => `$mini_map_copy(${args[0]})` }],
  ['list_set', { parameters: [ValueKind.Unknown, ValueKind.Number, ValueKind.Unknown], result: ValueKind.Void,
    imports: [], helper: `function ${listSet}(items, index, value) {
    if (!Array.isArray(items)) return;
    if (index < 0) index = items.length + index;
    if (index >= 0) items[index] = value;
}
`, emit: args => `${listSet}(${args.join(', ')})` }],
  ['list_new', { parameters: [], result: ValueKind.List,
    imports: [], emit: () => '[]' }],
  ['list_copy', { parameters: [ValueKind.List], result: ValueKind.List,
    imports: [], helper: `function ${listCopy}(items) {
    if (!Array.isArray(items)) return [];
    return items.slice();
}
`, emit: args => `${listCopy}(${args[0]})` }],
  ['list_to_text', { parameters: [ValueKind.List, ValueKind.Text], result: ValueKind.Text,
    imports: [], helper: `function $mini_list_to_text(items, separator) {
    if (!Array.isArray(items) || typeof separator !== "string") return "";
    let output = "";
    for (let index = 0; index < items.length; index++) {
        if (index > 0) output += separator;
        const value = items[index];
        if (typeof value === "string") output += value;
    }
    return output;
}
`, emit: args => `$mini_list_to_text(${args[0]}, ${args[1]})` }],
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
  ['text_find', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.Number,
    imports: [], helper: `function ${textFind}(text, needle) {
    if (typeof text !== "string" || typeof needle !== "string") return -1;
    return text.indexOf(needle);
}
`, emit: args => `${textFind}(${args.join(', ')})` }],
  ['text_split', { parameters: [ValueKind.Text, ValueKind.Text], result: ValueKind.List,
    imports: [], helper: `function ${textSplit}(text, divider) {
    if (typeof text !== "string" || typeof divider !== "string") return [];
    if (divider === "") return [text];
    return text.split(divider);
}
`, emit: args => `${textSplit}(${args.join(', ')})` }],
  ['text_slice', { parameters: [ValueKind.Text, ValueKind.Number, ValueKind.Number], result: ValueKind.Text,
    imports: [], helper: `function ${textSlice}(source, start, end) {
    if (typeof source !== "string") return "";
    if (start < 0) start = source.length + start;
    if (end < 0) end = source.length + end;
    if (start < 0) start = 0;
    if (end < 0) end = 0;
    if (start > source.length) start = source.length;
    if (end > source.length) end = source.length;
    if (end <= start) return "";
    return source.slice(start, end);
}
`, emit: args => `${textSlice}(${args.join(', ')})` }],
  ['readAll', { parameters: [], result: ValueKind.Text,
    imports: ['readFileSync'], emit: () => 'readFileSync(0, "utf8")' }],
  ['write', { parameters: [ValueKind.Text], result: ValueKind.Void,
    imports: ['writeSync'], emit: args => `writeSync(1, ${args[0]})` }],
]);
