import { afterEach, describe, expect, it } from "vitest";
import {
  KIND_TEXT, LANGS, dateHeadline, isLang, monthHeadline, setGlobalLang,
  t, translateDefaultText, translateDefaultFrameName,
} from "./i18n";
import { buildPrompt, promptMarks, PROMPT_OPTION_TEXT } from "./prompt";
import { makeItem, type Doc } from "./tokens";

describe("Vietnamese localization", () => {
  afterEach(() => setGlobalLang("ja"));

  it("offers Tiếng Việt and accepts it as a saved language", () => {
    expect(LANGS.find((entry) => entry.key === "vi")?.label).toBe("Tiếng Việt");
    expect(isLang("vi")).toBe(true);
    expect(t("clearAllTitle", "vi")).toBe("Xóa toàn bộ canvas?");
    expect(t("askAiText", "vi")).toContain("{url}");
    expect(t("askAiText", "vi")).toContain("{idea}");
  });

  it("translates seed labels and new component defaults while keeping user-entered text", () => {
    setGlobalLang("vi");
    expect(makeItem("button").label).toBe(KIND_TEXT.vi.button.label);
    expect(translateDefaultText("Button", "button", "label", "vi")).toBe("Nút");
    expect(translateDefaultText("Custom name", "button", "label", "vi")).toBe("Custom name");
    expect(translateDefaultFrameName("Home", "vi")).toBe("Trang chủ");
  });

  it("uses vi-VN date formatting", () => {
    const date = new Date("2026-03-17T12:00:00Z");
    expect(dateHeadline("vi", date)).toBe(new Intl.DateTimeFormat("vi-VN", { weekday: "short", month: "short", day: "numeric" }).format(date));
    expect(monthHeadline("vi", date)).toBe(new Intl.DateTimeFormat("vi-VN", { year: "numeric", month: "long" }).format(date));
  });

  it("generates Vietnamese prompt headings, component descriptions and outline", () => {
    setGlobalLang("vi");
    const doc: Doc = {
      groups: [{ id: "g", x: 16, y: 100, axis: "x", items: [{ ...makeItem("button"), id: "b", label: "Lưu" }] }],
      frames: [{ id: "f", name: "Trang chủ", x: 0, y: 0 }],
      paletteKey: "purple",
      frame: "phone",
      platform: "web",
      title: "Ứng dụng thử",
      brief: "",
    };
    const prompt = buildPrompt(doc, {}, undefined, "vi");
    expect(prompt).toContain("## Màu sắc");
    expect(prompt).toContain("## Bố cục");
    expect(prompt).toContain("## Kiểu thành phần");
    expect(prompt).toContain("## Hướng dẫn chung");
    expect(prompt).toContain("nút nền đặc");
    expect(prompt).toContain('Màn hình "Trang chủ"');
    const marks = promptMarks(prompt, doc.frames, "vi");
    expect(marks.some((m) => m.kind === "screen" && m.frameId === "f")).toBe(true);
    expect(PROMPT_OPTION_TEXT.vi.languages.label).toBe("Tiếng Việt và tiếng Anh");
  });
});
