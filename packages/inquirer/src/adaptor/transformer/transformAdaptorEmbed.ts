import { transformers } from "./index";

import type {
  AdaptorEmbed,
  AdaptorEmbedAuthor,
  AdaptorEmbedField,
  AdaptorEmbedFooter,
  AdaptorEmbedImage,
  AdaptorEmbedThumbnail,
} from "../structure";
import type {
  APIEmbed,
  APIEmbedAuthor,
  APIEmbedField,
  APIEmbedFooter,
  APIEmbedImage,
  APIEmbedThumbnail,
} from "discord-api-types/v10";

const transformAdaptorEmbed = (embed: AdaptorEmbed): APIEmbed => ({
  title: embed.title,
  description: embed.description,
  url: embed.url,
  timestamp: transformers.transformAdaptorTimeStamp?.(embed.timestamp),
  color: transformers.transformAdaptorColor(embed.color),
  footer:
    embed.footer && transformers.transformAdaptorEmbedFooter(embed.footer),
  image: embed.image && transformers.transformAdaptorEmbedImage(embed.image),
  thumbnail:
    embed.thumbnail &&
    transformers.transformAdaptorEmbedThumbnail(embed.thumbnail),
  author:
    embed.author && transformers.transformAdaptorEmbedAuthor(embed.author),
  fields:
    embed.fields && embed.fields.map(transformers.transformAdaptorEmbedField),
});

const transformAdaptorTimeStamp = (
  timeStamp: number | Date | undefined
): string | undefined => {
  if (timeStamp === undefined) return undefined;
  if (timeStamp instanceof Date) {
    return timeStamp.toISOString();
  }
  return new Date(timeStamp).toISOString();
};

const transformAdaptorColor = (
  color: number | string | undefined
): number | undefined => {
  if (color === undefined) return undefined;
  if (typeof color === "number") return color;
  return parseInt(color.replace("#", ""), 16);
};

const transformAdaptorEmbedFooter = (
  footer: AdaptorEmbedFooter
): APIEmbedFooter => ({
  text: footer.text,
  icon_url: footer.iconUrl,
});

const transformAdaptorEmbedImage = (
  image: AdaptorEmbedImage
): APIEmbedImage => ({
  url: image.url,
});

const transformAdaptorEmbedThumbnail = (
  thumbnail: AdaptorEmbedThumbnail
): APIEmbedThumbnail => ({
  url: thumbnail.url,
});

const transformAdaptorEmbedAuthor = (
  author: AdaptorEmbedAuthor
): APIEmbedAuthor => ({
  name: author.name,
  url: author.url,
  icon_url: author.iconUrl,
});

const transformAdaptorEmbedField = (
  field: AdaptorEmbedField
): APIEmbedField => ({
  name: field.name,
  value: field.value,
  inline: field.inline,
});

export const transformersAdaptorEmbed = {
  transformAdaptorEmbed,
  transformAdaptorTimeStamp,
  transformAdaptorColor,
  transformAdaptorEmbedFooter,
  transformAdaptorEmbedImage,
  transformAdaptorEmbedThumbnail,
  transformAdaptorEmbedAuthor,
  transformAdaptorEmbedField,
};
