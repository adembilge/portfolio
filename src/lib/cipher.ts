// Real AES-128-CBC with WebCrypto. Keys stay in memory for the session only.
const enc = new TextEncoder();
const dec = new TextDecoder();

export const toHex = (b: ArrayBuffer | Uint8Array) =>
  Array.from(b instanceof Uint8Array ? b : new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');

export async function newKey(): Promise<{ key: CryptoKey; hex: string }> {
  const key = await crypto.subtle.generateKey({ name: 'AES-CBC', length: 128 }, true, ['encrypt', 'decrypt']);
  return { key, hex: toHex(await crypto.subtle.exportKey('raw', key)) };
}

export function newIv(): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(16));
}

export async function encrypt(key: CryptoKey, iv: Uint8Array<ArrayBuffer>, text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, enc.encode(text)));
}

export async function decrypt(key: CryptoKey, iv: Uint8Array<ArrayBuffer>, data: Uint8Array<ArrayBuffer>): Promise<string> {
  return dec.decode(await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, data));
}
