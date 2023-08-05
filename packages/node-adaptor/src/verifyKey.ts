import { etc, verifyAsync } from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { webcrypto } from "node:crypto";

//https://github.com/paulmillr/noble-ed25519#usage

//@noble/ed25519のverifyAsyncは@noble/hashes/sha512を使うので、依存性を注入する必要がある
etc.sha512Sync = (...m) => sha512(etc.concatBytes(...m));

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (!globalThis.crypto) globalThis.crypto = webcrypto;

export const verifyKey = async (
  body: Buffer,
  signature: string,
  timestamp: string,
  publicKey: string,
) => {
  return await verifyAsync(
    signature,
    Buffer.from(timestamp + body.toString()),
    publicKey,
  );
};
