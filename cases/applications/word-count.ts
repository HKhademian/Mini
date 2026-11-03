// Handwritten counterpart: same character classes, loops, map layout, and calls.
function word_letters(): Map<string, boolean> {
  const letters = new Map<string, boolean>();
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
  let index = 0;
  while (index < alphabet.length) { letters.set(alphabet[index]!, true); index = index + 1; }
  return letters;
}
function word_store(counts: Map<string, number>, word: string): number {
  if (word.length > 0) counts.set(word, (counts.get(word) ?? 0) + 1);
  return 0;
}
export function app_run(source: string): Map<string, number> {
  const letters = word_letters();
  const counts = new Map<string, number>();
  let word = '';
  let index = 0;
  while (index < source.length) {
    const character = source[index]!;
    if (letters.has(character)) word = word + character;
    else { word_store(counts, word); word = ''; }
    index = index + 1;
  }
  word_store(counts, word);
  return counts;
}
