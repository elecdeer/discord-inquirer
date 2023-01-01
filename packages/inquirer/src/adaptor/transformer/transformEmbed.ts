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

export const transformEmbed = (embed: AdaptorEmbed): APIEmbed => ({
  title: embed.title,
  description: embed.description,
  url: embed.url,
  timestamp: transformTimeStamp?.(embed.timestamp),
  color: transformColor(embed.color),
  footer: embed.footer && transformEmbedFooter(embed.footer),
  image: embed.image && transformEmbedImage(embed.image),
  thumbnail: embed.thumbnail && transformEmbedThumbnail(embed.thumbnail),
  author: embed.author && transformEmbedAuthor(embed.author),
  fields: embed.fields && embed.fields.map(transformEmbedField),
});

export const transformTimeStamp = (
  timeStamp: number | Date | undefined
): string | undefined => {
  if (timeStamp === undefined) return undefined;
  if (timeStamp instanceof Date) {
    return timeStamp.toISOString();
  }
  return new Date(timeStamp).toISOString();
};

export const transformColor = (
  color: number | string | undefined
): number | undefined => {
  if (color === undefined) return undefined;
  if (typeof color === "number") return color;
  return parseInt(color.replace("#", ""), 16);
};

export const transformEmbedFooter = (
  footer: AdaptorEmbedFooter
): APIEmbedFooter => ({
  text: footer.text,
  icon_url: footer.iconUrl,
});

export const transformEmbedImage = (
  image: AdaptorEmbedImage
): APIEmbedImage => ({
  url: image.url,
});

export const transformEmbedThumbnail = (
  thumbnail: AdaptorEmbedThumbnail
): APIEmbedThumbnail => ({
  url: thumbnail.url,
});

export const transformEmbedAuthor = (
  author: AdaptorEmbedAuthor
): APIEmbedAuthor => ({
  name: author.name,
  url: author.url,
  icon_url: author.iconUrl,
});

export const transformEmbedField = (
  field: AdaptorEmbedField
): APIEmbedField => ({
  name: field.name,
  value: field.value,
  inline: field.inline,
});
