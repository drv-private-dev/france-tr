import { checkAnswer, validateSchema, escapeHtml } from "../js/utils.js";

describe("utils.js", () => {
  describe("checkAnswer()", () => {
    it("должен вернуть true при точном совпадении", () => {
      expect(checkAnswer("abc", "abc")).to.be.true;
    });

    it("должен вернуть false при несовпадении", () => {
      expect(checkAnswer("abc", "Abc")).to.be.false;
    });

    it("должен учитывать normalization при флаге allowNormalization", () => {
      expect(checkAnswer("Test", "test", { allowNormalization: true })).to.be.true;
    });
  });

  describe("escapeHtml()", () => {
    it("должен экранировать < и >", () => {
      expect(escapeHtml("<script>")).to.equal("&lt;script&gt;");
    });
  });

  describe("validateSchema()", () => {
    it("валидный объект → valid true", () => {
      const obj = {
        Topic: "Test",
        Unit: "Unit1",
        Part1: [{ Question: "Q", Hint: "H", Answer: "A" }]
      };
      const result = validateSchema(obj);
      expect(result.valid).to.be.true;
    });

    it("невалидный объект → valid false", () => {
      const obj = { Part1: [{ Question: "Q", Hint: "" }] };
      const result = validateSchema(obj);
      expect(result.valid).to.be.false;
    });
  });
});
