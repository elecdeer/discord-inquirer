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

export const transformAdaptorEmbed = (embed: AdaptorEmbed): APIEmbed => ({
  title: embed.title,
  description: embed.description,
  url: embed.url,
  timestamp: transformAdaptorTimeStamp?.(embed.timestamp),
  color: transformAdaptorColor(embed.color),
  footer: embed.footer && transformAdaptorEmbedFooter(embed.footer),
  image: embed.image && transformAdaptorEmbedImage(embed.image),
  thumbnail: embed.thumbnail && transformAdaptorEmbedThumbnail(embed.thumbnail),
  author: embed.author && transformAdaptorEmbedAuthor(embed.author),
  fields: embed.fields && embed.fields.map(transformAdaptorEmbedField),
});

export const transformAdaptorTimeStamp = (
  timeStamp: number | Date | undefined
): string | undefined => {
  if (timeStamp === undefined) return undefined;
  if (timeStamp instanceof Date) {
    return timeStamp.toISOString();
  }
  return new Date(timeStamp).toISOString();
};

export const transformAdaptorColor = (
  color: number | string | undefined
): number | undefined => {
  if (color === undefined) return undefined;
  if (typeof color === "number") return color;
  return parseInt(color.replace("#", ""), 16);
};

export const transformAdaptorEmbedFooter = (
  footer: AdaptorEmbedFooter
): APIEmbedFooter => ({
  text: footer.text,
  icon_url: footer.iconUrl,
});

export const transformAdaptorEmbedImage = (
  image: AdaptorEmbedImage
): APIEmbedImage => ({
  url: image.url,
});

export const transformAdaptorEmbedThumbnail = (
  thumbnail: AdaptorEmbedThumbnail
): APIEmbedThumbnail => ({
  url: thumbnail.url,
});

export const transformAdaptorEmbedAuthor = (
  author: AdaptorEmbedAuthor
): APIEmbedAuthor => ({
  name: author.name,
  url: author.url,
  icon_url: author.iconUrl,
});

export const transformAdaptorEmbedField = (
  field: AdaptorEmbedField
): APIEmbedField => ({
  name: field.name,
  value: field.value,
  inline: field.inline,
});
