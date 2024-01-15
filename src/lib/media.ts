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

export const imageFormatKeys = [
  'thumbnail',
  'small',
  'medium',
  'large',
] as const;

export type ImageFormat = (typeof imageFormatKeys)[number];

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

export const isObject = (value: any): value is Object =>
  value && typeof value === 'object' && !Array.isArray(value);

export const isImageMedia = (media: GenericImageMedia): media is ImageMedia =>
  isObject(media) &&
  'data' in media &&
  isObject(media.data) &&
  'attributes' in media.data &&
  isObject(media.data.attributes) &&
  'formats' in media.data.attributes &&
  isObject(media.data.attributes.formats) &&
  imageFormatKeys.every((type) => type in media.data.attributes.formats);

export const isUntransformedImageMedia = (
  media: GenericImageMedia
): media is UntransformedImageMedia =>
  isObject(media) &&
  'formats' in media &&
  isObject(media.formats) &&
  imageFormatKeys.every((type) => type in media.formats);

export const isImageDataFormat = (
  media: GenericImageMedia
): media is ImageDataFormat =>
  isObject(media) &&
  !isImageMedia(media) &&
  !isUntransformedImageMedia(media) &&
  'url' in media;

export const getStrapiMediaURL = (
  mediaOrFormat: GenericImageMedia,
  format?: ImageFormat
) => {
  let effectiveMedia = mediaOrFormat;

  if (
    !isImageMedia(effectiveMedia) &&
    !isUntransformedImageMedia(effectiveMedia) &&
    !isImageDataFormat(effectiveMedia)
  ) {
    return null;
  }

  if (format) {
    if (isImageMedia(effectiveMedia)) {
      effectiveMedia = effectiveMedia.data.attributes.formats[format];
    } else if (isUntransformedImageMedia(effectiveMedia)) {
      effectiveMedia = effectiveMedia.formats[format];
    }
  }

  console.log('effectiveMedia', effectiveMedia);

  const { url } = isImageMedia(effectiveMedia)
    ? effectiveMedia.data.attributes
    : effectiveMedia;

  return url.startsWith('/') ? getStrapiURL(url) : url;
};
