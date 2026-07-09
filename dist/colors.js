"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = void 0;
exports.severityColor = severityColor;
exports.verdictColor = verdictColor;
const codes = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
};
function wrap(code, text) {
    if (!process.stdout.isTTY)
        return text;
    return `${code}${text}${codes.reset}`;
}
exports.color = {
    bold: (s) => wrap(codes.bold, s),
    red: (s) => wrap(codes.red, s),
    yellow: (s) => wrap(codes.yellow, s),
    green: (s) => wrap(codes.green, s),
    blue: (s) => wrap(codes.blue, s),
    gray: (s) => wrap(codes.gray, s),
};
function severityColor(severity) {
    switch (severity) {
        case 'critical':
            return exports.color.red(severity.toUpperCase());
        case 'high':
            return exports.color.yellow(severity.toUpperCase());
        case 'medium':
            return exports.color.blue(severity.toUpperCase());
        default:
            return exports.color.gray(severity.toUpperCase());
    }
}
function verdictColor(verdict) {
    switch (verdict) {
        case 'pass':
            return exports.color.green(verdict.toUpperCase());
        case 'do_not_ship':
            return exports.color.red(verdict.toUpperCase());
        default:
            return exports.color.yellow(verdict.toUpperCase());
    }
}
