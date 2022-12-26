import { createCurriedBuilder } from "../util/curriedBuilder";

import type { MentionableSelectComponent } from "./structure";
import type {
  ButtonComponent,
  ChannelSelectComponent,
  MessageActionRowComponent,
  RoleSelectComponent,
  StringSelectComponent,
  UserSelectComponent,
} from "./structure";

export const Button = createCurriedBuilder<ButtonComponent>()({
  type: "button",
});

export const Row = (
  ...components: MessageActionRowComponent["components"]
): MessageActionRowComponent => {
  return {
    type: "row",
    components: components,
  };
};

export const StringSelect = createCurriedBuilder<
  StringSelectComponent<unknown>
>()({
  type: "stringSelect",
});

export const UserSelect = createCurriedBuilder<UserSelectComponent>()({
  type: "userSelect",
});

export const RoleSelect = createCurriedBuilder<RoleSelectComponent>()({
  type: "roleSelect",
});

export const MentionableSelect =
  createCurriedBuilder<MentionableSelectComponent>()({
    type: "mentionableSelect",
  });

export const ChannelSelect = createCurriedBuilder<ChannelSelectComponent>()({
  type: "channelSelect",
});
