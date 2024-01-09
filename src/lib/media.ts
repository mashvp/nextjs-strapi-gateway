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

export type ImageFormat = 'thumbnail' | 'small' | 'medium' | 'large';

export interface ImageData extends ImageDataFormat {
  alternativeText?: string;
  blurhash?: string;
  formats: {
    [key in ImageFormat]: ImageDataFormat;
  };
}

export type ImageDataWithoutFormat = Omit<ImageData, 'formats'>;

export interface ImageMedia<T extends ImageData = ImageData> {
  data: {
    id: number;
    attributes: T;
  };
}

export type UntransformedImageMedia<T extends ImageData = ImageData> = T & {
  id: number;
};

export type GenericImageMedia =
  | ImageMedia
  | ImageDataFormat
  | UntransformedImageMedia;

export const isImageMedia = (media: GenericImageMedia): media is ImageMedia =>
  'data' in media;

export const isUntransformedImageMedia = (
  media: GenericImageMedia
): media is UntransformedImageMedia => 'formats' in media;

export const isImageDataFormat = (
  media: GenericImageMedia
): media is ImageDataFormat =>
  !isImageMedia(media) && !isUntransformedImageMedia(media);

export const getStrapiMediaURL = (
  mediaOrFormat: GenericImageMedia,
  format?: ImageFormat
) => {
  const effectiveMedia =
    format && isImageMedia(mediaOrFormat)
      ? mediaOrFormat.data.attributes.formats[format]
      : mediaOrFormat;

  const { url } = isImageMedia(effectiveMedia)
    ? effectiveMedia.data.attributes
    : effectiveMedia;

  return url.startsWith('/') ? getStrapiURL(url) : url;
};
