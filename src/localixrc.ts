import fs from "fs";
import path from "path";
import { LocalizationOptions } from ".";

/**
 * @description finds and parses .localixrc file in current or any parent directory.
 * @returns
 */
export function readLocalixrc(): LocalizationOptions | null {
  let currentDir = process.cwd();
  while (currentDir !== "/") {
    const localixrcPath = path.join(currentDir, ".localixrc");
    if (fs.existsSync(localixrcPath)) {
      const options = JSON.parse(fs.readFileSync(localixrcPath, "utf-8"));

      return {
        ...options,
        localizationFile: path.resolve(currentDir, options.output),
      };
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}
