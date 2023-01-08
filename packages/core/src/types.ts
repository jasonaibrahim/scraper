import { CheerioAPI } from "cheerio";
import { Thing } from "schema-dts";
import type scrapeOpenGraphData from "open-graph-scraper";

export interface ParseResult {
  linkedData: Thing | null;
  openGraph:
    | scrapeOpenGraphData.successResultObject
    | scrapeOpenGraphData.errorResultObject;
  document: CheerioAPI;
}

export enum ImageSource {
  LinkedData = "linked_data",
  OpenGraph = "opengraph",
  DOM = "dom",
}
export interface ImageMetadata extends Record<string, string | number> {
  width: number;
  height: number;
  sourceType: ImageSource;
  src: string;
}

export interface RankedImage extends ImageMetadata {
  rank: number;
}
