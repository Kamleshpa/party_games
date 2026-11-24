import { useState } from 'react';

// Smart-TV browsers often lack a colour emoji font, so the TV renders emoji as Twemoji images.
let useImages = false;
export function setEmojiImages(on: boolean) {
  useImages = on;
}

const BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/';

export function twemojiUrl(e: string): string {
  const cps: string[] = [];
  const hasZwj = e.indexOf('‍') >= 0;
  for (const ch of Array.from(e)) {
    const cp = ch.codePointAt(0)!;
    if (!hasZwj && cp === 0xfe0f) continue;
    cps.push(cp.toString(16));
  }
  return BASE + cps.join('-') + '.svg';
}

export function Emo({ e, size, className }: { e: string; size?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  const cls = 'emo' + (className ? ' ' + className : '');
  if (!useImages || broken) {
    return (
      <span className={cls} style={size ? { fontSize: size * 0.9, width: size, height: size, lineHeight: size + 'px' } : undefined}>
        {e}
      </span>
    );
  }
  return (
    <img
      className={cls}
      src={twemojiUrl(e)}
      alt={e}
      width={size}
      height={size}
      draggable={false}
      onError={() => setBroken(true)}
    />
  );
}
