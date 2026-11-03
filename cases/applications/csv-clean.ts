function csv_row(fields: string[]): string {
  if (fields.length === 3 && fields[2] === 'yes') return fields[0] + '\t' + fields[1] + '\n';
  return '';
}
export function app_run(source: string): string {
  let output = ''; let fields: string[] = []; let field = ''; let quoted = false; let index = 0;
  while (index <= source.length) {
    const character = source[index] ?? '';
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { field = field + '"'; index = index + 1; }
      else quoted = !quoted;
    } else {
      if (!quoted && (character === ',' || character === '\n' || character === '')) {
        fields[fields.length] = field; field = '';
        if (character !== ',') { output = output + csv_row(fields); fields = []; }
      } else if (quoted || character !== '\r') field = field + character;
    }
    index = index + 1;
  }
  return output;
}
