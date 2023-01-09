import scraper from "../src";
import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import * as fs from "fs";
import * as path from "path";

describe("scraper", () => {
  it("should provide an initialization interface", () => {
    expect(scraper.scrape).toBeDefined();
  });
});

describe("scraping", () => {
  it("should scrape metadata from a given url", async () => {
    const url =
      "https://barackobama.medium.com/my-2022-end-of-year-lists-ba76b6278801";
    const result = await scraper.scrape(url);

    expect(result.html).toBeTruthy();
    expect(result.featureImage!.src).toEqual(
      "https://miro.medium.com/max/960/1*Fm3OR_ORrkhUxF_fkKRvsw.png"
    );
    expect(result.openGraph.ogTitle).toEqual("My 2022 End of Year Lists");
    expect(result.linkedData).toBeTruthy();
    expect(result.images.length).toBeGreaterThan(0);
    expect(result.images[0].url).toEqual(result.featureImage!.url);
  });
});

describe("options", () => {
  it("should allow for override of the http adapter", async () => {
    const customAxios = axios.create();
    const mockHttp = new MockAdapter(customAxios);

    const dummyPageContent = fs.readFileSync(
      path.join(__dirname, "dummy.html"),
      "utf8"
    );
    mockHttp.onGet("fake-url").reply(200, dummyPageContent);

    const { featureImage } = await scraper.scrape("fake-url", {
      client: customAxios,
    });
    expect(featureImage!.src).toEqual(
      "https://miro.medium.com/max/1200/0*_K6j83V2soow_A2c"
    );
  });
});

describe("errors", () => {
  it("should throw an error if a given url is invalid", async () => {
    let badUrls: string[] = [
      "",
      "htp://example.com",
      "fasdfasdf",
      // @ts-ignore
      null,
      // @ts-expect-error
      () => {
        throw new Error();
      },
      // @ts-expect-error
      1e5,
    ];
    for (const badUrl of badUrls) {
      await expect(scraper.scrape(badUrl)).rejects.toBeTruthy();
    }
  });
});
