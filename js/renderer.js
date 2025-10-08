/**
 * @file renderer.js
 * @description Рендеринг структуры в DOM.
 */

import { QuestionCard } from "./questionCard.js";

/**
 * Рендерит все части и вопросы.
 * @param {Object} parsed - структура { topic, unit, parts }
 * @param {HTMLElement} container - контейнер для рендера
 */
export function renderAll(parsed, container) {
  container.innerHTML = "";

  // Заголовки
  document.getElementById("topic").textContent = parsed.topic;
  document.getElementById("unit").textContent = parsed.unit;

  parsed.parts.forEach((part) => {
    const partHeader = document.createElement("h3");
    partHeader.textContent = part.name;
    container.appendChild(partHeader);

    part.questions.forEach((q, idx) => {
      const card = new QuestionCard({ questionObj: q, partName: part.name, index: idx });
      card.mount(container);
    });
  });
}
