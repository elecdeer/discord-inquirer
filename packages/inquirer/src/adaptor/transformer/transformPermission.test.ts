import { describe, expect, test } from "vitest";

import { transformPermissionFlags } from "./transformPermission";

describe("packages/inquirer/src/adaptor/transformer/transformPermission", () => {
  describe("transformPermissionFlags()", () => {
    test("全てのフラグが立っている", () => {
      const flag = String((1n << 41n) - 1n);
      const result = transformPermissionFlags(flag);
      expect(result).toEqual({
        createInstantInvite: true,
        kickMembers: true,
        banMembers: true,
        administrator: true,
        manageChannels: true,
        manageGuild: true,
        addReactions: true,
        viewAuditLog: true,
        prioritySpeaker: true,
        stream: true,
        viewChannel: true,
        sendMessages: true,
        sendTTSMessages: true,
        manageMessages: true,
        embedLinks: true,
        attachFiles: true,
        readMessageHistory: true,
        mentionEveryone: true,
        useExternalEmojis: true,
        viewGuildInsights: true,
        connect: true,
        speak: true,
        muteMembers: true,
        deafenMembers: true,
        moveMembers: true,
        useVAD: true,
        changeNickname: true,
        manageNicknames: true,
        manageRoles: true,
        manageWebhooks: true,
        manageEmojis: true,
        useApplicationCommands: true,
        requestToSpeak: true,
        manageEvents: true,
        manageThreads: true,
        createPublicThreads: true,
        createPrivateThreads: true,
        useExternalStickers: true,
        sendMessagesInThreads: true,
        startEmbeddedActivities: true,
        moderateMembers: true,
      });
    });

    test("全てのフラグが立っていない", () => {
      const flag = String(0n);
      const result = transformPermissionFlags(flag);
      expect(result).toEqual({
        createInstantInvite: false,
        kickMembers: false,
        banMembers: false,
        administrator: false,
        manageChannels: false,
        manageGuild: false,
        addReactions: false,
        viewAuditLog: false,
        prioritySpeaker: false,
        stream: false,
        viewChannel: false,
        sendMessages: false,
        sendTTSMessages: false,
        manageMessages: false,
        embedLinks: false,
        attachFiles: false,
        readMessageHistory: false,
        mentionEveryone: false,
        useExternalEmojis: false,
        viewGuildInsights: false,
        connect: false,
        speak: false,
        muteMembers: false,
        deafenMembers: false,
        moveMembers: false,
        useVAD: false,
        changeNickname: false,
        manageNicknames: false,
        manageRoles: false,
        manageWebhooks: false,
        manageEmojis: false,
        useApplicationCommands: false,
        requestToSpeak: false,
        manageEvents: false,
        manageThreads: false,
        createPublicThreads: false,
        createPrivateThreads: false,
        useExternalStickers: false,
        sendMessagesInThreads: false,
        startEmbeddedActivities: false,
        moderateMembers: false,
      });
    });

    test("特定のフラグ1つだけが立っている", () => {
      for (let i = 0; i < 40; i++) {
        const flag = String(1n << BigInt(i));
        const result = transformPermissionFlags(flag);
        const setFlagKeys = Object.entries(result)
          .filter(([_, bool]) => bool)
          .map(([key]) => key);

        expect(setFlagKeys).toHaveLength(1);
      }
    });
  });
});
