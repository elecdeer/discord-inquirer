import { createAdaptorPartialMemberMock } from "./adaptorMemberMock";
import { createAdaptorPermissionsMockDefaultAllow } from "./adaptorPermissionMock";
import { createAdaptorUserMock } from "./adaptorUserMock";

import type { AdaptorUserInvokedInteractionBase } from "../adaptor";

export const createAdaptorUserInvokedInteractionBaseMock = () => {
  return {
    id: "interactionIdValue",
    applicationId: "applicationIdValue",
    token: "tokenValue",
    version: 1,
    guildId: "guildIdValue",
    channelId: "channelIdValue",
    member: createAdaptorPartialMemberMock(),
    user: createAdaptorUserMock(),
    locale: "en-US",
    guildLocale: "en-US",
    appPermissions: createAdaptorPermissionsMockDefaultAllow(),
  } satisfies AdaptorUserInvokedInteractionBase<"guild">;
};
