import cheerio, { CheerioAPI } from 'cheerio';
import scrapeOpenGraphData from 'open-graph-scraper';
import { ParseResult } from './types';

export interface ParseOptions {
  parser?: CheerioAPI;
}
export async function parse(
  content: string,
  { parser = cheerio }: ParseOptions
): Promise<ParseResult> {
  if (!content) {
    throw new Error("Failed to retrieve page content");
  }

  const $ = parser.load(content);

  /**
   * Scrape OpenGraph data from page html
   */
  const { result: openGraph } = await scrapeOpenGraphData({
    url: "",
    html: content,
  });

  /**
   * Scrape LinkedData from html if present.
   */
  const linkedDataElement = $('script[type="application/ld+json"]');
  let linkedData: ParseResult["linkedData"] = null;
  try {
    linkedData = JSON.parse(linkedDataElement.html()!);
  } catch (err) {
    console.warn("Failed to retrieve linked data", err);
  }

  return {
    openGraph,
    linkedData,
    document: $,
  };
}
