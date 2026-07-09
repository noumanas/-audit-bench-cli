"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.prompt = prompt;
exports.promptHidden = promptHidden;
const readline = __importStar(require("readline"));
function prompt(question) {
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
function promptHidden(question) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        process.stdout.write(question);
        let value = '';
        const wasRaw = stdin.isRaw;
        if (stdin.isTTY)
            stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        const onData = (char) => {
            if (ENTER.includes(char)) {
                stdin.removeListener('data', onData);
                if (stdin.isTTY)
                    stdin.setRawMode(Boolean(wasRaw));
                stdin.pause();
                process.stdout.write('\n');
                resolve(value);
            }
            else if (char === CTRL_C) {
                process.stdout.write('\n');
                process.exit(130);
            }
            else if (BACKSPACE.includes(char)) {
                value = value.slice(0, -1);
            }
            else {
                value += char;
            }
        };
        stdin.on('data', onData);
    });
}
