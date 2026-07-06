export interface Table {
  id: number;
  number: number;
  seats: number;
  token: string;
  qrCodeUrl: string;
  qrLink: string;
}

export const generateTableToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

export const tables: Table[] = Array.from({ length: 20 }, (_, i) => {
  const nextNum = i + 1;
  // Use a predictable token for initial mock data so it survives page refreshes
  const token = `table_${nextNum}_secure_mock_token_xyz`;
  return {
    id: nextNum,
    number: nextNum,
    seats: [2, 4, 6][i % 3], // Make seats predictable too instead of Math.random
    token,
    qrCodeUrl: `${BASE_URL}/order/${token}`,
    qrLink: `${BASE_URL}/order/${token}`,
  };
});