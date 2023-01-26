import { messageFacade } from "../adaptor";
import { isMatchHash } from "../util/hash";
import { defaultLogger } from "../util/logger";

import type {
  DiscordAdaptor,
  MessageMutualPayload,
  MessageTarget,
  Snowflake,
} from "../adaptor";
import type { SetNullable } from "../util/types";

export interface Screen {
  /**
   * Post or edit message.
   *
   * If a message has not been sent from this screen, post a new message.
   * If a message has been sent and there is a difference in payload, edit the message.
   * @param payload
   */
  commit: (payload: MessageMutualPayload) => Promise<CommitResult>;

  /**
   * Close this screen.
   *
   * Corresponding to the setting mode and edits the messages.
   */
  close: () => Promise<void>;
}

export interface ScreenConfig {
  onClose: "deleteMessage" | "deleteComponent" | "keep";
  log: (type: "debug" | "warn" | "error", message: unknown) => void;
}

const completeScreenConfig = (config: Partial<ScreenConfig>): ScreenConfig => {
  return {
    onClose: config.onClose ?? "deleteMessage",
    log: config.log ?? defaultLogger,
  };
};

export type CommitResult =
  | {
      updated: false;
      messageId: Snowflake | null;
    }
  | {
      initial: boolean;
      updated: true;
      messageId: Snowflake;
    };

export const createScreen = (
  adaptor: DiscordAdaptor,
  target: MessageTarget,
  config: Partial<ScreenConfig>
): Screen => {
  const { onClose, log } = completeScreenConfig(config);
  const facade = messageFacade(adaptor);

  let closed = false;

  let editor: {
    latestPayload: MessageMutualPayload;
    messageId: Snowflake;
    edit: (payload: MessageMutualPayload) => Promise<void>;
    del: () => Promise<void>;
  } | null = null;

  const commit = async (
    payload: MessageMutualPayload
  ): Promise<CommitResult> => {
    log("debug", "screen.commit");
    log("debug", payload);
    if (closed) {
      log("warn", "this screen is already closed");
      return {
        updated: false,
        messageId: editor?.messageId ?? null,
      };
    }

    if (editor === null) {
      log("debug", "initial message");
      try {
        const controller = await facade.send(target, payload);
        editor = {
          ...controller,
          latestPayload: payload,
        };
      } catch (e) {
        log("error", {
          message: "failed to send message",
          error: e,
        });
        return {
          updated: false,
          messageId: editor?.messageId ?? null,
        };
      }

      return {
        updated: true,
        initial: true,
        messageId: editor.messageId,
      };
    } else {
      const difference = createMessagePayloadPatch(
        editor.latestPayload,
        payload
      );
      if (difference !== null) {
        log("debug", "there is a difference in payload, edit message");

        try {
          await editor.edit(payload);
          editor = {
            ...editor,
            latestPayload: payload,
          };
        } catch (e) {
          log("error", {
            message: "failed to edit message",
            error: e,
          });
          return {
            updated: false,
            messageId: editor?.messageId ?? null,
          };
        }

        return {
          updated: true,
          initial: false,
          messageId: editor.messageId,
        };
      } else {
        log("debug", "no difference in payload, skip edit message");
        editor = {
          ...editor,
          latestPayload: payload,
        };
        return {
          updated: false,
          messageId: editor?.messageId ?? null,
        };
      }
    }
  };

  const close = async () => {
    log("debug", `screen.close mode: ${onClose}`);
    if (onClose === "deleteMessage") {
      await editor
        ?.del()
        .catch((e) => {
          log("error", {
            message: "failed to delete message",
            error: e,
          });
        })
        .finally(() => {
          closed = true;
        });
      return;
    }
    if (onClose === "deleteComponent") {
      await commit({
        components: [],
      })
        .catch((e) => {
          log("error", {
            message: "failed to delete component",
            error: e,
          });
        })
        .finally(() => {
          closed = true;
        });
      return;
    }
    if (onClose === "keep") {
      closed = true;
      return;
    }
    throw new Error("cannot be reached");
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
