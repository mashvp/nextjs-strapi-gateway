import { getStrapiURL } from './api';

export interface ImageDataFormat {
  name: string;
  hash: string;
  url: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
}

export interface ImageData extends ImageDataFormat {
  alternativeText?: string;
  formats: { [key: string]: ImageDataFormat };
  blurhash?: string;
}

export interface ImageMedia {
  data: {
    id: number;
    attributes: ImageData;
  };
}

export const getStrapiMediaURL = (
  mediaOrFormat: ImageMedia | ImageDataFormat
) => {
  const format: ImageDataFormat =
    'data' in mediaOrFormat ? mediaOrFormat.data.attributes : mediaOrFormat;

  const { url } = format;

  return url.startsWith('/') ? getStrapiURL(url) : url;
};
