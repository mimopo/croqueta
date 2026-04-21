import { writeFileSync } from 'node:fs';

export function writeJsonFile(path: string, json: any) {
  writeFileSync(path, JSON.stringify(json, null, 2));
}
