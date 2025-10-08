import { QuestionCard } from "../js/questionCard.js";

describe("questionCard.js", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("должен рендерить вопрос и кнопку подсказки", () => {
    const card = new QuestionCard({
      questionObj: { Question: "Q1", Hint: "H1", Answer: "A1" },
      partName: "Part1",
      index: 0
    });
    card.mount(container);
    expect(container.querySelector(".question-text").textContent).to.equal("Q1");
    expect(container.querySelector(".hint-btn")).to.exist;
  });

  it("по клику на 'Показать подсказку' должна отображаться подсказка", () => {
    const card = new QuestionCard({
      questionObj: { Question: "Q2", Hint: "H2", Answer: "A2" },
      partName: "Part1",
      index: 1
    });
    card.mount(container);
    const btn = container.querySelector(".hint-btn");
    btn.click();
    expect(container.querySelector(".hint-text").style.display).to.equal("block");
  });

  it("проверка ответа должна выводить результат", () => {
    const card = new QuestionCard({
      questionObj: { Question: "Q3", Hint: "H3", Answer: "A3" },
      partName: "Part1",
      index: 2
    });
    card.mount(container);
    const input = container.querySelector(".answer-input");
    input.value = "A3";
    container.querySelector(".check-btn").click();
    expect(container.querySelector(".result-text").textContent).to.include("Правильно");
  });
});
