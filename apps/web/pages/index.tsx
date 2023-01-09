import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import type { ScrapeResult } from "@scraper-js/core";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);

  async function onSubmit() {
    setError("");

    try {
      const url = new URL(input);
      const res = await fetch(`/api/scrape?url=${url.href}`).then(
        async (res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            const message = await res.json();
            throw new Error(message.error);
          }
        }
      );
      setScrapeResult(res);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <Head>
        <title>scraper-js</title>
        <meta
          name="description"
          content="From the Bay to LA, scraper lets you scrape a url for images, content, links, and more, fast."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <h1>scraper-js</h1>
          <a href="https://github.com/jasonaibrahim/scraper">
            <Image src={"/github.svg"} alt={"GitHub"} width={24} height={24} />
          </a>
        </div>

        <div className={styles.center}>
          <div className={styles.form}>
            <input
              type="text"
              className={styles.input}
              placeholder={"Enter URL"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className={styles.button} onClick={onSubmit}>
              Scrape
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {scrapeResult?.featureImage && (
          <div className={styles.result}>
            <p>Feature Image</p>
            <figure className={styles.featureImage}>
              <img src={scrapeResult.featureImage.src} alt={"Feature Image"} />
            </figure>
          </div>
        )}

        <div className={styles.grid}>
          <a
            href="/#"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Learn how to use the scraper web service.
            </p>
          </a>

          <a
            href="https://github.com/jasonaibrahim/scraper"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Library <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Use the scraper-js library in your own project.
            </p>
          </a>
        </div>
      </main>
    </>
  );
}
