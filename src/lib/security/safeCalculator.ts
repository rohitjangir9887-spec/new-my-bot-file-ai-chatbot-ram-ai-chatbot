export function safeCalculator(expression: string): number {
  const input = expression.trim();
  if (!input || input.length > 200) throw new Error('Invalid expression');
  if (!/^[0-9+\-*/().%\s]+$/.test(input)) throw new Error('Only arithmetic expressions are allowed');
  const tokens = input.match(/\d+(?:\.\d+)?|[()+\-*/%]/g);
  if (!tokens || tokens.join('') !== input.replace(/\s/g, '')) throw new Error('Invalid expression');
  const values: number[] = [];
  const ops: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
  const apply = () => {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    if (!op || a === undefined || b === undefined) throw new Error('Invalid expression');
    if (op === '/' && b === 0) throw new Error('Cannot divide by zero');
    values.push(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? a / b : a % b);
  };
  for (const token of tokens) {
    if (/^\d/.test(token)) values.push(Number(token));
    else if (token === '(') ops.push(token);
    else if (token === ')') {
      while (ops.length && ops.at(-1) !== '(') apply();
      if (ops.pop() !== '(') throw new Error('Invalid expression');
    } else {
      while (ops.length && ops.at(-1) !== '(' && precedence[ops.at(-1)!] >= precedence[token]) apply();
      ops.push(token);
    }
  }
  while (ops.length) { if (ops.at(-1) === '(') throw new Error('Invalid expression'); apply(); }
  if (values.length !== 1 || !Number.isFinite(values[0])) throw new Error('Invalid result');
  return values[0];
}
