import { useEffect, useState } from 'react';

const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

function milanNow() {
  const [h, m, s] = fmt.format(new Date()).split(':').map(Number);
  return { h, m, s };
}

function partOfDay(h: number) {
  if (h < 5) return 'night';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  if (h < 22) return 'evening';
  return 'night';
}

/** Live local time in Milan as a small instrument dial. */
export function MilanClock({ compact = false }: { compact?: boolean }) {
  const [t, setT] = useState(milanNow);
  useEffect(() => {
    const id = setInterval(() => setT(milanNow()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(t.h).padStart(2, '0');
  const mm = String(t.m).padStart(2, '0');
  const day = t.h >= 7 && t.h < 19;
  const a = (deg: number) => (deg - 90) * (Math.PI / 180);
  const hand = (deg: number, len: number) => ({ x2: 20 + Math.cos(a(deg)) * len, y2: 20 + Math.sin(a(deg)) * len });
  return (
    <div className={`clock ${compact ? 'clock--compact' : ''}`}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="18.5" className={day ? 'clock__face' : 'clock__face clock__face--night'} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="20" y1="3" x2="20" y2={i % 3 ? 5 : 7} transform={`rotate(${i * 30} 20 20)`} className="clock__tick" />
        ))}
        <line x1="20" y1="20" {...hand((t.h % 12) * 30 + t.m / 2, 9)} className="clock__hand" />
        <line x1="20" y1="20" {...hand(t.m * 6, 13)} className="clock__hand" />
        <line x1="20" y1="20" {...hand(t.s * 6, 15)} className="clock__sec" />
      </svg>
      <p>
        <span className="mono">{hh}:{mm}</span> in Milan
        <br />
        <span className="muted">it’s {partOfDay(t.h)} there</span>
      </p>
    </div>
  );
}
