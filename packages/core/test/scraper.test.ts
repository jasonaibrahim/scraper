import scraper from '../src';
import { describe, expect, it } from '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

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
      "https://miro.medium.com/max/1200/1*Fm3OR_ORrkhUxF_fkKRvsw.png"
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

    const dummyPageContent = `
<html>
  <head>
    <meta property="og:image" content="https://miro.medium.com/max/1200/0*_K6j83V2soow_A2c" />  
  </head>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"NewsArticle","image":["https://miro.medium.com/max/1200/0*_K6j83V2soow_A2c"],"url":"https://medium.com/@kennykuykendall/what-you-probably-dont-know-about-your-pastor-when-he-preaches-b8475add8537","dateCreated":"2023-01-03T18:24:31.738Z","datePublished":"2023-01-03T18:24:31.738Z","dateModified":"2023-01-05T20:43:49.962Z","headline":"What You Probably Don’t Know About Your Pastor When He Preaches","name":"What You Probably Don’t Know About Your Pastor When He Preaches","description":"What happens when your preacher preaches? I know…that’s a loaded question. I guess I should state it this way: Are you aware of what takes place when the pastor gets up to expound Scripture? More…","identifier":"b8475add8537","author":{"@type":"Person","name":"Kenny Kuykendall","url":"https://medium.com/@kennykuykendall"},"creator":["Kenny Kuykendall"],"publisher":{"@type":"Organization","name":"Medium","url":"https://medium.com/","logo":{"@type":"ImageObject","width":308,"height":60,"url":"https://miro.medium.com/max/616/1*OMF3fSqH8t4xBJ9-6oZDZw.png"}},"mainEntityOfPage":"https://medium.com/@kennykuykendall/what-you-probably-dont-know-about-your-pastor-when-he-preaches-b8475add8537"}
  </script>
</html>
    `;
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
      // @ts-expect-error
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
