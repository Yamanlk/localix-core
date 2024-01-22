import { readFileSync } from "fs";

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
  const id = strings.raw
    .map((string, index) =>
      index === strings.raw.length - 1 ? string : string + `$${index + 1}`
    )
    .join("");

  const translation = translations[_options.lower ? id.toLowerCase() : id];

  if (!translation) {
    return {
      [_options.defaultLocale]: String.raw(strings, args),
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
   * @description transforms id's into lower case
   * @default false
   */
  lower?: boolean;
}

/**
 *
 * @param options
 * @description initialize localization, reads translation file and loads it to memory.
 */
export function initLocalization(options: LocalizationOptions) {
  const localizationFile = readFileSync(options.localizationFile, {
    encoding: "utf-8",
  });

  Object.assign(translations, JSON.parse(localizationFile));

  _options = options;
}
