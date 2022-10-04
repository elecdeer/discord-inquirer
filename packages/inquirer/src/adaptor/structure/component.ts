/**
 * {@link https://discord.com/developers/docs/interactions/message-components#component-object}
 */
import type { PartialEmoji } from "./emoji";

export interface ActionRowComponent {
  type: "row";
  components:
    | [ButtonComponent | SelectMenuComponent<unknown>]
    | [ButtonComponent, ButtonComponent]
    | [ButtonComponent, ButtonComponent, ButtonComponent]
    | [ButtonComponent, ButtonComponent, ButtonComponent, ButtonComponent]
    | [
        ButtonComponent,
        ButtonComponent,
        ButtonComponent,
        ButtonComponent,
        ButtonComponent
      ];
}

export type Component = ButtonComponent | SelectMenuComponent<unknown>;

/**
 * {@link https://discord.com/developers/docs/interactions/message-components#component-object}
 */
export type ButtonComponent = LinkButtonComponent | NonLinkButtonComponent;

export interface ButtonComponentBase {
  type: "button";

  /**
   * text that appears on the button, max 80 characters
   */
  label?: string;

  /**
   * emoji to display to the left of the text
   */
  emoji?: PartialEmoji;

  /**
   * whether the button is disabled
   * @default false
   */
  disabled?: boolean;
}

export interface LinkButtonComponent extends ButtonComponentBase {
  style: "link";

  /**
   * a url for link-style buttons
   */
  url: string;
  customId: undefined;
}

export interface NonLinkButtonComponent extends ButtonComponentBase {
  style: "primary" | "secondary" | "success" | "danger";

  /**
   * a developer-defined identifier for the button, max 100 characters
   */
  customId: string;
  url: undefined;
}

/**
 * {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object}
 */
export interface SelectMenuComponent<T> {
  type: "menu";

  /**
   * custom placeholder text if nothing is selected, max 100 characters
   */
  customId: string;

  /**
   * the choices in the select, max 25
   */
  options: SelectOption<T>[];

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
 * https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
 */
export interface SelectOption<T> {
  /**
   * the user-facing name of the option, max 100 characters
   */
  label: string;

  /**
   * the dev-defined value of the option, max 100 characters
   *
   * corresponds to value
   */
  key: string;

  /**
   * the value to return when this option is selected
   */
  payload: T;

  /**
   * an additional description of the option, max 100 characters
   */
  description?: string;

  /**
   * the emoji to display to the left of the option
   */
  emoji?: PartialEmoji;

  /**
   * whether this option should be enabled by default
   */
  default?: boolean;
}

/**
 * {@link https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure}
 */
export interface TextInputComponent {
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
