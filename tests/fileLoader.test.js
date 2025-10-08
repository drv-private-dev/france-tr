import { loadJsonFile, parseData } from "../js/fileLoader.js";

// Вспомогательный метод: создать File
function createFile(obj) {
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  return new File([blob], "test.json", { type: "application/json" });
}

describe("fileLoader.js", () => {
  it("должен корректно загружать JSON", async () => {
    const file = createFile({
      Topic: "Topic1",
      Unit: "Unit1",
      Part1: [{ Question: "Q", Hint: "H", Answer: "A" }]
    });
    const data = await loadJsonFile(file);
    expect(data.Topic).to.equal("Topic1");
  });

  it("parseData() должен выделять части", () => {
    const raw = {
      Topic: "T",
      Unit: "U",
      Part1: [{ Question: "Q", Hint: "H", Answer: "A" }]
    };
    const parsed = parseData(raw);
    expect(parsed.parts).to.have.lengthOf(1);
    expect(parsed.parts[0].questions[0].Question).to.equal("Q");
  });
});
