import api from '@/lib/api';

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await api.get('/health');
    return res.status === 200;
  } catch {
    return false;
  }
}
