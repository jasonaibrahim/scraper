import scraper from "../src";
import { describe, it, expect } from "@jest/globals";

describe("scraper", () => {
  it("should provide an initialization interface", () => {
    expect(scraper.scrape).toBeDefined();
  });
});
