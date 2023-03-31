import { createEventFlow } from "@elecdeer/event-flow";
import { verifyAsync, etc } from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import * as http from "http";
import { webcrypto } from "node:crypto";

import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";

export type InteractionServerOption = {
  discordPublicKey: string;
  port?: number;
};

export const createInteractionServer = (option: InteractionServerOption) => {
  const eventFlow = createEventFlow<{
    interaction: APIInteraction;
    sendResponse: (
      interactionResponse: APIInteractionResponse
    ) => Promise<void>;
  }>();

  const server = http.createServer(async (req, res) => {
    const rejectRequest = () => {
      res.writeHead(401);
      res.end("Invalid request signature");
    };

    const signature = req.headers["x-signature-ed25519"];
    if (signature === undefined || Array.isArray(signature)) {
      return rejectRequest();
    }
    const timestamp = req.headers["x-signature-timestamp"];
    if (timestamp === undefined || Array.isArray(timestamp)) {
      return rejectRequest();
    }

    const body = await parseBody(req);

    const isValidRequest = await verifyKey(
      body,
      signature,
      timestamp,
      option.discordPublicKey
    );

    if (!isValidRequest) {
      return rejectRequest();
    }

    const interaction = JSON.parse(body.toString()) as APIInteraction;
    const response = (interactionResponse: APIInteractionResponse) =>
      new Promise<void>((resolve) => {
        res.writeHead(200, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify(interactionResponse), () => {
          resolve();
        });
      });

    eventFlow.emit({
      interaction,
      sendResponse: response,
    });
  });

  server.listen(option.port ?? 80, () => {
    console.log(`server started on port ${option.port ?? 80}`);
  });

  return eventFlow;
};

const parseBody = (req: http.IncomingMessage) =>
  new Promise<Buffer>((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

//https://github.com/paulmillr/noble-ed25519#usage

//@noble/ed25519のverifyAsyncは@noble/hashes/sha512を使うので、依存性を注入する必要がある
etc.sha512Sync = (...m) => sha512(etc.concatBytes(...m));

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (!globalThis.crypto) globalThis.crypto = webcrypto;

const verifyKey = async (
  body: Buffer,
  signature: string,
  timestamp: string,
  publicKey: string
) => {
  return await verifyAsync(
    signature,
    Buffer.from(timestamp + body.toString()),
    publicKey
  );
};
