function log_increment(counts: Map<string, number>, key: string): number {
  counts.set(key, (counts.get(key) ?? 0) + 1); return 0;
}
function log_row(fields: string[], levels: Map<string, number>, routes: Map<string, number>, users: Map<string, number>): number {
  if (fields.length === 3) {
    log_increment(levels, fields[0]!); log_increment(routes, fields[1]!); log_increment(users, fields[2]!);
  }
  return 0;
}
export function app_run(source: string): Map<string, Map<string, number>> {
  const levels = new Map<string, number>(); const routes = new Map<string, number>(); const users = new Map<string, number>();
  let fields: string[] = []; let word = ''; let index = 0;
  while (index <= source.length) {
    const character = source[index] ?? '';
    if (character === ' ' || character === '\t' || character === '\r' || character === '\n' || character === '') {
      if (word !== '') { fields[fields.length] = word; word = ''; }
      if (character === '\n' || character === '') { log_row(fields, levels, routes, users); fields = []; }
    } else word = word + character;
    index = index + 1;
  }
  return new Map([['levels', levels], ['routes', routes], ['users', users]]);
}
