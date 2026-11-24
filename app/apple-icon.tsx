import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const c = (bg: string) => ({ width: 62, height: 62, background: bg });
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#f3f1ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={c('#111317')} />
            <div style={c('#111317')} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={c('#111317')} />
            <div style={c('#0a6b4b')} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
