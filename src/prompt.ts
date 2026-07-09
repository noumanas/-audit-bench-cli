import * as readline from 'readline';

export function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const ENTER = ['\n', '\r'];
const CTRL_C = String.fromCharCode(3);
const BACKSPACE = [String.fromCharCode(127), '\b'];

/** Prompts for input without echoing keystrokes to the terminal. */
export function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);

    let value = '';
    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onData = (char: string) => {
      if (ENTER.includes(char)) {
        stdin.removeListener('data', onData);
        if (stdin.isTTY) stdin.setRawMode(Boolean(wasRaw));
        stdin.pause();
        process.stdout.write('\n');
        resolve(value);
      } else if (char === CTRL_C) {
        process.stdout.write('\n');
        process.exit(130);
      } else if (BACKSPACE.includes(char)) {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    };

    stdin.on('data', onData);
  });
}
