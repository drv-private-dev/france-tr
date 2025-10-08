/**
 * @file app.js
 * @description Точка входа. Инициализация приложения: выбор файла, загрузка JSON, рендеринг вопросов, смена языка/темы.
 */

import { loadJsonFile, parseData } from "./fileLoader.js";
import { renderAll } from "./renderer.js";

// i18n словарь интерфейса
const i18n = {
  ua: {
    title: "Тренажер питань",
    fileLabel: "Завантажте файл із завданнями (JSON):",
    footer: "© 2025 Тренажер. Для тестування JSON-файлів.",
    statusError: "Помилка завантаження файлу!"
  },
  ru: {
    title: "Тренажёр вопросов",
    fileLabel: "Загрузите файл с заданиями (JSON):",
    footer: "© 2025 Тренажёр. Для тестирования JSON-файлов.",
    statusError: "Ошибка загрузки файла!"
  },
  en: {
    title: "Question Trainer",
    fileLabel: "Upload a JSON file with questions:",
    footer: "© 2025 Trainer. For testing JSON files.",
    statusError: "File loading error!"
  },
  fr: {
    title: "Entraîneur de questions",
    fileLabel: "Téléchargez un fichier JSON avec des questions :",
    footer: "© 2025 Entraîneur. Pour tester les fichiers JSON.",
    statusError: "Erreur de chargement du fichier!"
  }
};

/**
 * Меняет язык и цветовую схему интерфейса.
 * @param {string} lang - Код языка (ua, ru, en, fr)
 */
function switchLanguage(lang) {
  // меняем тему
  document.body.setAttribute("data-theme", lang);

  // обновляем тексты
  document.getElementById("app-title").textContent = i18n[lang].title;
  document.getElementById("file-label").textContent = i18n[lang].fileLabel;
  document.getElementById("footer-text").textContent = i18n[lang].footer;
}

// Слушатель для смены языка
const langSelect = document.getElementById("lang-select");
langSelect.addEventListener("change", (e) => {
  switchLanguage(e.target.value);
});

// Слушатель загрузки файла
const fileInput = document.getElementById("file-input");
const statusMessage = document.getElementById("status-message");

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const rawData = await loadJsonFile(file);
    const parsed = parseData(rawData);
    renderAll(parsed, document.getElementById("questions"));
    statusMessage.textContent = "";
  } catch (err) {
    console.error(err);
    const lang = langSelect.value;
    statusMessage.textContent = i18n[lang].statusError + " " + err.message;
  }
});

// ✅ при запуске приложения используем текущее значение селектора языка
document.addEventListener("DOMContentLoaded", () => {
  const initialLang = langSelect.value || "ua";
  switchLanguage(initialLang);
});
