import {
  transformAdaptorColor,
  transformAdaptorTimestamp,
  transformers,
} from "./index";

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
  timestamp: transformAdaptorTimestamp?.(embed.timestamp),
  color: transformAdaptorColor(embed.color),
  footer: embed.footer && transformers.adaptorEmbedFooter(embed.footer),
  image: embed.image && transformers.adaptorEmbedImage(embed.image),
  thumbnail:
    embed.thumbnail && transformers.adaptorEmbedThumbnail(embed.thumbnail),
  author: embed.author && transformers.adaptorEmbedAuthor(embed.author),
  fields: embed.fields && embed.fields.map(transformers.adaptorEmbedField),
});

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
  adaptorEmbed: transformAdaptorEmbed,
  adaptorEmbedFooter: transformAdaptorEmbedFooter,
  adaptorEmbedImage: transformAdaptorEmbedImage,
  adaptorEmbedThumbnail: transformAdaptorEmbedThumbnail,
  adaptorEmbedAuthor: transformAdaptorEmbedAuthor,
  adaptorEmbedField: transformAdaptorEmbedField,
};
