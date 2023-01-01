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

export const StringSelect = createCurriedBuilder<
  AdaptorStringSelectComponent<unknown>
>()({
  type: "stringSelect",
});

export const UserSelect = createCurriedBuilder<AdaptorUserSelectComponent>()({
  type: "userSelect",
});

export const RoleSelect = createCurriedBuilder<AdaptorRoleSelectComponent>()({
  type: "roleSelect",
});

export const MentionableSelect =
  createCurriedBuilder<AdaptorMentionableSelectComponent>()({
    type: "mentionableSelect",
  });

export const ChannelSelect =
  createCurriedBuilder<AdaptorChannelSelectComponent>()({
    type: "channelSelect",
  });
