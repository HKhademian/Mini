function graph_words(source: string): string[] {
  const words: string[] = []; let word = ''; let position = 0;
  while (position <= source.length) {
    const character = source[position] ?? '';
    if (character === ' ' || character === '\t' || character === '\r' || character === '\n' || character === '') {
      if (word !== '') { words[words.length] = word; word = ''; }
    } else word = word + character;
    position = position + 1;
  }
  return words;
}
export function app_run(source: string): string[] {
  const words = graph_words(source); const edges = new Map<string, string[]>(); let position = 0;
  while (position + 1 < words.length) {
    const from = words[position]!;
    if (!edges.has(from)) edges.set(from, []);
    const destinations = edges.get(from)!;
    destinations[destinations.length] = words[position + 1]!;
    position = position + 2;
  }
  const queue = ['root']; const seen = new Map([['root', true]]); position = 0;
  while (position < queue.length) {
    const node = queue[position]!;
    if (edges.has(node)) {
      const destinations = edges.get(node)!; let index = 0;
      while (index < destinations.length) {
        const next = destinations[index]!;
        if (!seen.has(next)) { seen.set(next, true); queue[queue.length] = next; }
        index = index + 1;
      }
    }
    position = position + 1;
  }
  return queue;
}
