import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const FILES_ROOT = path.resolve(__dirname, "../files");

export function resolveFile(scriptPath) {
  const absolutePath = path.resolve(FILES_ROOT, scriptPath);
  const rootWithSep = FILES_ROOT + path.sep;

  if (!absolutePath.startsWith(rootWithSep) && absolutePath !== FILES_ROOT) {
    return null;
  }

  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    return null;
  }

  return absolutePath;
}

export function fileExists(scriptPath) {
  return resolveFile(scriptPath) !== null;
}

export function readFile(scriptPath) {
  const absolutePath = resolveFile(scriptPath);
  if (!absolutePath) {
    return null;
  }
  return fs.readFileSync(absolutePath, "utf8");
}
