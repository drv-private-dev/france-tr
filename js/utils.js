/**
 * @file utils.js
 * @description Утилитарные функции: валидация, проверка ответов, экранирование HTML.
 */

/**
 * Проверяет схему JSON.
 * @param {Object} obj
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateSchema(obj) {
  const errors = [];
  if (!obj) {
    errors.push("Empty object");
  }

  Object.keys(obj).forEach((key) => {
    if (key.startsWith("Part")) {
      if (!Array.isArray(obj[key])) {
        errors.push(`${key} must be an array`);
      } else {
        obj[key].forEach((q, idx) => {
          if (!q.Question) errors.push(`${key}[${idx}].Question missing`);
          if (!q.Hint) errors.push(`${key}[${idx}].Hint missing`);
          if (typeof q.Answer === "undefined")
            errors.push(`${key}[${idx}].Answer missing`);
        });
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Проверка ответа (строгое сравнение).
 * @param {string} expected
 * @param {string} actual
 * @param {Object} [options]
 * @param {boolean} [options.allowNormalization=false]
 * @returns {boolean}
 */
export function checkAnswer(
  expected,
  actual,
  options = { allowNormalization: true }
) {
  const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  if (options.allowNormalization) {
    const normalizedExpected = removeDiacritics(expected.trim().toLowerCase());
    const normalizedActual = removeDiacritics(actual.trim().toLowerCase());
    return normalizedExpected === normalizedActual;
  }

  return expected === actual;
}

/**
 * Экранирует HTML для безопасного вывода.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
