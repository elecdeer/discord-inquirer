/**
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-structure
 */
export interface AdaptorEmbed {
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
  footer?: AdaptorEmbedFooter;

  /**
   * image information
   */
  image?: AdaptorEmbedImage;

  /**
   * thumbnail information
   */
  thumbnail?: AdaptorEmbedThumbnail;

  /**
   * author information
   */
  author?: AdaptorEmbedAuthor;

  /**
   * fields information
   */
  fields?: AdaptorEmbedField[];
}

/**
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-structure
 */
export interface AdaptorEmbedFooter {
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
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure
 */
export interface AdaptorEmbedImage {
  /**
   * source url of image (only supports http(s) and attachments)
   */
  url: string;
}

/**
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure
 */
export interface AdaptorEmbedThumbnail {
  /**
   * source url of thumbnail (only supports http(s) and attachments)
   */
  url: string;
}

/**
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure
 */
export interface AdaptorEmbedAuthor {
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
 * @see https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure
 */
export interface AdaptorEmbedField {
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
