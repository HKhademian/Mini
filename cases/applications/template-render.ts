export function app_run(source: string): string {
  const values = new Map<string, string>(); let position = 0; let header = true;
  while (header && position < source.length) {
    let key = ''; let value = ''; let in_value = false;
    while (position < source.length && source[position] !== '\n') {
      const character = source[position]!;
      if (character === '=' && !in_value) in_value = true;
      else if (in_value) value = value + character;
      else key = key + character;
      position = position + 1;
    }
    position = position + 1;
    if (key === '' && !in_value) header = false;
    else if (in_value) values.set(key, value);
  }
  let output = '';
  while (position < source.length) {
    if (source[position] === '{' && source[position + 1] === '{') {
      position = position + 2; let key = '';
      while (position < source.length && source[position] !== '}') { key = key + source[position]; position = position + 1; }
      if (values.has(key)) output = output + values.get(key);
      else output = output + '<missing>';
      position = position + 2;
    } else { output = output + source[position]; position = position + 1; }
  }
  return output;
}
