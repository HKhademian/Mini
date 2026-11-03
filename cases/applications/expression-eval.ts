type State = Map<string, string | number>;
function expr_ten(value: number): number { const twice = value + value; const four = twice + twice; return four + four + twice; }
function expr_digit(character: string): number {
  let index = 0; while (index < 10) { if ('0123456789'[index] === character) return index; index = index + 1; } return -1;
}
function expr_space(state: State): number {
  const source = state.get('source') as string; let position = state.get('position') as number; let character = source[position] ?? '';
  while (character === ' ' || character === '\t' || character === '\r' || character === '\n') { position = position + 1; character = source[position] ?? ''; }
  state.set('position', position); return 0;
}
function expr_primary(state: State): number {
  expr_space(state); const source = state.get('source') as string; const character = source[state.get('position') as number] ?? '';
  if (character === '-' || character === '(') {
    state.set('position', (state.get('position') as number) + 1);
    if (character === '-') return -expr_primary(state);
    const value = expr_sum(state); expr_space(state);
    if (source[state.get('position') as number] !== ')') process.exit(1);
    state.set('position', (state.get('position') as number) + 1); return value;
  }
  let value = 0; let digits = 0; let digit = expr_digit(character);
  while (digit >= 0) {
    value = expr_ten(value) + digit; digits = digits + 1;
    state.set('position', (state.get('position') as number) + 1);
    digit = expr_digit(source[state.get('position') as number] ?? '');
  }
  if (digits === 0) process.exit(1);
  return value;
}
function expr_sum(state: State): number {
  let value = expr_primary(state); expr_space(state);
  let operator = (state.get('source') as string)[state.get('position') as number] ?? '';
  while (operator === '+' || operator === '-') {
    state.set('position', (state.get('position') as number) + 1); const right = expr_primary(state);
    if (operator === '+') value = value + right; else value = value - right;
    expr_space(state); operator = (state.get('source') as string)[state.get('position') as number] ?? '';
  }
  return value;
}
export function app_run(source: string): Map<string, number> {
  const state: State = new Map<string, string | number>([['source', source], ['position', 0]]);
  let total = 0; let count = 0; expr_space(state);
  while ((state.get('position') as number) < source.length) {
    total = total + expr_sum(state);
    if (source[state.get('position') as number] !== ';') process.exit(1);
    state.set('position', (state.get('position') as number) + 1); count = count + 1; expr_space(state);
  }
  return new Map([['count', count], ['total', total]]);
}
