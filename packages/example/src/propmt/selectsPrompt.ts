import {
  Row,
  useChannelSelectComponent,
  useLogger,
  useMentionableSelectComponent,
  useRoleSelectComponent,
  useSelectComponent,
  useUserSelectComponent,
} from "discord-inquirer";

import type {
  Prompt,
  AdaptorRole,
  AdaptorTypeSpecifiedChannel,
  UserSelectResultValue,
  MentionableSelectValue,
} from "discord-inquirer";

export const selectsPrompt: Prompt<{
  stringSelected: number[];
  channelSelected: AdaptorTypeSpecifiedChannel<"guildText">[];
  userSelected: UserSelectResultValue[];
  roleSelected: AdaptorRole[];
  mentionableSelected: MentionableSelectValue[];
}> = (answer) => {
  const logger = useLogger();

  const [result, Select] = useSelectComponent({
    options: [
      {
        label: "1",
        payload: 1,
      },
      {
        label: "2",
        payload: 2,
      },
      {
        label: "3",
        payload: 3,
      },
    ],
    onSelected: (selected) => {
      answer(
        "stringSelected",
        selected.filter((item) => item.selected).map((item) => item.payload),
      );
      logger.log("debug", {
        component: "string",
        selected,
      });
    },
  });

  const [channelResult, ChannelSelectComponent] =
    useChannelSelectComponent<"guildText">({
      channelTypes: ["guildText"],
      onSelected: (selected) => {
        answer("channelSelected", selected);
        logger.log("debug", {
          component: "chanel",
          selected,
        });
      },
      maxValues: 2,
    });

  const [userResult, UserSelectComponent] = useUserSelectComponent({
    onSelected: (selected) => {
      answer("userSelected", selected);
      logger.log("debug", {
        component: "user",
        selected,
      });
    },
    maxValues: 2,
  });

  const [roleResult, RoleSelectComponent] = useRoleSelectComponent({
    onSelected: (selected) => {
      answer("roleSelected", selected);
      logger.log("debug", {
        component: "role",
        selected,
      });
    },
    maxValues: 2,
  });

  const [mentionableResult, MentionableSelectComponent] =
    useMentionableSelectComponent({
      onSelected: (selected) => {
        answer("mentionableSelected", selected);
        logger.log("debug", {
          component: "mentionable",
          selected,
        });
      },
      maxValues: 2,
    });

  return {
    embeds: [
      {
        title: "Selects Prompt",
        fields: [
          {
            name: "stringSelected",
            value: result
              .filter((item) => item.selected)
              .map((item) => item.payload)
              .join(", "),
          },
          {
            name: "channelSelected",
            value: channelResult.map((item) => item.name).join(", "),
          },
          {
            name: "userSelected",
            value: userResult.map((item) => item.username).join(", "),
          },
          {
            name: "roleSelected",
            value: roleResult.map((item) => item.name).join(", "),
          },
          {
            name: "mentionableSelected",
            value: mentionableResult
              .map((item) => (item.type === "role" ? item.name : item.username))
              .join(", "),
          },
        ],
      },
    ],
    components: [
      Row(Select({})()),
      Row(ChannelSelectComponent()),
      Row(UserSelectComponent()),
      Row(RoleSelectComponent()),
      Row(MentionableSelectComponent()),
    ],
  };
};
