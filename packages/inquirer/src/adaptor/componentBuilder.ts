import { createCurriedBuilder } from "../util/curriedBuilder";

import type {
  AdaptorButtonComponent,
  AdaptorChannelSelectComponent,
  AdaptorMentionableSelectComponent,
  AdaptorMessageActionRowComponent,
  AdaptorNonLinkButtonComponent,
  AdaptorRoleSelectComponent,
  AdaptorStringSelectComponent,
  AdaptorUserSelectComponent,
} from "./structure";
import type {
  ConditionalCurriedBuilder,
  FulfilledCurriedBuilder,
} from "../util/curriedBuilder";

export type ButtonComponentBuilder<T extends Partial<AdaptorButtonComponent>> =
  ConditionalCurriedBuilder<
    AdaptorButtonComponent,
    T & { type: "button" },
    AdaptorButtonComponent
  >;

export const Button = createCurriedBuilder<AdaptorButtonComponent>()({
  type: "button",
});

export type NonLinkButtonComponentBuilder<
  T extends Partial<AdaptorNonLinkButtonComponent>,
> = ConditionalCurriedBuilder<
  AdaptorNonLinkButtonComponent,
  T & { type: "button" },
  AdaptorNonLinkButtonComponent
>;

export const NonLinkButton =
  createCurriedBuilder<AdaptorNonLinkButtonComponent>()({
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
  T extends Partial<AdaptorStringSelectComponent>,
> = FulfilledCurriedBuilder<
  AdaptorStringSelectComponent,
  T & {
    type: "stringSelect";
  },
  AdaptorStringSelectComponent
>;

export const StringSelect =
  createCurriedBuilder<AdaptorStringSelectComponent>()({
    type: "stringSelect",
  });

export type UserSelectComponentBuilder<
  T extends Partial<AdaptorUserSelectComponent>,
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
  T extends Partial<AdaptorRoleSelectComponent>,
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
  T extends Partial<AdaptorMentionableSelectComponent>,
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
  T extends Partial<AdaptorChannelSelectComponent>,
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
