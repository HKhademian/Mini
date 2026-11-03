function config_slice(source: string, start: number, end: number): string {
  let output = ''; let position = start; while (position < end) { output = output + source[position]; position = position + 1; } return output;
}
function config_trim(source: string): string {
  let start = 0; let end = source.length;
  while (start < end && (source[start] === ' ' || source[start] === '\t' || source[start] === '\r')) start = start + 1;
  while (end > start && (source[end - 1] === ' ' || source[end - 1] === '\t' || source[end - 1] === '\r')) end = end - 1;
  return config_slice(source, start, end);
}
export function app_run(source: string): Map<string, string> {
  const settings = new Map<string, string>(); let section = ''; let line = ''; let position = 0;
  while (position <= source.length) {
    const character = source[position] ?? '';
    if (character === '\n' || character === '') {
      line = config_trim(line);
      if (line[0] === '[' && line[line.length - 1] === ']') section = config_trim(config_slice(line, 1, line.length - 1));
      else if (line !== '' && line[0] !== '#' && line[0] !== ';') {
        let split = 0; while (split < line.length && line[split] !== '=') split = split + 1;
        if (split < line.length) {
          let key = config_trim(config_slice(line, 0, split));
          if (section !== '') key = section + '.' + key;
          settings.set(key, config_trim(config_slice(line, split + 1, line.length)));
        }
      }
      line = '';
    } else line = line + character;
    position = position + 1;
  }
  return settings;
}
