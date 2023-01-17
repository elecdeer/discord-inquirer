import { createCurriedBuilder } from "../util/curriedBuilder";

import type {
  AdaptorButtonComponent,
  AdaptorChannelSelectComponent,
  AdaptorMentionableSelectComponent,
  AdaptorMessageActionRowComponent,
  AdaptorRoleSelectComponent,
  AdaptorStringSelectComponent,
  AdaptorUserSelectComponent,
} from "./structure";
import type {
  UnfulfilledCurriedBuilder,
  FulfilledCurriedBuilder,
} from "../util/curriedBuilder";

export type ButtonComponentBuilder<T extends Partial<AdaptorButtonComponent>> =
  UnfulfilledCurriedBuilder<
    AdaptorButtonComponent,
    T & { type: "button" },
    AdaptorButtonComponent
  >;

export const Button = createCurriedBuilder<AdaptorButtonComponent>()({
  type: "button",
});

export const Row = (
  ...components: AdaptorMessageActionRowComponent["components"]
): AdaptorMessageActionRowComponent => {
  return {
    type: "row",
    components: components,
  };
};

export type StringSelectComponentBuilder<
  T extends Partial<AdaptorStringSelectComponent<unknown>>
> = FulfilledCurriedBuilder<
  AdaptorStringSelectComponent<unknown>,
  T & {
    type: "stringSelect";
  },
  AdaptorStringSelectComponent<unknown>
>;

export const StringSelect = createCurriedBuilder<
  AdaptorStringSelectComponent<unknown>
>()({
  type: "stringSelect",
});

export type UserSelectComponentBuilder<
  T extends Partial<AdaptorUserSelectComponent>
> = FulfilledCurriedBuilder<
  AdaptorUserSelectComponent,
  T & {
    type: "userSelect";
  },
  AdaptorUserSelectComponent
>;

export const UserSelect = createCurriedBuilder<AdaptorUserSelectComponent>()({
  type: "userSelect",
});

export type RoleSelectComponentBuilder<
  T extends Partial<AdaptorRoleSelectComponent>
> = FulfilledCurriedBuilder<
  AdaptorRoleSelectComponent,
  T & {
    type: "roleSelect";
  },
  AdaptorRoleSelectComponent
>;

export const RoleSelect = createCurriedBuilder<AdaptorRoleSelectComponent>()({
  type: "roleSelect",
});

export type MentionableSelectComponentBuilder<
  T extends Partial<AdaptorMentionableSelectComponent>
> = FulfilledCurriedBuilder<
  AdaptorMentionableSelectComponent,
  T & {
    type: "mentionableSelect";
  },
  AdaptorMentionableSelectComponent
>;

export const MentionableSelect =
  createCurriedBuilder<AdaptorMentionableSelectComponent>()({
    type: "mentionableSelect",
  });

export type ChannelSelectComponentBuilder<
  T extends Partial<AdaptorChannelSelectComponent>
> = FulfilledCurriedBuilder<
  AdaptorChannelSelectComponent,
  T & {
    type: "channelSelect";
  },
  AdaptorChannelSelectComponent
>;

export const ChannelSelect =
  createCurriedBuilder<AdaptorChannelSelectComponent>()({
    type: "channelSelect",
  });
