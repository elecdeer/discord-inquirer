import { messageFacade } from "../adaptor";
import { isMatchHash } from "../util/hash";

import type {
  DiscordAdaptor,
  MessageMutualPayload,
  MessageTarget,
  Snowflake,
} from "../adaptor";
import type { SetNullable } from "../util/types";

export interface Screen {
  commit: (payload: MessageMutualPayload) => Promise<CommitResult>;
  close: () => Promise<void>;
}

export interface ScreenConfig {
  onClose?: "deleteMessage" | "deleteComponent" | "keep";
}

type CommitResult = {
  initial: boolean;
  updated: boolean;
  messageId: Snowflake;
};

export const createScreen = (
  adaptor: DiscordAdaptor,
  target: MessageTarget,
  config: ScreenConfig
): Screen => {
  const facade = messageFacade(adaptor);

  let editor: {
    latestPayload: MessageMutualPayload;
    messageId: Snowflake;
    edit: (payload: MessageMutualPayload) => Promise<void>;
    del: () => Promise<void>;
  } | null = null;

  const commit = async (
    payload: MessageMutualPayload
  ): Promise<CommitResult> => {
    if (editor === null) {
      const controller = await facade.send(target, payload);
      editor = {
        ...controller,
        latestPayload: payload,
      };
      return {
        initial: true,
        updated: true,
        messageId: editor.messageId,
      };
    } else {
      const difference = createMessagePayloadPatch(
        editor.latestPayload,
        payload
      );
      if (difference !== null) {
        await editor.edit(payload);
        editor = {
          ...editor,
          latestPayload: payload,
        };
        return {
          initial: false,
          updated: true,
          messageId: editor.messageId,
        };
      } else {
        editor = {
          ...editor,
          latestPayload: payload,
        };
        return {
          initial: false,
          updated: false,
          messageId: editor.messageId,
        };
      }
    }
  };

  const close = async () => {
    if (config.onClose === "deleteMessage") {
      await editor?.del();
      return;
    }
    if (config.onClose === "deleteComponent") {
      await commit({
        components: [],
      });
      return;
    }
  };

  return {
    commit,
    close,
  };
};

export const createMessagePayloadPatch = (
  prev: MessageMutualPayload,
  next: MessageMutualPayload
): SetNullable<MessageMutualPayload> | null => {
  let result: SetNullable<MessageMutualPayload> | null = null;

  if (prev.content !== next.content) {
    result = {
      ...(result ?? {}),
      content: next.content === undefined ? null : next.content,
    };
  }

  if (!isMatchHash(prev.embeds, next.embeds)) {
    result = {
      ...(result ?? {}),
      embeds: next.embeds === undefined ? null : next.embeds,
    };
  }

  if (!isMatchHash(prev.components, next.components)) {
    result = {
      ...(result ?? {}),
      components: next.components === undefined ? null : next.components,
    };
  }

  if (!isMatchHash(prev.allowedMentions, next.allowedMentions)) {
    result = {
      ...(result ?? {}),
      allowedMentions:
        next.allowedMentions === undefined ? null : next.allowedMentions,
    };
  }

  if (prev.suppressEmbeds !== next.suppressEmbeds) {
    result = {
      ...(result ?? {}),
      suppressEmbeds:
        next.suppressEmbeds === undefined ? null : next.suppressEmbeds,
    };
  }

  return result;
};
