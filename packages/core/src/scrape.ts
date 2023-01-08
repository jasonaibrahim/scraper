import axios, { AxiosInstance } from 'axios';
import { Thing } from 'schema-dts';
import scrapeOpenGraphData from 'open-graph-scraper';
import { featureImageFromParseResult, ImageExtractOptions, imagesFromParseResult } from './image';
import { parse, ParseOptions } from './parse';
import { RankedImage } from './types';

export type ScrapeOptions = Pick<ImageExtractOptions, "rankImage"> &
  Pick<ParseOptions, "parser"> & {
    client: AxiosInstance;
  };

export interface ScrapeResult {
  html: string;
  images: RankedImage[];
  linkedData: Thing | null;
  openGraph:
    | scrapeOpenGraphData.successResultObject
    | scrapeOpenGraphData.errorResultObject;
  featureImage?: RankedImage | null;
}

export async function scrape(
  url: string,
  options: ScrapeOptions = {
    client: axios.create({
      timeout: 1000,
    }),
  }
): Promise<ScrapeResult> {
  const { client } = options;

  const response = await client.get(url);
  const result = await parse(response.data, {
    parser: options.parser,
  });

  return {
    featureImage: featureImageFromParseResult(result, {
      rankImage: options.rankImage,
    }),
    images: imagesFromParseResult(result, {
      rankImage: options.rankImage,
    }),
    html: result.document.html(),
    linkedData: result.linkedData,
    openGraph: result.openGraph,
  };
}
