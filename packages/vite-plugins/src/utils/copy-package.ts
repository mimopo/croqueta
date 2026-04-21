import { existsSync } from 'node:fs';

import { readJsonFile } from './read-json-file.ts';
import { writeJsonFile } from './write-json-file.ts';

export function copyPackage(source: string, destination: string, override?: Record<string, unknown>) {
  const sourcePackage = readJsonFile(source);
  const rootPackage = readJsonFile(`${import.meta.dirname}/../../../../package.json`);

  if (existsSync(destination)) {
    throw new Error(`package.json already exists at ${destination}`);
  }
  try {
    const { name, type, bin, description, sideEffects } = sourcePackage;
    const { license, version, author, keywords, repository } = rootPackage;
    const dependencies: Record<string, string> = {};
    for (const d in sourcePackage.dependencies) {
      if (sourcePackage.dependencies[d] !== '*') {
        throw new Error(`Dependency ${d} is not a wildcard (${sourcePackage.dependencies[d]}) in source package.json`);
      }
      dependencies[d] = rootPackage.dependencies[d];
      if (dependencies[d] === undefined) {
        throw new Error(`Dependency ${d} not found in root package.json`);
      }
    }
    const packageJson = {
      name,
      version,
      description: description ?? rootPackage.description,
      type,
      license,
      author,
      keywords,
      bin,
      dependencies,
      sideEffects,
      repository,
      ...override,
    };
    writeJsonFile(destination, packageJson);
    return true;
  } catch (err) {
    throw new Error('failed to copy package.json', { cause: err });
  }
}
