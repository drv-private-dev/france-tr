/**
 * @file fileLoader.js
 * @description Загрузка и парсинг JSON-файла через FileReader.
 */

import { validateSchema } from "./utils.js";

/**
 * Загружает JSON-файл и возвращает объект.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function loadJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const { valid, errors } = validateSchema(data);
        if (!valid) {
          reject(new Error("Invalid JSON structure: " + errors.join(", ")));
        } else {
          resolve(data);
        }
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Преобразует «сырой» объект JSON в удобную структуру для рендера.
 * @param {Object} raw
 * @returns {Object} parsed
 */
export function parseData(raw) {
  const topic = raw.Topic || "";
  const unit = raw.Unit || "";
  const parts = [];

  Object.keys(raw).forEach((key) => {
    if (key.startsWith("Part")) {
      parts.push({
        name: key,
        questions: raw[key]
      });
    }
  });

  return { topic, unit, parts };
}
