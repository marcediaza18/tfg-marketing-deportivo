import { api } from './client';

export interface Athlete {
  _id: string;
  fullName: string;
  birthDate?: string;
  nationality?: string;
  position?: string;
  preferredFoot?: 'izquierdo' | 'derecho' | 'ambidiestro';
  heightCm?: number;
  weightKg?: number;
  currentClub?: string;
  marketValueEUR?: number;
  status: 'prospecto' | 'en_seguimiento' | 'contactado' | 'firmado' | 'descartado';
  tags: string[];
  notes?: string;
  discoveredAtTour?: { _id: string; name: string } | string | null;
  discoveredAtStopIdx?: number;
  averageRating?: number;
  createdAt: string;
}

export async function listAthletes(params?: { q?: string; status?: string; tour?: string }): Promise<{ items: Athlete[]; total: number }> {
  return (await api.get('/athletes', { params })).data;
}

export async function getAthlete(id: string): Promise<Athlete> {
  return (await api.get(`/athletes/${id}`)).data;
}

export async function createAthlete(payload: Partial<Athlete> & { discoveredAtTour?: string }): Promise<Athlete> {
  return (await api.post('/athletes', payload)).data;
}

export async function updateAthlete(id: string, payload: Partial<Athlete> & { discoveredAtTour?: string }): Promise<Athlete> {
  return (await api.put(`/athletes/${id}`, payload)).data;
}

export async function deleteAthlete(id: string): Promise<void> {
  await api.delete(`/athletes/${id}`);
}
