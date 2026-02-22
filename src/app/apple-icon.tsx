import { ImageResponse } from 'next/og';

export const contentType = 'image/png';
export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
          color: 'white',
          fontSize: 82,
          fontWeight: 700,
        }}
      >
        🌿
      </div>
    ),
    size
  );
}
