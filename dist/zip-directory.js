"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipDirectory = zipDirectory;
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs_1 = require("fs");
const path_1 = require("path");
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'venv', '.venv']);
const MAX_FILES = 2000;
function walk(dir, root, out) {
    for (const entry of (0, fs_1.readdirSync)(dir)) {
        if (EXCLUDED_DIRS.has(entry))
            continue;
        const full = (0, path_1.join)(dir, entry);
        const stat = (0, fs_1.statSync)(full);
        if (stat.isDirectory()) {
            walk(full, root, out);
        }
        else if (stat.isFile()) {
            out.push((0, path_1.relative)(root, full));
            if (out.length > MAX_FILES)
                return;
        }
    }
}
/** Zips a directory in memory, skipping common dependency/build folders. */
function zipDirectory(dirPath) {
    const files = [];
    walk(dirPath, dirPath, files);
    const zip = new adm_zip_1.default();
    for (const relPath of files.slice(0, MAX_FILES)) {
        const folder = (0, path_1.dirname)(relPath);
        zip.addLocalFile((0, path_1.join)(dirPath, relPath), folder === '.' ? '' : folder);
    }
    return zip.toBuffer();
}
