import nodeObjectHash from "node-object-hash";

import { messageFacade } from "../adaptor/messageFacade";

import type { DiscordAdaptor, Snowflake } from "../adaptor";
import type { MessageMutualPayload } from "../adaptor/messageFacade";
import type { MessageTarget } from "../adaptor/messageFacade";
import type { SetNullable } from "../util/types";

export interface Screen {
  render: (payload: MessageMutualPayload) => Promise<RenderState>;
  close: () => Promise<void>;
}

interface ScreenConfig {
  onClose?: "deleteMessage" | "deleteComponent" | "keep";
}

type RenderState = {
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

  const render = async (
    payload: MessageMutualPayload
  ): Promise<RenderState> => {
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
        return {
          initial: false,
          updated: true,
          messageId: editor.messageId,
        };
      } else {
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
      await render({
        components: [],
      });
      return;
    }
  };

  return {
    render,
    close,
  };
};

//TODO テスト書く
const createMessagePayloadPatch = (
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

  if (isDifferentHash(prev.embeds, next.embeds)) {
    result = {
      ...(result ?? {}),
      embeds: next.embeds === undefined ? null : next.embeds,
    };
  }

  if (isDifferentHash(prev.components, next.components)) {
    result = {
      ...(result ?? {}),
      components: next.components === undefined ? null : next.components,
    };
  }

  if (isDifferentHash(prev.allowedMentions, next.allowedMentions)) {
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

const hasher = nodeObjectHash({
  sort: true,
  coerce: false,
});

/**
 * オブジェクトをハッシュ値で比較する
 */
const isDifferentHash = (a: unknown, b: unknown) => {
  const aHash = hasher.hash(a);
  const bHash = hasher.hash(b);
  return aHash !== bHash;
};
