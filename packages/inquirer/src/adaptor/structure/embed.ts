/**
 * {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-structure}
 */
export interface Embed {
  /**
   * title of embed
   */
  title?: string;

  /**
   * description of embed
   */
  description?: string;

  /**
   * url of embed
   */
  url?: string;

  /**
   * timestamp of embed content
   */
  timestamp?: number | Date;

  /**
   * color code of the embed
   */
  color?: `#${string}` | number;

  /**
   * footer information
   */
  footer: EmbedFooter;

  /**
   * image information
   */
  image: EmbedImage;

  /**
   * thumbnail information
   */
  thumbnail: EmbedThumbnail;

  /**
   * author information
   */
  author: EmbedAuthor;

  /**
   * fields information
   */
  fields: EmbedField[];
}

/**
 * {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-structure}
 */
export interface EmbedFooter {
  /**
   * footer text
   */
  text: string;

  /**
   * url of footer icon (only supports http(s) and attachments)
   */
  iconUrl?: string;
}

/**
 * {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure}
 */
export interface EmbedImage {
  /**
   * source url of image (only supports http(s) and attachments)
   */
  url: string;
}

/**
 * {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure}
 */
export interface EmbedThumbnail {
  /**
   * source url of thumbnail (only supports http(s) and attachments)
   */
  url: string;
}

/**
 * {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure}
 */
export interface EmbedAuthor {
  /**
   * name of author
   */
  name: string;

  /**
   * url of author
   */
  url?: string;

  /**
   * url of author icon (only supports http(s) and attachments)
   */
  iconUrl?: string;
}

/**
 * {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure}
 */
export interface EmbedField {
  /**
   * name of the field
   */
  name: string;

  /**
   * value of the field
   */
  value: string;

  /**
   * whether or not this field should display inline
   * @default false
   */
  inline?: boolean;
}
