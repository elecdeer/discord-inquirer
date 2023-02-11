import { createEventFlow } from "@elecdeer/event-flow";
import { verify } from "@noble/ed25519";
import * as http from "http";

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

const verifyKey = async (
  body: Buffer,
  signature: string,
  timestamp: string,
  publicKey: string
) => {
  return await verify(
    signature,
    Buffer.from(timestamp + body.toString()),
    publicKey
  );
};
