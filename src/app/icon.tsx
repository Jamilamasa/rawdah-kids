import { ImageResponse } from 'next/og';

export const contentType = 'image/png';
export const size = {
  width: 512,
  height: 512,
};

export default function Icon() {
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
          fontSize: 220,
          fontWeight: 700,
        }}
      >
        🌿
      </div>
    ),
    size
  );
}
