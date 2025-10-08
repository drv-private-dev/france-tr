/**
 * @file questionCard.js
 * @description Класс карточки вопроса.
 */

import { checkAnswer, escapeHtml } from "./utils.js";

export class QuestionCard {
  /**
   * @param {Object} config
   * @param {Object} config.questionObj - объект { Question, Hint, Answer }
   * @param {string} config.partName - название части
   * @param {number} config.index - номер вопроса
   */
  constructor({ questionObj, partName, index }) {
    this.question = questionObj.Question;
    this.hint = questionObj.Hint;
    this.answer = questionObj.Answer;
    this.partName = partName;
    this.index = index;
    this.element = null;
  }

  /**
   * Создаёт DOM-элемент карточки.
   */
  render() {
    const card = document.createElement("div");
    card.className = "question-card";
    card.setAttribute("data-role", "question-card");

    card.innerHTML = `
      <h4>${escapeHtml(this.partName)} - Q${this.index + 1}</h4>
      <p class="question-text">${escapeHtml(this.question)}</p>
      <button type="button" class="hint-btn">Показать подсказку</button>
      <p class="hint-text" style="display:none;">${escapeHtml(this.hint)}</p>
      <input type="text" class="answer-input" aria-label="Введите ответ" />
      <button type="button" class="check-btn">Проверить</button>
      <p class="result-text" role="status" aria-live="polite"></p>
    `;

    this.element = card;

    // обработчики
    card.querySelector(".hint-btn").addEventListener("click", () => {
      card.querySelector(".hint-text").style.display = "block";
    });

    card.querySelector(".check-btn").addEventListener("click", () => {
      const userInput = card.querySelector(".answer-input").value;
      const result = checkAnswer(this.answer, userInput);
      const resultEl = card.querySelector(".result-text");
      if (result) {
        resultEl.textContent = "Правильно!";
        resultEl.style.color = "green";
      } else {
        resultEl.textContent = "Неправильно!";
        resultEl.style.color = "red";
      }
    });

    return card;
  }

  /**
   * Вставляет карточку в родительский элемент.
   * @param {HTMLElement} parent
   */
  mount(parent) {
    parent.appendChild(this.render());
  }
}
