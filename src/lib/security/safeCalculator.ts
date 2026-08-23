export function safeCalculator(expression: string): number {
  const input = expression.trim();
  if (!input || input.length > 200) throw new Error('Invalid expression');
  if (!/^[0-9+\-*/().%\s]+$/.test(input)) throw new Error('Only arithmetic expressions are allowed');
  if (/([+\-*/%.])\1{2,}/.test(input)) throw new Error('Invalid expression');
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
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^\d/.test(t)) values.push(Number(t));
    else if (t === '(') ops.push(t);
    else if (t === ')') { while (ops.length && ops.at(-1) !== '(') apply(); if (ops.pop() !== '(') throw new Error('Invalid expression'); }
    else {
      while (ops.length && ops.at(-1) !== '(' && precedence[ops.at(-1]] >= precedence[t]) apply();
      ops.push(t);
    }
  }
  while (ops.length) { if (ops.at(-1) === '(') throw new Error('Invalid expression'); apply(); }
  if (values.length !== 1 || !Number.isFinite(values[0])) throw new Error('Invalid result');
  return values[0];
}
