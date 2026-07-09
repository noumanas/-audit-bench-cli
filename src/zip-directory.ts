import AdmZip from 'adm-zip';
import { readdirSync, statSync } from 'fs';
import { dirname, join, relative } from 'path';

const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'venv', '.venv']);
const MAX_FILES = 2000;

function walk(dir: string, root: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (EXCLUDED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, root, out);
    } else if (stat.isFile()) {
      out.push(relative(root, full));
      if (out.length > MAX_FILES) return;
    }
  }
}

/** Zips a directory in memory, skipping common dependency/build folders. */
export function zipDirectory(dirPath: string): Buffer {
  const files: string[] = [];
  walk(dirPath, dirPath, files);

  const zip = new AdmZip();
  for (const relPath of files.slice(0, MAX_FILES)) {
    const folder = dirname(relPath);
    zip.addLocalFile(join(dirPath, relPath), folder === '.' ? '' : folder);
  }
  return zip.toBuffer();
}
