import { ImageMetadata, ImageSource, ParseResult, RankedImage } from "./types";

export interface ImageExtractOptions {
  rankImage?: (imageMetadata: ImageMetadata) => number;
  mode?: "fast" | "hq";
}

const defaultRankAlgorithm: ImageExtractOptions["rankImage"] = (
  imageMetadata
) => {
  /**
   * Downrank images with no `src` attribute
   */
  if (!imageMetadata.src) {
    return -1;
  }

  return 0;
};

export function featureImageFromParseResult(
  result: ParseResult,
  options: ImageExtractOptions = {
    mode: "hq",
  }
): RankedImage | null {
  return imagesFromParseResult(result, options).shift() ?? null;
}

export function imagesFromParseResult(
  result: ParseResult,
  options: ImageExtractOptions = {}
): Array<RankedImage> {
  let images: ImageMetadata[] = [];

  if (result.linkedData) {
    // @ts-ignore - type is not being inferred but is SchemaValue<ImageObject | URL | IdReference, "image">
    const { image } = result.linkedData;

    if (Array.isArray(image)) {
      for (const img of image) {
        if (typeof img === "string") {
          images.push({
            width: 0,
            height: 0,
            src: img,
            sourceType: ImageSource.LinkedData,
          });
        } else {
          const width = parseInt(img.width ?? 0);
          const height = parseInt(img.height ?? 0);
          const src = img.contentUrl;

          images.push({
            width,
            height,
            src,
            sourceType: ImageSource.LinkedData,
          });
        }
      }
    } else if (typeof image === "string") {
      images.push({
        width: 0,
        height: 0,
        src: image,
        sourceType: ImageSource.LinkedData,
      });
    } else {
      const width = parseInt(image.width ?? 0);
      const height = parseInt(image.height ?? 0);
      const src = image.contentUrl;

      images.push({
        width,
        height,
        src,
        sourceType: ImageSource.LinkedData,
      });
    }
  }

  if (result.openGraph.ogImage) {
    const image = result.openGraph.ogImage;

    if (typeof image === "string") {
      /**
       * Handle type string
       */
      images.push({
        width: 0,
        height: 0,
        src: image,
        sourceType: ImageSource.OpenGraph,
      });
    } else if (Array.isArray(image)) {
      /**
       * Handle Array<ImageObject | string>
       */
      for (const img of image) {
        let width = 0;
        let height = 0;
        let src: string;

        if (typeof img === "string") {
          src = img;
        } else {
          src = img.url;
          width = parseInt(`${img.width}`);
          height = parseInt(`${img.height}`);
        }

        images.push({
          ...img,
          width,
          height,
          src,
          sourceType: ImageSource.OpenGraph,
        });
      }
    } else {
      /**
       * Handle type ImageObject
       *
       */
      let width = parseInt(`${image.width}`);
      let height = parseInt(`${image.height}`);
      let src = image.url;
      images.push({
        ...image,
        width,
        height,
        src,
        sourceType: ImageSource.OpenGraph,
      });
    }
  }

  const tags = result.document("img");
  for (const tag of tags) {
    const width = parseInt(tag.attribs["width"] ?? 0);
    const height = parseInt(tag.attribs["height"] ?? 0);
    const src = tag.attribs["src"];

    images.push({
      width,
      height,
      src,
      sourceType: ImageSource.DOM,
    });
  }

  return sortedByRank(images, options.rankImage);
}

function sortedByRank(
  images: Array<ImageMetadata>,
  rankImage: ImageExtractOptions["rankImage"] = defaultRankAlgorithm
): Array<RankedImage> {
  let ranked: RankedImage[] = [];

  for (const image of images) {
    ranked.push({
      ...image,
      rank: rankImage!(image),
    });
  }

  return ranked.sort((a, b) => b.rank - a.rank);
}
