import { ImageResponse } from 'next/og';

// Simple wordmark on a solid field, kept inside a safe zone so it still
// reads correctly once OSes crop it into a maskable shape.
export function renderPwaIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#166534',
        }}
      >
        <div
          style={{
            display: 'flex',
            color: '#ffffff',
            fontSize: size * 0.42,
            fontWeight: 700,
            letterSpacing: -size * 0.01,
          }}
        >
          CR
        </div>
        <div
          style={{
            display: 'flex',
            width: size * 0.34,
            height: size * 0.06,
            borderRadius: size,
            background: '#fde68a',
            marginTop: size * 0.06,
          }}
        />
      </div>
    ),
    { width: size, height: size },
  );
}
