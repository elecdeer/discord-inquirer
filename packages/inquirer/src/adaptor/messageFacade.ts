import type { DiscordAdaptor } from "./discordAdaptor";
import type { InteractionResponseModalData } from "./structure";
import type { MessagePayload, Snowflake } from "./structure";

type InteractionTarget = {
  type: "interaction";
  interactionId: Snowflake;
  token: string;
  ephemeral?: boolean;
};

type InteractionFollowupTarget = {
  type: "interactionFollowup";
  token: string;
  ephemeral?: boolean;
};

type ChannelTarget = {
  type: "channel";
  channelId: Snowflake;
};

type ReplyTarget = {
  type: "reply";
  channelId: Snowflake;
  messageId: Snowflake;
};

export type MessageTarget =
  | ChannelTarget
  | ReplyTarget
  | InteractionTarget
  | InteractionFollowupTarget;

export type MessageMutualPayload = Omit<
  MessagePayload,
  "messageReference" | "stickerIds"
>;

type SendResult = {
  messageId: Snowflake;
  edit: (payload: MessageMutualPayload) => Promise<void>;
  del: () => Promise<void>;
};

export type MessageFacade = {
  deferReply: (
    interactionId: Snowflake,
    token: string,
    ephemeral?: boolean
  ) => Promise<void>;
  openModal: (
    interactionId: Snowflake,
    token: string,
    payload: InteractionResponseModalData
  ) => Promise<void>;
  send: (target: MessageTarget, payload: MessagePayload) => Promise<SendResult>;
  deferUpdate: (interactionId: Snowflake, token: string) => Promise<void>;
};

export const messageFacade: (adaptor: DiscordAdaptor) => MessageFacade = (
  adaptor: DiscordAdaptor
) => {
  const sendChannel = async (
    target: ChannelTarget,
    payload: MessageMutualPayload
  ): Promise<SendResult> => {
    const channelId = target.channelId;
    const messageId = await adaptor.sendMessage(channelId, payload);

    return {
      messageId,
      edit: async (payload: MessageMutualPayload) => {
        await adaptor.editMessage(channelId, messageId, payload);
      },
      del: async () => {
        await adaptor.deleteMessage(channelId, messageId);
      },
    };
  };

  const sendReply = async (
    target: ReplyTarget,
    payload: MessageMutualPayload
  ): Promise<SendResult> => {
    const { channelId, messageId } = target;

    const replyMessageId = await adaptor.sendMessage(channelId, {
      ...payload,
      messageReference: {
        messageId,
      },
    });

    return {
      messageId: replyMessageId,
      edit: async (payload: MessageMutualPayload) => {
        await adaptor.editMessage(channelId, replyMessageId, payload);
      },
      del: async () => {
        await adaptor.deleteMessage(channelId, replyMessageId);
      },
    };
  };

  const sendInteraction = async (
    target: InteractionTarget,
    payload: MessageMutualPayload
  ): Promise<SendResult> => {
    const { interactionId, token, ephemeral } = target;
    await adaptor.sendInteractionResponse(interactionId, token, {
      type: "channelMessageWithSource",
      data: {
        ...payload,
        ephemeral: ephemeral,
      },
    });

    const messageId = await adaptor.getInteractionResponse(token);

    return {
      messageId: messageId,
      edit: async (payload: MessageMutualPayload) => {
        await adaptor.editInteractionResponse(token, {
          ...payload,
        });
      },
      del: async () => {
        await adaptor.deleteInteractionResponse(token);
      },
    };
  };

  const sendInteractionFollowup = async (
    target: InteractionFollowupTarget,
    payload: MessageMutualPayload
  ): Promise<SendResult> => {
    const { token, ephemeral } = target;
    const messageId = await adaptor.sendFollowUp(token, {
      ...payload,
      ephemeral: ephemeral,
    });

    return {
      messageId,
      edit: async (payload: MessageMutualPayload) => {
        await adaptor.editFollowup(messageId, token, payload);
      },
      del: async () => {
        await adaptor.deleteFollowup(messageId, token);
      },
    };
  };

  return {
    send: (
      target: MessageTarget,
      payload: MessagePayload
    ): Promise<SendResult> => {
      switch (target.type) {
        case "channel":
          return sendChannel(target, payload);
        case "reply":
          return sendReply(target, payload);
        case "interaction":
          return sendInteraction(target, payload);
        case "interactionFollowup":
          return sendInteractionFollowup(target, payload);
      }
    },
    deferReply: (
      interactionId: Snowflake,
      token: string,
      ephemeral?: boolean
    ) => {
      return adaptor.sendInteractionResponse(interactionId, token, {
        type: "deferredChannelMessageWithSource",
        data: {
          ephemeral: ephemeral,
        },
      });
    },
    deferUpdate: (interactionId: Snowflake, token: string) => {
      return adaptor.sendInteractionResponse(interactionId, token, {
        type: "deferredUpdateMessage",
      });
    },
    openModal: (
      interactionId: Snowflake,
      token: string,
      payload: InteractionResponseModalData
    ) => {
      return adaptor.sendInteractionResponse(interactionId, token, {
        type: "modal",
        data: payload,
      });
    },
  };
};
