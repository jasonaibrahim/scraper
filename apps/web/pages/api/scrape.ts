// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import scraper, { ScrapeResult } from "@scraper-js/core";

type Data =
  | ScrapeResult
  | {
      error?: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { url } = req.query;
  if (url) {
    if (typeof url === "string") {
      const result = await scraper.scrape(url);
      res.status(200).json(result);
    } else {
      res.status(400).json({ error: "`url` cannot be an array" });
    }
  } else {
    res.status(400).json({ error: "`url` is a required field" });
  }
}
