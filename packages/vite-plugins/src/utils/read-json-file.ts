import { readFileSync } from 'node:fs';

export function readJsonFile<T = any>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8'));
}
