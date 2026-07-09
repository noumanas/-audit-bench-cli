const codes = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function wrap(code: string, text: string): string {
  if (!process.stdout.isTTY) return text;
  return `${code}${text}${codes.reset}`;
}

export const color = {
  bold: (s: string) => wrap(codes.bold, s),
  red: (s: string) => wrap(codes.red, s),
  yellow: (s: string) => wrap(codes.yellow, s),
  green: (s: string) => wrap(codes.green, s),
  blue: (s: string) => wrap(codes.blue, s),
  gray: (s: string) => wrap(codes.gray, s),
};

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return color.red(severity.toUpperCase());
    case 'high':
      return color.yellow(severity.toUpperCase());
    case 'medium':
      return color.blue(severity.toUpperCase());
    default:
      return color.gray(severity.toUpperCase());
  }
}

export function verdictColor(verdict: string): string {
  switch (verdict) {
    case 'pass':
      return color.green(verdict.toUpperCase());
    case 'do_not_ship':
      return color.red(verdict.toUpperCase());
    default:
      return color.yellow(verdict.toUpperCase());
  }
}
