import { useEffect, useRef, useState } from 'react';
import { decrypt, encrypt, newIv, newKey, toHex } from '../lib/cipher';

type Packet = { id: number; iv: string; ct: string; bytes: number; plain?: string };

export function Cipher() {
  const key = useRef<CryptoKey | null>(null);
  const [keyHex, setKeyHex] = useState('');
  const [msg, setMsg] = useState('You’re booked. See you Thursday.');
  const [packets, setPackets] = useState<Packet[]>([]);
  const [error, setError] = useState('');
  const n = useRef(0);

  const rotate = async () => {
    try {
      const k = await newKey();
      key.current = k.key;
      setKeyHex(k.hex);
      setPackets([]);
    } catch {
      setError('WebCrypto is unavailable here (it needs a secure context).');
    }
  };
  useEffect(() => {
    rotate();
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.current || !msg.trim()) return;
    const iv = newIv();
    const ct = await encrypt(key.current, iv, msg);
    const id = ++n.current;
    setPackets((p) => [{ id, iv: toHex(iv), ct: toHex(ct), bytes: ct.length }, ...p].slice(0, 4));
    const plain = await decrypt(key.current, iv, new Uint8Array(ct));
    setTimeout(() => setPackets((p) => p.map((x) => (x.id === id ? { ...x, plain } : x))), 1300);
  };

  const last = packets[0];
  return (
    <div className="cipher">
      <form className="cipher__client" onSubmit={send}>
        <p className="tag">Client A · encrypts locally</p>
        <label className="sr-only" htmlFor="cipher-msg">
          Message to encrypt
        </label>
        <textarea id="cipher-msg" rows={3} value={msg} maxLength={140} onChange={(e) => setMsg(e.target.value)} />
        <div className="controls">
          <button className="btn" type="submit" disabled={!keyHex}>
            encrypt &amp; send
          </button>
          <button className="btn btn--ghost" type="button" onClick={rotate}>
            new session key
          </button>
        </div>
        <p className="mono cipher__key">
          AES-128-CBC key <span className="hex">{keyHex || '…'}</span>
        </p>
        {error && <p className="mono">{error}</p>}
      </form>

      <div className="cipher__server" aria-live="polite">
        <p className="tag">Server · routes, cannot read</p>
        <div className="lane">
          {packets.map((p) => (
            <div key={p.id} className={`packet ${p.plain ? 'is-delivered' : ''}`}>
              <span className="mono">IV {p.iv.slice(0, 16)}…</span>
              <span className="hex">{p.ct.match(/.{1,32}/g)?.slice(0, 3).join(' ')}</span>
            </div>
          ))}
          {!packets.length && <p className="muted mono">No traffic yet.</p>}
        </div>
        {last && (
          <p className="mono cipher__log">
            routing {last.bytes} bytes · plaintext: <span className="redact">unreadable</span>
          </p>
        )}
      </div>

      <div className="cipher__client cipher__client--b">
        <p className="tag">Client B · decrypts locally</p>
        <p className="cipher__plain">{last?.plain ?? <span className="muted">waiting…</span>}</p>
        <div className="keyspace" aria-label="Key space: AES-128 has 2 to the 128 keys; DES has 2 to the 56.">
          <div>
            <span className="mono">AES 128-bit</span>
            <i style={{ width: '100%' }} />
          </div>
          <div>
            <span className="mono">DES 56-bit</span>
            <i style={{ width: `${(56 / 128) * 100}%` }} />
          </div>
          <p className="mono">
            Bars in bits. In keys, AES-128 has 2<sup>72</sup> ≈ 4.7 × 10<sup>21</sup> times more.
          </p>
        </div>
      </div>
      <p className="note cipher__note">
        Real WebCrypto encryption in your browser · fresh 16-byte IV per message here (CryptMe generated one per session) · DES is shown only as key
        space because browsers no longer ship it
      </p>
    </div>
  );
}
