import { readFileSync } from "fs";
import { readLocalixrc } from "./localixrc";

/**
 * @description localization map
 */
const translations: Record<string, Record<string, string>> = {};
let _options: LocalizationOptions;

/**
 *
 * @param strings
 * @param args
 * @returns object containing locale as key and localized string as value
 */
export function localize(
  strings: TemplateStringsArray,
  ...args: any[]
): Record<string, string> {
  const options = getOptions();

  const id = strings.raw
    .map((string, index) =>
      index === strings.raw.length - 1 ? string : string + `$${index + 1}`
    )
    .join("");

  const casing =
    options.casing === "lower"
      ? (id: string) => id.toLowerCase()
      : options.casing === "upper"
      ? (id: string) => id.toUpperCase()
      : (id: string) => id;

  const translation = translations[casing(id)];

  if (!translation) {
    return {
      [options.defaultLocale]: String.raw(strings, args),
    };
  }

  return Object.keys(translation).reduce((acc, locale) => {
    let interpolated = translation[locale];

    args.forEach((arg, index) => {
      interpolated = interpolated.replace(
        new RegExp(`\\$${index + 1}`, "g"),
        arg
      );
    });

    return {
      ...acc,
      [locale]: interpolated,
    };
  }, {});
}

export interface LocalizationOptions {
  /**
   * @description default locale when translations not found.
   */
  defaultLocale: string;
  /**
   * @description json localization file path.
   */
  localizationFile: string;

  /**
   * @description transforms id's into lower or upper case or leaves it as is.
   * @default false
   */
  casing?: "lower" | "upper" | "none";
}

/**
 *
 * @description initialize localization based on .localixrc file, reads translation file and loads it to memory, if already initialized returns options.
 */
function getOptions() {
  if (_options) {
    return _options;
  }

  const options = readLocalixrc();

  if (!options) {
    throw new Error(".localixrc file was not found");
  }

  const localizationFile = readFileSync(options.localizationFile, {
    encoding: "utf-8",
  });

  Object.assign(translations, JSON.parse(localizationFile));

  _options = options;

  return _options;
}
