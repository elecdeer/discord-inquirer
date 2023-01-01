import type { AdaptorChannelTypes } from "./channel";
import type { AdaptorPartialEmoji } from "./emoji";

/**
 * @see https://discord.com/developers/docs/interactions/message-components#component-object
 */
export interface AdaptorMessageActionRowComponent {
  type: "row";
  components:
    | [
        | AdaptorButtonComponent
        | AdaptorStringSelectComponent<unknown>
        | AdaptorUserSelectComponent
        | AdaptorRoleSelectComponent
        | AdaptorMentionableSelectComponent
        | AdaptorChannelSelectComponent
      ]
    | [AdaptorButtonComponent, AdaptorButtonComponent]
    | [AdaptorButtonComponent, AdaptorButtonComponent, AdaptorButtonComponent]
    | [
        AdaptorButtonComponent,
        AdaptorButtonComponent,
        AdaptorButtonComponent,
        AdaptorButtonComponent
      ]
    | [
        AdaptorButtonComponent,
        AdaptorButtonComponent,
        AdaptorButtonComponent,
        AdaptorButtonComponent,
        AdaptorButtonComponent
      ];
}

export interface AdaptorModalActionRowComponent {
  type: "row";
  components: [AdaptorTextInputComponent];
}

export type AdaptorMessageComponent =
  | AdaptorButtonComponent
  | AdaptorStringSelectComponent<unknown>
  | AdaptorUserSelectComponent
  | AdaptorRoleSelectComponent
  | AdaptorMentionableSelectComponent
  | AdaptorChannelSelectComponent;

export type AdaptorModalComponent = AdaptorTextInputComponent;

/**
 * @see https://discord.com/developers/docs/interactions/message-components#component-object
 */
export type AdaptorButtonComponent =
  | AdaptorLinkButtonComponent
  | AdaptorNonLinkButtonComponent;

export interface AdaptorButtonComponentBase {
  type: "button";

  /**
   * text that appears on the button, max 80 characters
   */
  label?: string;

  /**
   * emoji to display to the left of the text
   */
  emoji?: AdaptorPartialEmoji;

  /**
   * whether the button is disabled
   * @default false
   */
  disabled?: boolean;
}

export interface AdaptorLinkButtonComponent extends AdaptorButtonComponentBase {
  style: "link";

  /**
   * a url for link-style buttons
   */
  url: string;

  customId?: never;
}

export interface AdaptorNonLinkButtonComponent
  extends AdaptorButtonComponentBase {
  style: "primary" | "secondary" | "success" | "danger";

  /**
   * a developer-defined identifier for the button, max 100 characters
   */
  customId: string;

  url?: never;
}

/**
 * @see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure
 */
export interface AdaptorSelectComponentBase {
  /**
   * custom placeholder text if nothing is selected, max 100 characters
   */
  customId: string;

  /**
   * custom placeholder text if nothing is selected, max 150 characters
   */
  placeholder?: string;

  /**
   * the minimum number of items that must be chosen
   * 0 ~ 25
   * @default 1
   */
  minValues?: number;

  /**
   * the maximum number of items that can be chosen;
   * 1 ~ 25
   * @default 1
   */
  maxValues?: number;

  /**
   * disable the select
   * @default false
   */
  disabled?: boolean;
}

/**
 * @see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure
 */
export interface AdaptorStringSelectComponent<T>
  extends AdaptorSelectComponentBase {
  type: "stringSelect";

  /**
   * the choices in the select, max 25
   */
  options: AdaptorSelectOption<T>[];
}

/**
 * @see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
 */
export interface AdaptorSelectOption<T> {
  /**
   * the user-facing name of the option, max 100 characters
   */
  label: string;

  /**
   * the dev-define value of the option, max 100 characters
   */
  value: string;

  /**
   * an additional description of the option, max 100 characters
   */
  description?: string;

  /**
   * the emoji to display to the left of the option
   */
  emoji?: AdaptorPartialEmoji;

  /**
   * whether this option should be enabled by default
   */
  default?: boolean;
}

/**
 * @see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure
 */
export interface AdaptorUserSelectComponent extends AdaptorSelectComponentBase {
  type: "userSelect";
}

/**
 * @see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure
 */
export interface AdaptorRoleSelectComponent extends AdaptorSelectComponentBase {
  type: "roleSelect";
}

/**
 * @see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure
 */
export interface AdaptorMentionableSelectComponent
  extends AdaptorSelectComponentBase {
  type: "mentionableSelect";
}

/**
 * @see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure
 */
export interface AdaptorChannelSelectComponent
  extends AdaptorSelectComponentBase {
  type: "channelSelect";

  /**
   * List of channel types to include in the channel select component (type 8)
   */
  channelTypes?: AdaptorChannelTypes[];
}

/**
 * @see https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
 */
export interface AdaptorTextInputComponent {
  type: "textInput";

  /**
   * a developer-defined identifier for the input, max 100 characters
   */
  customId: string;

  /**
   * the Text Input Style
   *  - short: a single-line input
   *  - paragraph: a multi-line input
   */
  style: "short" | "paragraph";

  /**
   * the label for this component, max 45 characters
   */
  label: string;

  /**
   * the minimum input length for a text input, min 0, max 4000
   */
  minLength?: number;

  /**
   * the maximum input length for a text input, min 1, max 4000
   */
  maxLength?: number;

  /**
   * whether this component is required to be filled
   * @default true
   */
  required?: boolean;

  /**
   * a pre-filled value for this component, max 4000 characters
   */
  value?: string;

  /**
   * custom placeholder text if the input is empty, max 100 characters
   */
  placeholder?: string;
}
