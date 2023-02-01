import {
  Row,
  useChannelSelectComponent,
  useMentionableSelectComponent,
  useRoleSelectComponent,
  useSelectComponent,
  useUserSelectComponent,
} from "discord-inquirer";

import type {
  Prompt,
  AdaptorRole,
  TypeSpecifiedChannel,
  UserSelectResultValue,
  MentionableSelectValue,
} from "discord-inquirer";

export const selectsPrompt: Prompt<{
  stringSelected: number[];
  channelSelected: TypeSpecifiedChannel<"guildText">[];
  userSelected: UserSelectResultValue[];
  roleSelected: AdaptorRole[];
  mentionableSelected: MentionableSelectValue[];
}> = (answer, close) => {
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
        selected.filter((item) => item.selected).map((item) => item.payload)
      );
      console.log("stringSelected", selected);
    },
  });

  const [channelResult, ChannelSelectComponent] =
    useChannelSelectComponent<"guildText">({
      channelTypes: ["guildText"],
      onSelected: (selected) => {
        answer("channelSelected", selected);
        console.log("channel selected", selected);
      },
    });

  const [userResult, UserSelectComponent] = useUserSelectComponent({
    onSelected: (selected) => {
      answer("userSelected", selected);
      console.log("user selected", selected);
    },
  });

  const [roleResult, RoleSelectComponent] = useRoleSelectComponent({
    onSelected: (selected) => {
      answer("roleSelected", selected);
      console.log("role selected", selected);
    },
  });

  const [mentionableResult, MentionableSelectComponent] =
    useMentionableSelectComponent({
      onSelected: (selected) => {
        answer("mentionableSelected", selected);
        console.log("mentionable selected", selected);
      },
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
      Row(
        ChannelSelectComponent({
          maxValues: 2,
        })()
      ),
      Row(
        UserSelectComponent({
          maxValues: 2,
        })()
      ),
      Row(
        RoleSelectComponent({
          maxValues: 2,
        })()
      ),
      Row(
        MentionableSelectComponent({
          maxValues: 2,
        })()
      ),
    ],
  };
};
